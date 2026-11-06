import { auth } from "../../../lib/auth/server";
import { appOrigin, authRedirect, formText } from "../../../lib/auth-redirect";
import { safeReturnPath } from "../../../lib/auth-path";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = formText(form, "email");
  const password = String(form.get("password") ?? "");
  const fullName = formText(form, "full_name").slice(0, 160);
  const returnTo = safeReturnPath(form.get("return_to"));
  const back = (error: string) => authRedirect(request, "/signup", { error, return_to: returnTo });

  if (!email || !password) return back("missing");
  if (password.length < 8) return back("weak");
  if (!auth) return back("unconfigured");

  const { data, error } = await auth.signUp.email({
    email,
    password,
    name: fullName || email.split("@")[0],
    callbackURL: new URL(returnTo, appOrigin(request)).toString(),
  });

  if (error) {
    if (error.code?.startsWith("USER_ALREADY_EXISTS")) return back("exists");
    if (error.code === "PASSWORD_TOO_SHORT" || error.code === "PASSWORD_TOO_LONG") return back("weak");
    return back("failed");
  }

  // With email verification off, Neon Auth signs the user in right away.
  if (data?.token) return authRedirect(request, returnTo);

  // Otherwise Neon Auth has emailed a 6-digit code.
  return authRedirect(request, "/verify-email", { email, return_to: returnTo });
}
