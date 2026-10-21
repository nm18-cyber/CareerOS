import { AuthShell, param, type AuthSearchParams } from "../../components/auth-shell";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: AuthSearchParams }) {
  const params = await searchParams;
  return <AuthShell eyebrow="ACCOUNT RECOVERY" title={<>Let’s get you<br/><em>back in.</em></>} intro="Enter your account email and we’ll send you a link to choose a new password." message={param(params, "error") || param(params, "notice")} footer={<a href="/login">← Return to sign in</a>}>
    <form className="auth-form" method="post" action="/auth/forgot"><label>Email<input type="email" name="email" autoComplete="email" required/></label><button className="button button-yellow auth-primary" type="submit">Send reset link <span>→</span></button></form>
  </AuthShell>;
}
