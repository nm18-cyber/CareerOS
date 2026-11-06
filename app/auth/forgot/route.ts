import { auth, emailOtp } from "../../../lib/auth/server";
import { authRedirect, formText } from "../../../lib/auth-redirect";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const email = formText(await request.formData(), "email");

  if (!email) return authRedirect(request, "/forgot-password", { error: "missing" });
  if (!auth) return authRedirect(request, "/forgot-password", { error: "unconfigured" });

  // Neon Auth emails a 6-digit reset code. Same response whether or not the account exists,
  // so emails can't be probed.
  await emailOtp!.sendVerificationOtp({ email, type: "forget-password" });

  return authRedirect(request, "/reset-password", { email, notice: "sent" });
}
