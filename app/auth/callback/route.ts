import type { EmailOtpType } from "@supabase/supabase-js";
import { authRedirect } from "../../../lib/auth-redirect";
import { safeReturnPath } from "../../../lib/auth-path";
import { supabaseServer } from "../../../lib/supabase-server";

export const dynamic = "force-dynamic";

// Landing point for links in Supabase emails (sign-up confirmation, password reset).
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const returnTo = safeReturnPath(params.get("return_to"));
  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;

  const client = await supabaseServer();

  if (!client) {
    return authRedirect(request, "/login", { error: "unconfigured" });
  }

  const { error } = code
    ? await client.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await client.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("Missing code") };

  if (error) {
    return authRedirect(request, "/login", { error: "link" });
  }

  return authRedirect(request, returnTo);
}
