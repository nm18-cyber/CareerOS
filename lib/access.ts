import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../app/chatgpt-auth";

export async function currentUser() {
  const user = await getChatGPTUser();
  if (!user) return null;
  const isConfiguredAdmin = !!env.ADMIN_EMAIL && user.email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase();
  await env.DB?.prepare(`INSERT INTO users (id,email,display_name,auth_provider,role) VALUES (?,?,?,'chatgpt',?)
    ON CONFLICT(id) DO UPDATE SET email=excluded.email, display_name=excluded.display_name, role=CASE WHEN ?='1' THEN 'ADMIN' ELSE users.role END, updated_at=CURRENT_TIMESTAMP`)
    .bind(user.userId,user.email,user.fullName ?? user.email,isConfiguredAdmin?"ADMIN":"USER",isConfiguredAdmin?"1":"0").run();
  const record = await env.DB?.prepare("SELECT role,status FROM users WHERE id=?").bind(user.userId).first<{role:string;status:string}>();
  if (record?.status === "SUSPENDED") return null;
  return { ...user, role: record?.role ?? (isConfiguredAdmin ? "ADMIN" : "USER") };
}

export async function requireAdmin() {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}
