import { env } from "cloudflare:workers";
import { supabaseServer } from "./supabase-server";

export async function currentUser() {
  const client = await supabaseServer();

  if (!client) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (
    error ||
    !user?.email ||
    !user.email_confirmed_at
  ) {
    return null;
  }

  if (!env.DB) {
    throw new Error("D1 binding DB is missing");
  }

  const userId = `supabase:${user.id}`;

  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.slice(0, 160)
      : null;

  const admin = env.ADMIN_USER_ID === user.id;

  await env.DB.prepare(`
    INSERT INTO users (
      id,
      email,
      display_name,
      auth_provider,
      role
    )
    VALUES (?, ?, ?, 'supabase', ?)

    ON CONFLICT(id) DO UPDATE SET
      email = excluded.email,
      display_name = excluded.display_name,
      role = CASE
        WHEN ? = '1' THEN 'ADMIN'
        ELSE users.role
      END,
      updated_at = CURRENT_TIMESTAMP
  `)
    .bind(
      userId,
      user.email,
      fullName ?? user.email,
      admin ? "ADMIN" : "USER",
      admin ? "1" : "0",
    )
    .run();

  const record = await env.DB
    .prepare("SELECT role, status FROM users WHERE id = ?")
    .bind(userId)
    .first<{
      role: string;
      status: string;
    }>();

  if (!record || record.status !== "ACTIVE") {
    return null;
  }

  return {
    userId,
    email: user.email,
    fullName,
    displayName: fullName ?? user.email,
    role: record.role,
  };
}

export async function requireAdmin() {
  const user = await currentUser();

  return user?.role === "ADMIN" ? user : null;
}
