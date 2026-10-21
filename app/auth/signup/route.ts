import { authConfig } from "../../../lib/auth-config";
import { authRedirect, formText } from "../../../lib/auth-redirect";
import { safeReturnPath } from "../../../lib/auth-path";
import { supabaseServer } from "../../../lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = formText(form, "email");
  const password = String(form.get("password") ?? "");
  const fullName = formText(form, "full_name").slice(0, 160);
  const returnTo = safeReturnPath(form.get("return_to"));
  const back = (error: string) =>
    authRedirect(request, "/signup", { error, return_to: returnTo });

  if (!email || !password) {
    return back("missing");
  }

  if (password.length < 8) {
    return back("weak");
  }

  const config = authConfig();
  const client = await supabaseServer();

  if (!config || !client) {
    return back("unconfigured");
  }

  const callback = new URL("/auth/callback", config.origin);
  callback.searchParams.set("return_to", returnTo);

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callback.toString(),
      data: fullName ? { full_name: fullName } : undefined,
    },
  });

  if (error) {
    return back(error.code === "weak_password" ? "weak" : "failed");
  }

  // With email confirmation turned off, Supabase signs the user in right away.
  if (data.session) {
    return authRedirect(request, returnTo);
  }

  return authRedirect(request, "/login", { notice: "check-email", return_to: returnTo });
}
