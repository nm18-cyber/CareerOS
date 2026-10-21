import { NextResponse } from "next/server";
import { authConfig } from "../../../lib/auth-config";
import { OAUTH_PROVIDERS, type OAuthProvider } from "../../../lib/auth-providers";
import { authRedirect, formText } from "../../../lib/auth-redirect";
import { safeReturnPath } from "../../../lib/auth-path";
import { supabaseServer } from "../../../lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const form = await request.formData();
  const provider = formText(form, "provider");
  const returnTo = safeReturnPath(form.get("return_to"));
  const back = (error: string) =>
    authRedirect(request, "/login", { error, return_to: returnTo });

  if (!(provider in OAUTH_PROVIDERS)) {
    return back("oauth");
  }

  const config = authConfig();
  const client = await supabaseServer();

  if (!config || !client) {
    return back("unconfigured");
  }

  const callback = new URL("/auth/callback", config.origin);
  callback.searchParams.set("return_to", returnTo);

  const { data, error } = await client.auth.signInWithOAuth({
    provider: OAUTH_PROVIDERS[provider as OAuthProvider],
    options: { redirectTo: callback.toString(), skipBrowserRedirect: true },
  });

  if (error || !data.url) {
    return back("oauth");
  }

  // Off to Google / LinkedIn; they send the user back to /auth/callback.
  return NextResponse.redirect(data.url, 303);
}
