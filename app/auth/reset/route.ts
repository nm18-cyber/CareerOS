import { authRedirect } from "../../../lib/auth-redirect";
import { supabaseServer } from "../../../lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const password = String((await request.formData()).get("password") ?? "");

  if (password.length < 8) {
    return authRedirect(request, "/reset-password", { error: "weak" });
  }

  const client = await supabaseServer();

  if (!client) {
    return authRedirect(request, "/login", { error: "unconfigured" });
  }

  const { error } = await client.auth.updateUser({ password });

  if (error) {
    return authRedirect(request, "/reset-password", {
      error: error.code === "weak_password" ? "weak" : "failed",
    });
  }

  return authRedirect(request, "/home");
}
