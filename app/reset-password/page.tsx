import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell, param, type AuthSearchParams } from "../../components/auth-shell";
import { currentUser } from "../../lib/access";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({ searchParams }: { searchParams: AuthSearchParams }) {
  const params = await searchParams;
  if (!(await currentUser())) redirect("/forgot-password?error=link");
  return <AuthShell eyebrow="ACCOUNT RECOVERY" title={<>Choose a<br/><em>new password.</em></>} intro="Pick a password with at least 8 characters." message={param(params, "error")} footer={<Link href="/home">Skip for now →</Link>}>
    <form className="auth-form" method="post" action="/auth/reset"><label>New password<input type="password" name="password" autoComplete="new-password" minLength={8} required/></label><button className="button button-yellow auth-primary" type="submit">Update password <span>→</span></button></form>
  </AuthShell>;
}
