import { NextResponse } from "next/server";
import { auth } from "../../../lib/auth/server";
import { appOrigin, authRedirect, formText } from "../../../lib/auth-redirect";
import { safeReturnPath } from "../../../lib/auth-path";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const form = await request.formData();
  const returnTo = safeReturnPath(form.get("return_to"));
  const back = (error: string) => authRedirect(request, "/login", { error, return_to: returnTo });

  if (formText(form, "provider") !== "google") return back("oauth");
  if (!auth) return back("unconfigured");

  const origin = appOrigin(request);
  const { data, error } = await auth.signIn.social({
    provider: "google",
    callbackURL: new URL(returnTo, origin).toString(),
    errorCallbackURL: new URL(`/login?error=oauth&return_to=${encodeURIComponent(returnTo)}`, origin).toString(),
    disableRedirect: true,
  });

  if (error || !data?.url) return back("oauth");

  // Off to Google via Neon Auth. It returns to callbackURL with a one-time verifier,
  // which middleware.ts exchanges for the session cookie.
  return NextResponse.redirect(data.url, 303);
}
