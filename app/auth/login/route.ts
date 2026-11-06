import { auth, emailOtp } from "../../../lib/auth/server";
import { authRedirect, formText } from "../../../lib/auth-redirect";
import { safeReturnPath } from "../../../lib/auth-path";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = formText(form, "email");
  const password = String(form.get("password") ?? "");
  const returnTo = safeReturnPath(form.get("return_to"));
  const back = (error: string) => authRedirect(request, "/login", { error, return_to: returnTo });

  if (!email || !password) return back("missing");
  if (!auth) return back("unconfigured");

  const { error } = await auth.signIn.email({ email, password });

  if (error) {
    // The SDK reports Supabase-style codes (Better Auth EMAIL_NOT_VERIFIED → email_not_confirmed).
    if (error.code === "email_not_confirmed") {
      await emailOtp!.sendVerificationOtp({ email, type: "email-verification" });
      return authRedirect(request, "/verify-email", { email, return_to: returnTo });
    }
    if (error.code === "invalid_credentials" || error.status === 401) return back("invalid");
    return back("failed");
  }

  return authRedirect(request, returnTo);
}
