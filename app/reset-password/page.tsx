import { redirect } from "next/navigation";
import { AuthShell, Field, param, type AuthSearchParams } from "../../components/auth-shell";

export const dynamic = "force-dynamic";

// Reached from /forgot-password after Neon Auth emails a 6-digit reset code.
export default async function ResetPasswordPage({ searchParams }: { searchParams: AuthSearchParams }) {
  const params = await searchParams;
  const email = param(params, "email");
  if (!email) redirect("/forgot-password");
  return <AuthShell label="Account recovery" title="Choose a new password." intro={`If an account exists for ${email}, we’ve emailed it a 6-digit code.`} message={param(params, "error") || param(params, "notice")} footer={<>Didn’t get a code? <a href="/forgot-password">Send another</a></>}>
    <form className="auth-form" method="post" action="/auth/reset">
      <input type="hidden" name="email" value={email} />
      <Field label="Reset code" type="text" name="otp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required />
      <Field label="New password" type="password" name="password" autoComplete="new-password" minLength={8} required hint="At least 8 characters." />
      <button className="button button-block" type="submit">Update password</button>
    </form>
  </AuthShell>;
}
