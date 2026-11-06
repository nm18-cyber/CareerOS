import { currentUser, requireAdmin } from "../../lib/access";
import AdminClient from "./panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) { const visitor = await currentUser(); return <main className="admin-gate"><a className="brand" href="/"><span className="brand-mark">✳</span>career<span className="brand-os">os</span></a><div><span className="eyebrow">CONTROL ROOM</span><h1>Admin access required</h1><p>Admin tools let you manage users, scoring settings, and career resources.</p>{visitor ? <small>To make this account the admin, set the Worker variable <code>ADMIN_EMAIL</code> to <code>{visitor.email}</code> (verified email) or <code>ADMIN_USER_ID</code> to <code>{visitor.neonUserId}</code>, then reload this page.</small> : <a className="button button-yellow" href="/login?return_to=%2Fadmin">Sign in securely →</a>}</div></main>; }
  return <AdminClient adminName={admin.fullName ?? admin.email} />;
}
