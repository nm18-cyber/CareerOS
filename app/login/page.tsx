import { redirect } from "next/navigation";
import { AuthShell, Field, SocialButtons, param, type AuthSearchParams } from "../../components/auth-shell";
import { currentUser } from "../../lib/access";
import { safeReturnPath } from "../../lib/auth-path";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: AuthSearchParams }) {
  const params = await searchParams;
  const returnTo = safeReturnPath(param(params, "return_to"));
  if (await currentUser()) redirect(returnTo);
  return <AuthShell label="Sign in" title="Welcome back." intro="Pick up where you left off with your resumes and applications." message={param(params, "error") || param(params, "notice")} footer={<>New to CareerOS? <a href={`/signup?return_to=${encodeURIComponent(returnTo)}`}>Create an account</a></>}>
    <form className="auth-form" method="post" action="/auth/login">
      <input type="hidden" name="return_to" value={returnTo} />
      <Field label="Email" type="email" name="email" autoComplete="email" required />
      <div className="auth-password">
        <Field label="Password" type="password" name="password" autoComplete="current-password" required />
        <a className="auth-forgot" href="/forgot-password">Forgot password?</a>
      </div>
      <button className="button button-block" type="submit">Sign in</button>
    </form>
    <SocialButtons returnTo={returnTo} divider="or sign in with" />
  </AuthShell>;
}
