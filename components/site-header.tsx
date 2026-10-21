import { ArrowRight } from "lucide-react";
import { Brand } from "./brand";

/** Compact public header for library and content pages (the landing page has its own, with menus). */
export function SiteHeader() {
  return <header className="mk-header">
    <div className="mk-header-inner container">
      <Brand />
      <nav className="site-nav" aria-label="Main">
        <a href="/resources">Career library</a>
        <a href="/tools">Tools</a>
      </nav>
      <a className="button button-small" href="/home">Open workspace <ArrowRight aria-hidden /></a>
    </div>
  </header>;
}
