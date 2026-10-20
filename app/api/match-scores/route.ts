import { env } from "cloudflare:workers";
import { currentUser } from "../../../lib/access";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  if (!env.DB) return Response.json({ error: "Analytics storage unavailable" }, { status: 503 });
  const body = await request.json() as { resumeId?: string; score?: number; title?: string; company?: string };
  const score = Math.round(Number(body.score));
  if (!body.resumeId || !Number.isFinite(score) || score < 0 || score > 100) return Response.json({ error: "A resume and score from 0 to 100 are required" }, { status: 400 });
  const owned = await env.DB.prepare("SELECT id FROM resumes WHERE id=? AND user_id=?").bind(body.resumeId, user.userId).first();
  if (!owned) return Response.json({ error: "Resume not found" }, { status: 404 });
  await env.DB.prepare(`INSERT INTO resume_match_scores (id,user_id,resume_id,score,title,company)
    VALUES (?,?,?,?,?,?) ON CONFLICT(resume_id) DO UPDATE SET user_id=excluded.user_id,score=excluded.score,title=excluded.title,company=excluded.company,created_at=CURRENT_TIMESTAMP`)
    .bind(crypto.randomUUID(), user.userId, body.resumeId, score, String(body.title ?? "").slice(0,120), String(body.company ?? "").slice(0,120)).run();
  return Response.json({ ok: true });
}
