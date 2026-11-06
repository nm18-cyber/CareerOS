import { auth, emailOtp, tooManyAttempts } from "../../../lib/auth/server";
import { authRedirect, formText } from "../../../lib/auth-redirect";
import { safeReturnPath } from "../../../lib/auth-path";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = formText(form, "email");
  const otp = formText(form, "otp");
  const returnTo = safeReturnPath(form.get("return_to"));
  const back = (params: Record<string, string>) => authRedirect(request, "/verify-email", { email, return_to: returnTo, ...params });

  if (!email) return authRedirect(request, "/signup", { return_to: returnTo });
  if (!auth) return authRedirect(request, "/login", { error: "unconfigured" });

  if (formText(form, "action") === "resend") {
    await emailOtp!.sendVerificationOtp({ email, type: "email-verification" });
    return back({ notice: "code-resent" });
  }

  if (!/^\d{6}$/.test(otp)) return back({ error: "code" });

  const { data, error } = await emailOtp!.verifyEmail({ email, otp });

  if (error) return back({ error: tooManyAttempts(error) ? "attempts" : "code" });

  // Neon Auth signs the user in after verification; if it didn't, ask them to sign in.
  if (data?.token) return authRedirect(request, returnTo);

  return authRedirect(request, "/login", { notice: "verified", return_to: returnTo });
}
