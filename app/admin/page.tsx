import { currentUser, requireAdmin } from "../../lib/access";
import AdminClient from "./panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) { const visitor = await currentUser(); return <main className="admin-gate"><a className="brand" href="/"><span className="brand-mark">✳</span>career<span className="brand-os">os</span></a><div><span className="eyebrow">CONTROL ROOM</span><h1>Admin access required</h1><p>Admin tools let you manage users, scoring settings, and career resources.</p><small>To make this browser the admin, set the runtime variable <code>ADMIN_USER_ID</code> to <code>{visitor?.guestId ?? "unavailable"}</code>, then reload this page.</small></div></main>; }
  return <AdminClient adminName={admin.fullName ?? admin.email} />;
}
