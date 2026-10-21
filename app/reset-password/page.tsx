import { redirect } from "next/navigation";
import { AuthShell, Field, param, type AuthSearchParams } from "../../components/auth-shell";
import { currentUser } from "../../lib/access";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({ searchParams }: { searchParams: AuthSearchParams }) {
  const params = await searchParams;
  if (!(await currentUser())) redirect("/forgot-password?error=link");
  return <AuthShell label="Account recovery" title="Choose a new password." intro="Pick something you haven’t used here before." message={param(params, "error")} footer={<a href="/home">Skip for now</a>}>
    <form className="auth-form" method="post" action="/auth/reset">
      <Field label="New password" type="password" name="password" autoComplete="new-password" minLength={8} required hint="At least 8 characters." />
      <button className="button button-block" type="submit">Update password</button>
    </form>
  </AuthShell>;
}
