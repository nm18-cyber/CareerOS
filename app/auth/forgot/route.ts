import { authConfig } from "../../../lib/auth-config";
import { authRedirect, formText } from "../../../lib/auth-redirect";
import { supabaseServer } from "../../../lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const email = formText(await request.formData(), "email");

  if (!email) {
    return authRedirect(request, "/forgot-password", { error: "missing" });
  }

  const config = authConfig();
  const client = await supabaseServer();

  if (!config || !client) {
    return authRedirect(request, "/forgot-password", { error: "unconfigured" });
  }

  const callback = new URL("/auth/callback", config.origin);
  callback.searchParams.set("return_to", "/reset-password");

  // Same response whether or not the account exists, so emails can't be probed.
  await client.auth.resetPasswordForEmail(email, { redirectTo: callback.toString() });

  return authRedirect(request, "/forgot-password", { notice: "sent" });
}
