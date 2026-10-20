import { env } from "cloudflare:workers";
import { requireAdmin } from "../../../lib/access";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required" }, { status: 403 });
  if (!env.DB) return Response.json({ error: "Database unavailable" }, { status: 503 });
  const users = await env.DB.prepare("SELECT u.id,u.email,u.display_name,u.auth_provider,u.role,u.status,u.created_at,COALESCE(p.onboarding_json,'[]') AS onboarding_json,p.target_title FROM users u LEFT JOIN user_profiles p ON p.user_id=u.id ORDER BY u.created_at DESC LIMIT 200").all();
  const resources = await env.DB.prepare("SELECT COUNT(*) AS total FROM cms_resources").first();
  const count = await env.DB.prepare("SELECT COUNT(*) AS total FROM users").first();
  const setting = await env.DB.prepare("SELECT value FROM grader_settings WHERE key='thresholds'").first<{value:string}>();
  const aggregate = await env.DB.prepare("SELECT COUNT(*) AS total,COALESCE(ROUND(AVG(score)),0) AS average FROM resume_match_scores").first<{total:number;average:number}>();
  const distribution = await env.DB.prepare("SELECT CASE WHEN score<40 THEN '0–39' WHEN score<60 THEN '40–59' WHEN score<80 THEN '60–79' ELSE '80–100' END AS range,COUNT(*) AS count FROM resume_match_scores GROUP BY range").all<{range:string;count:number}>();
  const buckets = ["0–39","40–59","60–79","80–100"].map(range => ({ range, count: distribution.results?.find(item => item.range === range)?.count ?? 0 }));
  return Response.json({ users: users.results ?? [], userCount: count?.total ?? 0, resourceCount: resources?.total ?? 0, settings: setting?.value ?? '{"metricWeight":40,"actionWeight":30,"keywordWeight":30}', matchAnalytics: { total: aggregate?.total ?? 0, average: aggregate?.average ?? 0, buckets } });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required" }, { status: 403 });
  if (!env.DB) return Response.json({ error: "Database unavailable" }, { status: 503 });
  const body = await request.json() as { userId?: string; role?: string; status?: string };
  if (!body.userId || body.userId === admin.userId) return Response.json({ error: "Choose another user" }, { status: 400 });
  const role = body.role === "ADMIN" ? "ADMIN" : "USER";
  const status = body.status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE";
  await env.DB.prepare("UPDATE users SET role=?,status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(role,status,body.userId).run();
  return Response.json({ ok: true });
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required" }, { status: 403 });
  if (!env.DB) return Response.json({ error: "Database unavailable" }, { status: 503 });
  const body = await request.json() as { settings?: string };
  let parsed: Record<string, unknown>;
  try { parsed = JSON.parse(body.settings ?? "{}"); } catch { return Response.json({ error: "Settings must be valid JSON" }, { status: 400 }); }
  const safe = { metricWeight: Number(parsed.metricWeight), actionWeight: Number(parsed.actionWeight), keywordWeight: Number(parsed.keywordWeight) };
  if(Object.values(safe).some(x=>!Number.isFinite(x)||x<0||x>100)||safe.metricWeight+safe.actionWeight+safe.keywordWeight===0)return Response.json({error:"Weights must be between 0 and 100, with at least one positive weight."},{status:400});
  await env.DB.prepare("INSERT INTO grader_settings (key,value) VALUES ('thresholds',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP").bind(JSON.stringify(safe)).run();
  return Response.json({ settings: safe });
}
