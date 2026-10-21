import Link from "next/link";
import { requireAdmin } from "../../lib/access";
import AdminClient from "./panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) return <main className="admin-gate"><Link className="brand" href="/"><span className="brand-mark">✳</span>career<span className="brand-os">os</span></Link><div><span className="eyebrow">CONTROL ROOM</span><h1>Admin access required</h1><p>Sign in with the configured admin account to manage users, scoring settings, and career resources.</p><a className="button button-yellow" href="/login?return_to=%2Fadmin">Sign in securely →</a><small>To grant the first admin role, configure the Site runtime variable <code>ADMIN_USER_ID</code> to your Supabase user ID, then sign in once.</small></div></main>;
  return <AdminClient adminName={admin.fullName ?? admin.email} />;
}
