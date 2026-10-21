"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ChevronDown, ChevronRight, FileText, ListChecks, Menu, PenLine, Search, ShieldCheck, Sparkles, Target, X } from "lucide-react";
import { Brand } from "../components/brand";

type User = { name: string; email: string } | null;
type ResourceApi = { resource_type: string; title: string; description: string; slug: string };
type Hub = { title: string; desc: string; slug: string };

const fallbackHub: Hub[] = [
  ["Career Hub", "Practical strategies for your next move."], ["Resume Hub", "A clear guide to better resumes."],
  ["Resume Examples", "Role-specific examples to learn from."], ["Resume Templates", "Layouts made for readable resumes."],
  ["Cover Letter Templates", "Strong starts for every application."], ["Cover Letter Examples", "Examples for different roles and goals."],
  ["Resume Synonyms", "Sharper words for your experience."], ["CV Examples", "Formats for academic and global CVs."],
  ["Career Paths", "Explore practical role guides."], ["Tech Job Board", "Roles worth your attention."],
].map(([title, desc]) => ({ title, desc, slug: title.toLowerCase().replaceAll(" ", "-") }));

const toolLinks = [
  { title: "Resume keyword scanner", desc: "Find the terms a role expects.", href: "/tools/keyword-scanner", icon: Search },
  { title: "ATS resume checker", desc: "Check structure against screening basics.", href: "/tools/ats-checker", icon: ShieldCheck },
  { title: "Bullet point writer", desc: "Turn duties into measurable results.", href: "/tools/writing", icon: PenLine },
  { title: "All tools", desc: "Every CareerOS workspace in one place.", href: "/tools", icon: Sparkles },
];
const modules = [
  { title: "Resume Studio", desc: "Write, design and export resumes and cover letters.", href: "/resume-builder/resumes", icon: FileText },
  { title: "Role matching", desc: "Compare a resume with a job description, term by term.", href: "/tools/keyword-scanner", icon: Target },
  { title: "Career Assistant", desc: "Ask questions with your own resume as context.", href: "/ai-job-search", icon: Sparkles },
  { title: "Job tracker", desc: "Every application, its status and the next follow-up.", href: "/jobs", icon: ListChecks },
];

export default function CareerHome({ user }: { user: User }) {
  const [menu, setMenu] = useState<"tools" | "resources" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hub, setHub] = useState<Hub[]>(fallbackHub);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    void fetch("/api/resources").then((r) => r.ok ? r.json() as Promise<{ resources: ResourceApi[] }> : null).then((d) => {
      const links = d?.resources?.filter((r) => r.resource_type === "link");
      if (links?.length) setHub(links.map((r) => ({ title: r.title, desc: r.description, slug: r.slug })));
    }).catch(() => {});
  }, []);
  useEffect(() => {
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !headerRef.current?.contains(e.target as Node)) { setMenu(null); setMobileOpen(false); }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, []);
  const toggle = (m: "tools" | "resources") => setMenu(menu === m ? null : m);

  return <div className="mk">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="mk-header" ref={headerRef}>
      <div className="mk-header-inner container">
        <Brand />
        <nav className={`mk-nav${mobileOpen ? " is-open" : ""}`} aria-label="Main">
          <div className="mk-nav-item">
            <button className="mk-nav-trigger" aria-expanded={menu === "tools"} aria-controls="menu-tools" onClick={() => toggle("tools")}>Tools <ChevronDown aria-hidden size={16} /></button>
            {menu === "tools" && <div className="mk-panel mk-panel-tools" id="menu-tools">{toolLinks.map(({ title, desc, href, icon: Icon }) => <a key={href} href={href} className="mk-panel-link"><span className="mk-panel-icon"><Icon aria-hidden size={18} /></span><span><b>{title}</b><small>{desc}</small></span></a>)}</div>}
          </div>
          <div className="mk-nav-item">
            <button className="mk-nav-trigger" aria-expanded={menu === "resources"} aria-controls="menu-resources" onClick={() => toggle("resources")}>Resources <ChevronDown aria-hidden size={16} /></button>
            {menu === "resources" && <div className="mk-panel mk-panel-resources" id="menu-resources"><div className="mk-panel-grid">{hub.map((r) => <a key={r.slug} href={`/resources/${encodeURIComponent(r.slug)}`} className="mk-panel-link"><span><b>{r.title}</b><small>{r.desc}</small></span></a>)}</div><a className="text-button" href="/resources">Browse the full library <ArrowRight aria-hidden /></a></div>}
          </div>
          <a className="mk-nav-link" href="#how-it-works" onClick={() => { setMenu(null); setMobileOpen(false); }}>How it works</a>
          {!user && <a className="mk-nav-link mk-nav-signin" href="/login">Sign in</a>}
        </nav>
        <div className="mk-header-actions">
          {user ? <a className="button button-small" href="/home">Open workspace <ArrowRight aria-hidden /></a> : <><a className="mk-signin" href="/login">Sign in</a><a className="button button-small" href="/signup">Get started</a></>}
          <button className="icon-button mk-menu-toggle" aria-expanded={mobileOpen} aria-label={mobileOpen ? "Close menu" : "Open menu"} onClick={() => { setMobileOpen(!mobileOpen); setMenu(null); }}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
    </header>

    <main id="main">
      <section className="mk-hero container" aria-labelledby="hero-title">
        <div className="mk-hero-copy">
          <span className="label">Resume builder and job search workspace</span>
          <h1 id="hero-title">Make your experience <em>impossible to misread.</em></h1>
          <p className="mk-lead">CareerOS turns your work history into evidence-led resumes, checks each one against the role you want, and keeps every application in one calm workspace.</p>
          <div className="mk-hero-actions">
            <a href={user ? "/home" : "/signup"} className="button">{user ? "Go to your workspace" : "Build your resume — free"} <ArrowRight aria-hidden /></a>
            <a href="#how-it-works" className="outline-button">See how it works</a>
          </div>
          <ul className="mk-proof">{["Free to start", "ATS-friendly templates", "Private to your account"].map((t) => <li key={t}><Check aria-hidden size={16} />{t}</li>)}</ul>
        </div>
        <AnnotatedResume />
      </section>

      <section className="mk-band mk-band-warm" id="how-it-works" aria-labelledby="how-title">
        <div className="container">
          <div className="mk-section-head"><span className="label">How it works</span><h2 id="how-title">Three moves from a blank page to a stronger application.</h2></div>
          <ol className="mk-flow">
            <li className="mk-flow-step">
              <span className="mk-flow-index tabular">01</span>
              <h3>Write what changed</h3>
              <p>Rewrite duties as outcomes, with the scope and numbers that prove them.</p>
              <div className="mk-vignette mk-rewrite" aria-label="Example rewrite">
                <p className="mk-before"><span className="badge">Before</span><span>Responsible for the sales pipeline.</span></p>
                <p className="mk-after"><span className="badge badge-accent">After</span><span>Grew qualified pipeline <mark>34%</mark> in two quarters.</span></p>
              </div>
              <a className="text-button" href="/resume-builder/resumes">Open Resume Studio <ArrowRight aria-hidden /></a>
            </li>
            <li className="mk-flow-step">
              <span className="mk-flow-index tabular">02</span>
              <h3>Tailor it to the role</h3>
              <p>Paste a job description and see which terms you already cover — and which are missing.</p>
              <div className="mk-vignette" aria-label="Example keyword match">
                <div className="mk-chips">
                  {["Pipeline growth", "Stakeholders", "Forecasting"].map((k) => <span className="badge badge-success" key={k}><Check aria-hidden /> {k}</span>)}
                  {["Salesforce", "Enablement"].map((k) => <span className="badge badge-warning" key={k}>Missing: {k}</span>)}
                </div>
              </div>
              <a className="text-button" href="/tools/keyword-scanner">Try the keyword scanner <ArrowRight aria-hidden /></a>
            </li>
            <li className="mk-flow-step">
              <span className="mk-flow-index tabular">03</span>
              <h3>Keep the search moving</h3>
              <p>Track every application and the next step, so nothing slips.</p>
              <div className="mk-vignette" aria-label="Example job tracker">
                <ul className="mk-pipeline">
                  <li><span>Product Marketing Lead</span><span className="status status-success">Interview</span></li>
                  <li><span>Growth Manager</span><span className="status status-accent">Applied</span></li>
                  <li><span>Brand Strategist</span><span className="status">Saved</span></li>
                </ul>
              </div>
              <a className="text-button" href="/jobs">Open the job tracker <ArrowRight aria-hidden /></a>
            </li>
          </ol>
        </div>
      </section>

      <section className="mk-band" aria-labelledby="workspace-title">
        <div className="container mk-split">
          <div className="mk-section-head">
            <span className="label">One workspace</span>
            <h2 id="workspace-title">Everything your search needs, and nothing it doesn’t.</h2>
            <p>Documents, role matching, research and tracking share the same profile — so each tool knows the role you’re aiming for.</p>
            <a className="button" href={user ? "/home" : "/signup"}>{user ? "Open your workspace" : "Create a free account"} <ArrowRight aria-hidden /></a>
          </div>
          <ul className="mk-modules">{modules.map(({ title, desc, href, icon: Icon }) => <li key={title}><a href={href}><span className="mk-module-icon"><Icon aria-hidden size={20} /></span><span><b>{title}</b><small>{desc}</small></span><ChevronRight aria-hidden className="mk-module-arrow" size={18} /></a></li>)}</ul>
        </div>
      </section>

      <section className="mk-band mk-band-warm" aria-labelledby="library-title">
        <div className="container">
          <div className="mk-section-row"><div className="mk-section-head"><span className="label">Career library</span><h2 id="library-title">Guides, templates and examples.</h2></div><a className="outline-button" href="/resources">Browse all resources</a></div>
          <ul className="mk-library">{hub.map((r) => <li key={r.slug}><a href={`/resources/${encodeURIComponent(r.slug)}`}><b>{r.title}</b><small>{r.desc}</small></a></li>)}</ul>
        </div>
      </section>

      <section className="mk-cta" aria-labelledby="cta-title">
        <div className="container mk-cta-inner">
          <h2 id="cta-title">Your next role starts with a clearer story.</h2>
          <div><a href={user ? "/home" : "/signup"} className="button">{user ? "Open your workspace" : "Build your free resume"} <ArrowRight aria-hidden /></a><p>Free to start. No card required.</p></div>
        </div>
      </section>
    </main>

    <footer className="mk-footer">
      <div className="container mk-footer-inner">
        <div className="mk-footer-brand"><Brand /><p>Clarity for the work ahead.</p></div>
        <nav aria-label="Product"><h3>Product</h3><a href="/resume-builder/resumes">Resume Studio</a><a href="/jobs">Job tracker</a><a href="/ai-job-search">Career Assistant</a><a href="/tools">All tools</a></nav>
        <nav aria-label="Resources"><h3>Resources</h3><a href="/resources">Career library</a><a href="/search">Search resources</a></nav>
        <nav aria-label="Account"><h3>Account</h3>{user ? <><a href="/home">Workspace</a><a href="/logout">Sign out</a></> : <><a href="/login">Sign in</a><a href="/signup">Create account</a></>}<a href="/admin">Admin</a></nav>
      </div>
      <div className="container mk-footer-legal"><small>© 2026 CareerOS</small></div>
    </footer>
  </div>;
}

/** Hero visual: a resume page with margin notes explaining why each line works. */
function AnnotatedResume() {
  return <figure className="mk-visual" aria-label="Example: a resume with notes showing what makes each line strong">
    <div className="mk-paper">
      <div className="mk-paper-head"><b>Morgan Lee</b><small>Product Marketing · New York, NY</small></div>
      <div className="mk-paper-section">Experience</div>
      <p className="mk-paper-role"><b>Senior Marketing Manager</b><small>Northwind · 2021 – Present</small></p>
      <ul className="mk-paper-lines">
        <li data-note="1"><mark>Grew</mark> qualified pipeline by <mark>34%</mark> in two quarters</li>
        <li data-note="2">Cut acquisition cost <mark>18%</mark> by rebuilding paid search</li>
        <li data-note="3">Led a cross-functional team of <mark>8</mark> through a launch</li>
      </ul>
      <div className="mk-paper-section">Education</div>
      <span className="mk-paper-line" style={{ width: "78%" }} /><span className="mk-paper-line" style={{ width: "56%" }} />
    </div>
    <ol className="mk-notes">
      <li><span className="tabular">1</span><b>Strong verb, measured result</b></li>
      <li><span className="tabular">2</span><b>Cause and effect</b></li>
      <li><span className="tabular">3</span><b>Scope you can picture</b></li>
    </ol>
    <div className="mk-match" role="img" aria-label="Role match 82 percent, 2 keywords to add">
      <div className="mk-match-top"><span>Role match</span><b className="tabular">82%</b></div>
      <div className="mk-match-bar"><span style={{ width: "82%" }} /></div>
      <small>2 keywords to add for this role</small>
    </div>
  </figure>;
}
