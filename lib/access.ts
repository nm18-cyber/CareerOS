import { env } from "cloudflare:workers";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth/server";
import { safeReturnPath } from "./auth-path";
import { DB, type Database } from "./db";
import { GUEST_COOKIE, isGuestId } from "./guest";

export type AppUser = {
  userId: string;
  neonUserId: string;
  email: string;
  fullName: string | null;
  displayName: string;
  role: string;
};

// Tables whose rows belong to one user. Used to hand data over to a Neon Auth account.
const OWNED_TABLES = [
  "resumes",
  "job_applications",
  "resume_match_scores",
  "application_workspace",
  "companies",
  "contacts",
  "resume_versions",
  "chat_sessions",
] as const;

// Statements that move every row owned by `from` to `to`, then remove the old user record.
function moveUserData(db: Database, from: string, to: string) {
  return [
    db.prepare("DELETE FROM user_profiles WHERE user_id=? AND EXISTS (SELECT 1 FROM user_profiles WHERE user_id=?)").bind(from, to),
    db.prepare("UPDATE user_profiles SET user_id=? WHERE user_id=?").bind(to, from),
    ...OWNED_TABLES.map((table) => db.prepare(`UPDATE ${table} SET user_id=? WHERE user_id=?`).bind(to, from)),
    db.prepare("DELETE FROM users WHERE id=?").bind(from),
  ];
}

const UPSERT_USER = `
  INSERT INTO users (id, email, display_name, auth_provider, role)
  VALUES (?, ?, ?, 'neon', ?)
  ON CONFLICT(id) DO UPDATE SET
    email = excluded.email,
    display_name = excluded.display_name,
    role = CASE WHEN ? = '1' THEN 'ADMIN' ELSE users.role END,
    updated_at = CURRENT_TIMESTAMP`;

export async function currentUser(): Promise<AppUser | null> {
  if (!auth) {
    return null;
  }

  const { data } = await auth.getSession();
  const user = data?.user;

  if (!user?.id || !user.email) {
    return null;
  }

  if (!DB) {
    throw new Error("Database unavailable: set DATABASE_URL");
  }

  const userId = `neon:${user.id}`;
  const email = user.email.toLowerCase();
  const fullName = typeof user.name === "string" && user.name.trim() ? user.name.trim().slice(0, 160) : null;
  const admin =
    env.ADMIN_USER_ID === user.id ||
    (!!env.ADMIN_EMAIL && env.ADMIN_EMAIL.trim().toLowerCase() === email && user.emailVerified === true);

  // An account from before Neon Auth (Supabase era) with the same email: hand its data over,
  // but only once Neon Auth has verified the address, so nobody can claim it by typing an email.
  const legacy = await DB.prepare("SELECT id FROM users WHERE email=? AND id<>?").bind(email, userId).first<{ id: string }>();

  if (legacy && user.emailVerified !== true) {
    return null;
  }

  const upsert = DB.prepare(UPSERT_USER).bind(userId, email, fullName ?? email, admin ? "ADMIN" : "USER", admin ? "1" : "0");

  await DB.batch(
    legacy
      ? [
          DB.prepare("UPDATE users SET email=? WHERE id=?").bind(`moved-${legacy.id}@legacy.invalid`, legacy.id),
          upsert,
          ...moveUserData(DB, legacy.id, userId),
        ]
      : [upsert],
  );

  // Work done as an anonymous guest (before sign-in existed) moves into the account once.
  const guestId = (await cookies()).get(GUEST_COOKIE)?.value;

  if (isGuestId(guestId) && (await DB.prepare("SELECT id FROM users WHERE id=?").bind(`guest:${guestId}`).first())) {
    await DB.batch(moveUserData(DB, `guest:${guestId}`, userId));
  }

  const record = await DB.prepare("SELECT role, status FROM users WHERE id=?").bind(userId).first<{ role: string; status: string }>();

  if (!record || record.status !== "ACTIVE") {
    return null;
  }

  return {
    userId,
    neonUserId: user.id,
    email,
    fullName,
    displayName: fullName ?? email,
    role: record.role,
  };
}

// For pages: signed-out visitors are sent to /login and brought back afterwards.
export async function requireUser(): Promise<AppUser> {
  const user = await currentUser();

  if (user) {
    return user;
  }

  const path = (await headers()).get("x-careeros-path");

  redirect(`/login?return_to=${encodeURIComponent(safeReturnPath(path))}`);
}

export async function requireAdmin() {
  const user = await currentUser();

  return user?.role === "ADMIN" ? user : null;
}
