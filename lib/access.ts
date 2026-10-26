import { env } from "cloudflare:workers";
import { cookies } from "next/headers";
import { GUEST_COOKIE, isGuestId } from "./guest";

export async function currentUser() {
  const jar = await cookies();
  const guestId = jar.get(GUEST_COOKIE)?.value;

  if (!isGuestId(guestId)) {
    return null;
  }

  if (!env.DB) {
    throw new Error("D1 binding DB is missing");
  }

  const userId = `guest:${guestId}`;
  const email = `${guestId}@guest.invalid`;
  const displayName = "Guest";

  const admin = env.ADMIN_USER_ID === guestId;

  await env.DB.prepare(`
    INSERT INTO users (
      id,
      email,
      display_name,
      auth_provider,
      role
    )
    VALUES (?, ?, ?, 'guest', ?)

    ON CONFLICT(id) DO UPDATE SET
      role = CASE
        WHEN ? = '1' THEN 'ADMIN'
        ELSE users.role
      END,
      updated_at = CURRENT_TIMESTAMP
  `)
    .bind(
      userId,
      email,
      displayName,
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
    guestId,
    email,
    fullName: displayName as string | null,
    displayName,
    role: record.role,
  };
}

export async function requireUser() {
  const user = await currentUser();

  if (!user) {
    throw new Error("Workspace unavailable");
  }

  return user;
}

export async function requireAdmin() {
  const user = await currentUser();

  return user?.role === "ADMIN" ? user : null;
}
