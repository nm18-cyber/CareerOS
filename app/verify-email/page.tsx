import { redirect } from "next/navigation";
import { AuthShell, Field, param, type AuthSearchParams } from "../../components/auth-shell";
import { safeReturnPath } from "../../lib/auth-path";

export const dynamic = "force-dynamic";

// After sign-up (or signing in before confirming), Neon Auth emails a 6-digit code.
export default async function VerifyEmailPage({ searchParams }: { searchParams: AuthSearchParams }) {
  const params = await searchParams;
  const email = param(params, "email");
  const returnTo = safeReturnPath(param(params, "return_to"));
  if (!email) redirect("/signup");
  return <AuthShell label="Confirm your email" title="Check your inbox." intro={`We sent a 6-digit code to ${email}. Enter it to finish setting up your account.`} message={param(params, "error") || param(params, "notice") || "code-sent"} footer={<>Wrong address? <a href={`/signup?return_to=${encodeURIComponent(returnTo)}`}>Start again</a></>}>
    <form className="auth-form" method="post" action="/auth/verify">
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="return_to" value={returnTo} />
      <Field label="Verification code" type="text" name="otp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required />
      <button className="button button-block" type="submit">Confirm email</button>
    </form>
    <form className="auth-form" method="post" action="/auth/verify">
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="return_to" value={returnTo} />
      <input type="hidden" name="action" value="resend" />
      <button className="outline-button button-block" type="submit">Send a new code</button>
    </form>
  </AuthShell>;
}
