import { redirect } from "next/navigation";
import { AuthShell, Field, SocialButtons, param, type AuthSearchParams } from "../../components/auth-shell";
import { currentUser } from "../../lib/access";
import { safeReturnPath } from "../../lib/auth-path";

export const dynamic = "force-dynamic";

export default async function SignupPage({ searchParams }: { searchParams: AuthSearchParams }) {
  const params = await searchParams;
  const returnTo = safeReturnPath(param(params, "return_to"));
  if (await currentUser()) redirect(returnTo);
  return <AuthShell label="Create account" title="Start with a clearer story." intro="A free, private workspace for your resumes and job search." message={param(params, "error")} footer={<>Already have an account? <a href={`/login?return_to=${encodeURIComponent(returnTo)}`}>Sign in</a></>}>
    <form className="auth-form" method="post" action="/auth/signup">
      <input type="hidden" name="return_to" value={returnTo} />
      <Field label="Full name" type="text" name="full_name" autoComplete="name" maxLength={160} hint="Optional — shown on your dashboard." />
      <Field label="Email" type="email" name="email" autoComplete="email" required />
      <Field label="Password" type="password" name="password" autoComplete="new-password" minLength={8} required hint="At least 8 characters." />
      <button className="button button-block" type="submit">Create account</button>
    </form>
    <SocialButtons returnTo={returnTo} divider="or sign up with" />
  </AuthShell>;
}
