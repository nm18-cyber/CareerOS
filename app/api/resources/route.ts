import {ensureResources} from "../../../lib/resource-catalog";
import { env } from "cloudflare:workers";
import { requireAdmin } from "../../../lib/access";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!env.DB) return Response.json({ resources: [] });
  await ensureResources();
  const admin = await requireAdmin();
  const { results } = await env.DB.prepare(`SELECT id,slug,title,description,category,resource_type,article_content,template_config_json,column_no,published FROM cms_resources ${admin ? "" : "WHERE published=1"} ORDER BY column_no,title`).all();
  return Response.json({ resources: results ?? [] });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required" }, { status: 403 });
  const p = await request.json() as { id?: string; title?: string; description?: string; category?: string; resourceType?: string; articleContent?: string; templateConfigJson?: string; columnNo?: number; slug?: string; published?: boolean };
  const title = p.title?.trim().slice(0,100) ?? "";
  if (!title || !env.DB) return Response.json({ error: "A title and database are required" }, { status: 400 });
  const id = p.id || crypto.randomUUID();
  const slug = (p.slug?.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")).slice(0,100);
  try {
    const resourceType=["link","article","template"].includes(p.resourceType??"")?p.resourceType:"link";
    await env.DB.prepare(`INSERT INTO cms_resources (id,slug,title,description,category,resource_type,article_content,template_config_json,column_no,published) VALUES (?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,title=excluded.title,description=excluded.description,category=excluded.category,resource_type=excluded.resource_type,article_content=excluded.article_content,template_config_json=excluded.template_config_json,column_no=excluded.column_no,published=excluded.published,updated_at=CURRENT_TIMESTAMP`)
      .bind(id,slug,title,p.description?.trim().slice(0,300) ?? "",p.category?.trim().slice(0,50) ?? "Career Hub",resourceType,p.articleContent?.slice(0,50000)??"",p.templateConfigJson?.slice(0,4000)??"{}",Math.min(3,Math.max(1,Number(p.columnNo)||1)),p.published === false ? 0 : 1).run();
  } catch { return Response.json({ error: "That resource slug is already in use." }, { status: 409 }); }
  return Response.json({ id, slug, title }, { status: 201 });
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Admin access required" }, { status: 403 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !env.DB) return Response.json({ error: "Resource id required" }, { status: 400 });
  await env.DB.prepare("DELETE FROM cms_resources WHERE id=?").bind(id).run();
  return Response.json({ ok: true });
}
