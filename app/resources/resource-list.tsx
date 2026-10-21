"use client";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Search } from "lucide-react";

type Resource = { id: string; slug: string; title: string; description: string; category: string; resource_type: string };

export default function ResourceList({ items }: { items: Resource[] }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const categories = useMemo(() => [...new Set(["All", "Templates", ...items.map((r) => r.category)])], [items]);
  const isTemplate = (r: Resource) => r.resource_type === "template" || r.category === "Templates";
  const filtered = items.filter((r) => (type === "All" || (type === "Templates" ? isTemplate(r) : r.category === type && !isTemplate(r)))
    && `${r.title} ${r.description}`.toLowerCase().includes(q.trim().toLowerCase()));
  return <>
    <div className="lib-filters">
      <label className="lib-search">
        <span className="visually-hidden">Search the library</span>
        <Search aria-hidden size={18} />
        <input className="input" type="search" placeholder="Search guides, templates and examples" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <div className="lib-chips" role="group" aria-label="Filter by category">
        {categories.map((c) => <button key={c} className="lib-chip" aria-pressed={type === c} onClick={() => setType(c)}>{c}</button>)}
      </div>
    </div>
    <p className="lib-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? "resource" : "resources"}{type !== "All" ? ` in ${type}` : ""}{q.trim() ? ` matching “${q.trim()}”` : ""}</p>
    {filtered.length ? <ul className="lib-grid">{filtered.map((r) => <li key={r.id}><a className="card card-interactive lib-card" href={"/resources/" + encodeURIComponent(r.slug)}>
      <span className={r.resource_type === "template" ? "badge badge-accent" : "badge"}>{r.resource_type === "template" ? "Template" : r.category}</span>
      <h2>{r.title}</h2>
      <p>{r.description}</p>
      <span className="lib-card-cta">{r.resource_type === "template" ? "Preview template" : "Read"} <ArrowRight aria-hidden size={16} /></span>
    </a></li>)}</ul>
      : <div className="empty-state"><span className="empty-state-icon"><BookOpen aria-hidden /></span><h3>Nothing matches that yet</h3><p>Try a broader word, or clear the filters to see the whole library.</p><button className="outline-button" onClick={() => { setQ(""); setType("All"); }}>Clear filters</button></div>}
  </>;
}
