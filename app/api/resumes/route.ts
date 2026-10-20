import { env } from "cloudflare:workers";
import { currentUser } from "../../../lib/access";
import { markTask } from "../../../lib/profile";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  if (!env.DB) return Response.json({ resumes: [], storage: "unavailable" }, { status: 503 });
  const requestId=new URL(request.url).searchParams.get("id");
  if(requestId){const resume=await env.DB.prepare("SELECT id,title,kind,company,job_description,template_config_json,bullets_json,created_at,updated_at FROM resumes WHERE user_id=? AND id=?").bind(user.userId,requestId).first();return resume?Response.json({resume}):Response.json({error:"Resume not found"},{status:404});}
  const { results } = await env.DB.prepare("SELECT id,title,kind,company,job_description,template_config_json,bullets_json,created_at,updated_at FROM resumes WHERE user_id=? ORDER BY updated_at DESC LIMIT 100").bind(user.userId).all();
  return Response.json({ resumes: results ?? [] });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  if (!env.DB) return Response.json({ error: "Resume storage is unavailable" }, { status: 503 });
  const payload = await request.json() as { title?: string; company?: string; bullets?: string[]; jobDescription?: string; templateConfigJson?: string; kind?: string; id?: string };
  if (payload.templateConfigJson !== undefined) { try { if (payload.templateConfigJson.length > 60000 || typeof JSON.parse(payload.templateConfigJson) !== "object") throw new Error(); } catch { return Response.json({error:"Invalid or oversized resume content (60 KB maximum)"},{status:400}); } }
  const title = payload.title?.trim().slice(0,120) ?? "";
  const bullets = Array.isArray(payload.bullets) ? payload.bullets.filter(x => typeof x === "string").slice(0,30).map(x=>x.trim().slice(0,1000)) : [];
  if (!title) return Response.json({ error: "A resume title is required" }, { status: 400 });
  const id = payload.id?.slice(0,80) || crypto.randomUUID();
  const kind=payload.kind === "cover-letter" ? "cover-letter" : "resume";
  await env.DB.prepare(`INSERT INTO resumes (id,user_id,title,kind,company,job_description,template_config_json,bullets_json) VALUES (?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET title=excluded.title,kind=excluded.kind,company=excluded.company,job_description=excluded.job_description,template_config_json=excluded.template_config_json,bullets_json=excluded.bullets_json,updated_at=CURRENT_TIMESTAMP WHERE resumes.user_id=?`)
    .bind(id,user.userId,title,kind,payload.company?.trim().slice(0,120) ?? "",payload.jobDescription?.slice(0,8000)??"",payload.templateConfigJson?.slice(0,60000)??"{}",JSON.stringify(bullets),user.userId).run();
  if(kind==="resume")await markTask(user.userId,"resume");
  return Response.json({ id, title, kind, company: payload.company ?? "", bullets }, { status: 201 });
}

export async function PATCH(request: Request) {
  const user=await currentUser();
  if(!user)return Response.json({error:"Sign in required"},{status:401});
  if(!env.DB)return Response.json({error:"Resume storage is unavailable"},{status:503});
  const p=await request.json() as {id?:string;title?:string;bullets?:string[];jobDescription?:string;company?:string;templateConfigJson?:string};
  if (p.templateConfigJson !== undefined) { try { if (p.templateConfigJson.length > 60000 || typeof JSON.parse(p.templateConfigJson) !== "object") throw new Error(); } catch { return Response.json({error:"Invalid or oversized resume content (60 KB maximum)"},{status:400}); } }
  if(!p.id)return Response.json({error:"Resume id required"},{status:400});
  const before=await env.DB.prepare("SELECT * FROM resumes WHERE id=? AND user_id=?").bind(p.id,user.userId).first();
  if(!before)return Response.json({error:"Resume not found"},{status:404});
  const snapshot=env.DB.prepare("INSERT INTO resume_versions (id,user_id,resume_id,label,snapshot_json) SELECT ?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM resume_versions WHERE resume_id=? AND user_id=? AND created_at>datetime('now','-5 minutes'))").bind(crypto.randomUUID(),user.userId,p.id,"Autosave checkpoint",JSON.stringify(before),p.id,user.userId);
  const update=env.DB.prepare("UPDATE resumes SET title=?,bullets_json=COALESCE(?,bullets_json),job_description=COALESCE(?,job_description),company=COALESCE(?,company),template_config_json=COALESCE(?,template_config_json),updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?")
    .bind(p.title?.trim().slice(0,120)||"Untitled resume",Array.isArray(p.bullets)?JSON.stringify(p.bullets.slice(0,30)):null,p.jobDescription!==undefined?p.jobDescription.slice(0,8000):null,p.company!==undefined?p.company.slice(0,120):null,p.templateConfigJson?.slice(0,60000)??null,p.id,user.userId);
  const cleanup=env.DB.prepare("DELETE FROM resume_versions WHERE resume_id=? AND user_id=? AND id NOT IN (SELECT id FROM resume_versions WHERE resume_id=? AND user_id=? ORDER BY created_at DESC,rowid DESC LIMIT 30)").bind(p.id,user.userId,p.id,user.userId);
  const results=await env.DB.batch([snapshot,update,cleanup]);
  const result=results[1];
  if(!result.meta.changes)return Response.json({error:"Resume not found"},{status:404});
  return Response.json({ok:true});
}

export async function DELETE(request: Request) {
  const user=await currentUser();
  if(!user)return Response.json({error:"Sign in required"},{status:401});
  if(!env.DB)return Response.json({error:"Resume storage is unavailable"},{status:503});
  const id=new URL(request.url).searchParams.get("id");
  if(!id)return Response.json({error:"Resume id required"},{status:400});
  await env.DB.prepare("DELETE FROM resume_match_scores WHERE resume_id=? AND user_id=?").bind(id,user.userId).run();
  const result=await env.DB.prepare("DELETE FROM resumes WHERE id=? AND user_id=?").bind(id,user.userId).run();
  return Response.json({ok:result.meta.changes>0});
}
