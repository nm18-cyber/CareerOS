import { env } from "cloudflare:workers";
import { ensureResources } from "../../lib/resource-catalog";
import { SiteHeader } from "../../components/site-header";
import ResourceList from "./resource-list";

export const dynamic = "force-dynamic";

export default async function Page() {
  await ensureResources();
  const rows = await env.DB?.prepare("SELECT id,slug,title,description,category,resource_type FROM cms_resources WHERE published=1 ORDER BY category,title").all();
  return <div className="lib">
    <a className="skip-link" href="#main">Skip to content</a>
    <SiteHeader />
    <main id="main" className="container lib-main">
      <header className="lib-hero">
        <span className="label">Career library</span>
        <h1>Practical help for your next move.</h1>
        <p>Templates, worked examples, guides and career paths — each one written to be used, not just read.</p>
      </header>
      <ResourceList items={(rows?.results ?? []) as { id: string; slug: string; title: string; description: string; category: string; resource_type: string }[]} />
    </main>
  </div>;
}
