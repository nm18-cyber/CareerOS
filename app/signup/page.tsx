import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell, param, type AuthSearchParams } from "../../components/auth-shell";
import { currentUser } from "../../lib/access";
import { safeReturnPath } from "../../lib/auth-path";

export const dynamic = "force-dynamic";

export default async function SignupPage({ searchParams }: { searchParams: AuthSearchParams }) {
  const params = await searchParams;
  const returnTo = safeReturnPath(param(params, "return_to"));
  if (await currentUser()) redirect(returnTo);
  return <AuthShell eyebrow="START WITH CLARITY" title={<>Your next move<br/><em>starts here.</em></>} intro="Create a secure workspace to build your resume and organize your search. Resume data is private to your account." message={param(params, "error")} footer={<>Already a member? <Link href={`/login?return_to=${encodeURIComponent(returnTo)}`}>Sign in</Link></>}>
    <form className="auth-form" method="post" action="/auth/signup"><input type="hidden" name="return_to" value={returnTo}/><label>Full name<input type="text" name="full_name" autoComplete="name" maxLength={160}/></label><label>Email<input type="email" name="email" autoComplete="email" required/></label><label>Password<input type="password" name="password" autoComplete="new-password" minLength={8} required/></label><button className="button button-yellow auth-primary" type="submit">Create account <span>→</span></button></form>
  </AuthShell>;
}
