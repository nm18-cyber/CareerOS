import { auth, emailOtp } from "../../../lib/auth/server";
import { authRedirect, formText } from "../../../lib/auth-redirect";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = formText(form, "email");
  const otp = formText(form, "otp");
  const password = String(form.get("password") ?? "");
  const back = (error: string) => authRedirect(request, "/reset-password", { email, error });

  if (!email) return authRedirect(request, "/forgot-password", { error: "missing" });
  if (!/^\d{6}$/.test(otp)) return back("code");
  if (password.length < 8) return back("weak");
  if (!auth) return authRedirect(request, "/login", { error: "unconfigured" });

  const { error } = await emailOtp!.resetPassword({ email, otp, password });

  if (error) {
    if (error.code === "PASSWORD_TOO_SHORT") return back("weak");
    if (error.code === "TOO_MANY_ATTEMPTS") return back("attempts");
    return back("code");
  }

  return authRedirect(request, "/login", { notice: "password-updated" });
}
