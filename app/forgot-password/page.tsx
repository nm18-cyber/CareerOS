import { AuthShell, Field, param, type AuthSearchParams } from "../../components/auth-shell";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: AuthSearchParams }) {
  const params = await searchParams;
  return <AuthShell label="Account recovery" title="Reset your password." intro="Enter your account email and we’ll send a link to choose a new password." message={param(params, "error") || param(params, "notice")} footer={<>Remembered it? <a href="/login">Back to sign in</a></>}>
    <form className="auth-form" method="post" action="/auth/forgot">
      <Field label="Email" type="email" name="email" autoComplete="email" required />
      <button className="button button-block" type="submit">Send reset link</button>
    </form>
  </AuthShell>;
}
