import { authRedirect } from "../../lib/auth-redirect";
import { supabaseServer } from "../../lib/supabase-server";

export const dynamic = "force-dynamic";

async function signOut(request: Request) {
  const client = await supabaseServer();

  await client?.auth.signOut({ scope: "local" });

  return authRedirect(request, "/login", { notice: "signed-out" });
}

export const GET = signOut;
export const POST = signOut;
