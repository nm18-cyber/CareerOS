import { env } from "cloudflare:workers";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ensureResources } from "../../../lib/resource-catalog";
import { SiteHeader } from "../../../components/site-header";
import UseTemplate from "./use-template";

export const dynamic = "force-dynamic";
type Resource = { slug: string; title: string; description: string; category: string; resource_type: string; article_content: string; template_config_json: string };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await ensureResources();
  const r = await env.DB?.prepare("SELECT * FROM cms_resources WHERE slug=? AND published=1").bind(slug).first<Resource>();
  if (!r) notFound();
  const related = await env.DB?.prepare("SELECT slug,title,description FROM cms_resources WHERE published=1 AND slug<>? AND resource_type<>'link' ORDER BY CASE WHEN category=? THEN 0 ELSE 1 END,title LIMIT 6").bind(slug, r.category).all<{ slug: string; title: string; description: string }>();
  const workspace = r.slug.includes("job") ? { href: "/discover-jobs", label: "Discover jobs" } : r.slug.includes("path") ? { href: "/ai-job-search", label: "Ask the Career Assistant" } : { href: "/resume-builder/resumes", label: "Open Resume Studio" };
  return <div className="lib">
    <a className="skip-link" href="#main">Skip to content</a>
    <SiteHeader />
    <main id="main" className="container lib-main">
      <nav className="lib-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="/resources">Career library</a></li><li aria-current="page">{r.resource_type === "template" ? "Templates" : r.category}</li></ol></nav>
      <article className="lib-article">
        <header>
          <span className={r.resource_type === "template" ? "badge badge-accent" : "badge"}>{r.resource_type === "template" ? "Template" : r.category}</span>
          <h1>{r.title}</h1>
          <p className="lib-article-lead">{r.description}</p>
        </header>
        {r.article_content && <div className="lib-prose">{r.article_content.split(/\n\n/).map((p, i) => <p key={i}>{p}</p>)}</div>}
        {r.resource_type === "template" && <section className="lib-action" aria-labelledby="use-title">
          <div><h2 id="use-title">Make this template your own</h2><p>Creates an editable copy in your account. Replace the sample text with your own verified experience.</p></div>
          <UseTemplate slug={r.slug} />
        </section>}
        {r.resource_type === "link" && <section className="lib-action" aria-labelledby="start-title">
          <div><h2 id="start-title">Put it into practice</h2><p>Pick a focused guide below, or apply this straight away in your workspace.</p></div>
          <a className="button" href={workspace.href}>{workspace.label} <ArrowRight aria-hidden /></a>
        </section>}
      </article>
      {!!related?.results.length && <section className="lib-related" aria-labelledby="related-title">
        <div className="mk-section-row"><h2 id="related-title">Keep exploring</h2><a className="text-button" href="/resources">All resources <ArrowRight aria-hidden /></a></div>
        <ul className="lib-grid">{related.results.map((x) => <li key={x.slug}><a className="card card-interactive lib-card" href={"/resources/" + encodeURIComponent(x.slug)}><h3>{x.title}</h3><p>{x.description}</p><span className="lib-card-cta">Read <ArrowRight aria-hidden size={16} /></span></a></li>)}</ul>
      </section>}
    </main>
  </div>;
}
