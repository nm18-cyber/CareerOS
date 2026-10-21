"use client";
import { useEffect, useState } from "react";
import { BriefcaseBusiness, Building2, FileText, Grid2X2, LayoutDashboard, ListChecks, LogOut, Menu, Search, Settings, Sparkles, Users, X, BookOpen } from "lucide-react";
import { BrandMark } from "./brand";

export const workspaceGroups = [
  { label: null, links: [{ label: "Home", href: "/home", icon: LayoutDashboard }] },
  { label: "Create", links: [
    { label: "Resumes", href: "/resume-builder/resumes", icon: FileText },
    { label: "Documents", href: "/documents", icon: BriefcaseBusiness },
    { label: "Career Assistant", href: "/ai-job-search", icon: Sparkles },
  ] },
  { label: "Job search", links: [
    { label: "Discover jobs", href: "/discover-jobs", icon: Search },
    { label: "Job tracker", href: "/jobs", icon: ListChecks },
    { label: "Companies", href: "/companies", icon: Building2 },
    { label: "Contacts", href: "/contacts", icon: Users },
  ] },
  { label: "Library", links: [
    { label: "Resources", href: "/search", icon: BookOpen },
    { label: "All tools", href: "/tools", icon: Grid2X2 },
  ] },
];
export const workspaceLinks = [...workspaceGroups.flatMap((g) => g.links), { label: "Settings", href: "/settings", icon: Settings }];

/** Native links deliberately use a full request so navigation works without client-side routing. */
export function ProductSidebar({ name, active = "/resume-builder/resumes" }: { name: string; active?: string; variant?: "product" | "dashboard" }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  const link = ({ label, href, icon: Icon }: (typeof workspaceLinks)[number]) => (
    <a key={href} href={href} className="app-nav-link" aria-current={active === href ? "page" : undefined}><Icon aria-hidden size={18} />{label}</a>
  );
  return <aside className="app-sidebar" data-open={open || undefined}>
    <div className="app-sidebar-head">
      <a href="/home" className="brand" aria-label="CareerOS home"><BrandMark /><span>career<span className="brand-os">os</span></span></a>
      <button className="icon-button app-menu-toggle" aria-expanded={open} aria-controls="workspace-nav" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
    </div>
    <div className="app-sidebar-body" id="workspace-nav">
      <nav className="app-nav" aria-label="Workspace">
        {workspaceGroups.map((group) => <div className="app-nav-group" key={group.label ?? "top"}>
          {group.label && <span className="app-nav-heading">{group.label}</span>}
          {group.links.map(link)}
        </div>)}
      </nav>
      <div className="app-sidebar-foot">
        {link(workspaceLinks.at(-1)!)}
        <div className="app-user">
          <span className="app-avatar" aria-hidden>{name.slice(0, 1).toUpperCase()}</span>
          <span className="app-user-name">{name}</span>
          <a className="icon-button" href="/logout" aria-label="Sign out" data-tooltip="Sign out"><LogOut size={17} /></a>
        </div>
      </div>
    </div>
  </aside>;
}
