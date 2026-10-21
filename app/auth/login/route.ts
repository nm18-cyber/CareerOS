import { authRedirect, formText } from "../../../lib/auth-redirect";
import { safeReturnPath } from "../../../lib/auth-path";
import { supabaseServer } from "../../../lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = formText(form, "email");
  const password = String(form.get("password") ?? "");
  const returnTo = safeReturnPath(form.get("return_to"));
  const back = (error: string) =>
    authRedirect(request, "/login", { error, return_to: returnTo });

  if (!email || !password) {
    return back("missing");
  }

  const client = await supabaseServer();

  if (!client) {
    return back("unconfigured");
  }

  const { error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "email_not_confirmed") return back("unconfirmed");
    if (error.code === "invalid_credentials") return back("invalid");
    return back("failed");
  }

  return authRedirect(request, returnTo);
}
