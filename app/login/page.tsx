import { redirect } from "next/navigation";
import { AuthShell, param, type AuthSearchParams } from "../../components/auth-shell";
import { currentUser } from "../../lib/access";
import { safeReturnPath } from "../../lib/auth-path";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: AuthSearchParams }) {
  const params = await searchParams;
  const returnTo = safeReturnPath(param(params, "return_to"));
  if (await currentUser()) redirect(returnTo);
  return <AuthShell eyebrow="WELCOME BACK" title={<>Pick up where<br/><em>you left off.</em></>} intro="Sign in to return to your resumes and career workspace." message={param(params, "error") || param(params, "notice")} footer={<>New to CareerOS? <a href={`/signup?return_to=${encodeURIComponent(returnTo)}`}>Create an account</a></>}>
    <form className="auth-form" method="post" action="/auth/login"><input type="hidden" name="return_to" value={returnTo}/><label>Email<input type="email" name="email" autoComplete="email" required/></label><label>Password<input type="password" name="password" autoComplete="current-password" required/></label><div className="auth-link-row"><a href="/forgot-password">Forgot password?</a></div><button className="button button-yellow auth-primary" type="submit">Sign in <span>→</span></button></form>
  </AuthShell>;
}
