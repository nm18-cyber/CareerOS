"use client";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronDown, FileText, Info, Plus, Trash2, X } from "lucide-react";

const colors = [
  ["Background", "--color-bg", "#FFFFFF"], ["Warm background", "--color-bg-warm", "#F7F5EF"], ["Muted background", "--color-bg-muted", "#F8F9FB"],
  ["Text", "--color-text", "#17233B"], ["Muted text", "--color-text-muted", "#667085"], ["Accent", "--color-accent", "#4169E1"],
  ["Accent strong", "--color-accent-strong", "#2F4DB0"], ["Accent soft", "--color-accent-soft", "#DCE6FA"], ["Border", "--color-border", "#D9DEE7"],
  ["Border strong", "--color-border-strong", "#8A94A6"], ["Success", "--color-success", "#237A57"], ["Warning", "--color-warning", "#A86416"], ["Error", "--color-error", "#B42318"],
];
const rows = [
  { role: "Product Marketing Lead", company: "Northwind", status: "Interview", tone: "success", match: 86 },
  { role: "Growth Manager", company: "Contoso", status: "Applied", tone: "accent", match: 74 },
  { role: "Brand Strategist", company: "Fabrikam", status: "Saved", tone: "", match: 61 },
  { role: "Marketing Director", company: "Tailspin", status: "Declined", tone: "error", match: 52 },
];
const tabNames = ["Overview", "Activity", "Notes"];

export default function Showcase() {
  const [tab, setTab] = useState(0);
  const [dialog, setDialog] = useState(false);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sort, setSort] = useState<"match" | "role">("match");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dialogClose = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLButtonElement>(null);

  const emailError = touched && !/^\S+@\S+\.\S+$/.test(email) ? (email ? "Enter an email address like name@example.com." : "Enter your email address.") : "";
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  useEffect(() => { if (dialog) dialogClose.current?.focus(); }, [dialog]);
  useEffect(() => { if (menu) menuRefs.current[0]?.focus(); }, [menu]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key !== "Escape") return; if (dialog) { setDialog(false); opener.current?.focus(); } setMenu(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dialog]);

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const next = e.key === "ArrowRight" ? (i + 1) % tabNames.length : e.key === "ArrowLeft" ? (i - 1 + tabNames.length) % tabNames.length : e.key === "Home" ? 0 : e.key === "End" ? tabNames.length - 1 : -1;
    if (next < 0) return;
    e.preventDefault(); setTab(next); tabRefs.current[next]?.focus();
  };
  const onMenuKey = (e: React.KeyboardEvent) => {
    const items = menuRefs.current.filter(Boolean) as HTMLButtonElement[];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
  };
  const sorted = [...rows].sort((a, b) => sort === "match" ? b.match - a.match : a.role.localeCompare(b.role));

  return <>
    <section className="ds-section" aria-labelledby="ds-color">
      <h2 id="ds-color">Colour</h2>
      <p>White is the working canvas, warm ivory marks editorial bands, navy carries text and data, and blue is reserved for actions, selection and focus. Status colours always travel with a text label.</p>
      <div className="ds-grid">{colors.map(([name, token, hex]) => <div className="ds-swatch" key={token}><span style={{ background: `var(${token})` }} /><div><b>{name}</b><code>{token}</code><br /><code>{hex}</code></div></div>)}</div>
    </section>

    <section className="ds-section ds-type" aria-labelledby="ds-type">
      <h2 id="ds-type">Typography</h2>
      <p>Manrope for headings, Inter for interface and body text, DM Serif Display only for a single editorial accent per page.</p>
      <p style={{ font: "800 var(--text-hero)/1.1 var(--font-heading)", letterSpacing: "-0.035em" }}>Hero, 40–56 px</p>
      <p style={{ font: "800 var(--text-page)/1.15 var(--font-heading)", letterSpacing: "-0.03em" }}>Page heading, 30–40 px</p>
      <p style={{ font: "700 var(--text-section)/1.2 var(--font-heading)" }}>Section heading, 22–28 px</p>
      <p style={{ font: "600 var(--text-card)/1.3 var(--font-heading)" }}>Card heading, 18 px</p>
      <p>Body text, 16 px. Comfortable line height and a readable measure keep long guidance easy to follow.</p>
      <p style={{ font: "500 var(--text-label)/1.4 var(--font-body)", color: "var(--color-text-muted)" }}>Supporting label, 14 px</p>
      <p style={{ font: "400 2.25rem/1.2 var(--font-editorial)", fontStyle: "italic", color: "var(--color-accent-strong)" }}>Editorial accent</p>
      <p className="tabular">Tabular numerals: 1,234 · 98,765 · $105,000</p>
    </section>

    <section className="ds-section" aria-labelledby="ds-buttons">
      <h2 id="ds-buttons">Buttons</h2>
      <p>One primary action per view. Secondary for alternatives, tertiary for low-emphasis links, destructive only where data is lost.</p>
      <div className="ds-row">
        <button className="button" onClick={() => flash("Primary action done.")}>Primary <ArrowRight aria-hidden /></button>
        <button className="button-secondary" onClick={() => flash("Secondary action done.")}>Secondary</button>
        <button className="button-tertiary" onClick={() => flash("Tertiary action done.")}>Tertiary</button>
        <button className="button-danger" onClick={() => flash("Deleted (demo only).")}><Trash2 aria-hidden /> Delete</button>
        <button className="button" disabled>Disabled</button>
        <button className="button" aria-busy={busy} onClick={() => { setBusy(true); setTimeout(() => { setBusy(false); flash("Saved."); }, 1500); }} disabled={busy}>{busy ? "Saving…" : "Save (loading)"}</button>
        <button className="button button-small"><Plus aria-hidden /> Small</button>
        <button className="icon-button" aria-label="Add item" data-tooltip="Add item"><Plus size={18} aria-hidden /></button>
      </div>
    </section>

    <section className="ds-section" aria-labelledby="ds-forms">
      <h2 id="ds-forms">Forms</h2>
      <p>Labels sit above fields. Errors appear after the first attempt, say how to fix the problem, and are announced to screen readers.</p>
      <form className="ds-stack" noValidate onSubmit={(e) => { e.preventDefault(); setTouched(true); if (/^\S+@\S+\.\S+$/.test(email)) flash("Form submitted."); }}>
        <label className="field"><span className="field-label">Email<span className="required" aria-hidden>*</span></span>
          <input className="input" type="email" value={email} placeholder="name@example.com" aria-invalid={!!emailError} aria-describedby={emailError ? "ds-email-error" : "ds-email-hint"} onChange={(e) => setEmail(e.target.value)} onBlur={() => email && setTouched(true)} />
          {emailError ? <span className="field-error" id="ds-email-error" role="alert"><AlertCircle size={14} aria-hidden />{emailError}</span> : <span className="field-hint" id="ds-email-hint">We’ll only use this to sign you in.</span>}
        </label>
        <label className="field"><span className="field-label">Target role</span><select className="select" defaultValue="pm"><option value="pm">Product manager</option><option value="design">Product designer</option><option value="eng">Engineer</option></select></label>
        <label className="field"><span className="field-label">Summary</span><textarea className="textarea" placeholder="Two or three sentences about what you do best." /></label>
        <label className="checkbox"><input type="checkbox" defaultChecked /> Email me when a saved role changes</label>
        <div className="ds-row"><button className="button" type="submit">Submit</button><button className="button-secondary" type="button" onClick={() => { setEmail(""); setTouched(false); }}>Reset</button></div>
      </form>
    </section>

    <section className="ds-section" aria-labelledby="ds-cards">
      <h2 id="ds-cards">Cards, badges and status</h2>
      <p>Cards group related content with a thin border and no heavy shadow. Selected cards use the pale blue surface.</p>
      <div className="ds-grid">
        <article className="card"><div className="card-header"><h3 className="card-title">Senior Designer resume</h3><span className="badge badge-success"><Check aria-hidden /> Ready</span></div><p className="card-meta">Edited 2 days ago · 2 pages</p><div className="card-footer"><a className="button-tertiary" href="#ds-cards">Open</a></div></article>
        <article className="card card-selected"><div className="card-header"><h3 className="card-title">Product Lead resume</h3><span className="badge badge-accent">Selected</span></div><p className="card-meta">Matched to 3 saved roles</p></article>
        <article className="card"><h3 className="card-title">Badges</h3><div className="ds-row" style={{ marginTop: 12 }}><span className="badge">Neutral</span><span className="badge badge-accent">Accent</span><span className="badge badge-success">Success</span><span className="badge badge-warning">Warning</span><span className="badge badge-error">Error</span></div><div className="ds-row" style={{ marginTop: 12 }}><span className="status status-success">Interview</span><span className="status status-accent">Applied</span><span className="status status-error">Declined</span></div></article>
      </div>
    </section>

    <section className="ds-section" aria-labelledby="ds-tabs">
      <h2 id="ds-tabs">Tabs</h2>
      <p>Arrow keys move between tabs; Home and End jump to the first and last.</p>
      <div className="tabs" role="tablist" aria-label="Application detail">{tabNames.map((t, i) => <button key={t} ref={(el) => { tabRefs.current[i] = el; }} className="tab" role="tab" id={`ds-tab-${i}`} aria-selected={tab === i} aria-controls={`ds-panel-${i}`} tabIndex={tab === i ? 0 : -1} onClick={() => setTab(i)} onKeyDown={(e) => onTabKey(e, i)}>{t}</button>)}</div>
      <div className="card" role="tabpanel" id={`ds-panel-${tab}`} aria-labelledby={`ds-tab-${tab}`} style={{ borderTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
        {["Applied 12 Oct. Interview booked for 24 Oct.", "No new activity this week.", "Ask about the team’s planning cycle."][tab]}
      </div>
    </section>

    <section className="ds-section" aria-labelledby="ds-overlays">
      <h2 id="ds-overlays">Dialog, dropdown and notifications</h2>
      <p>Dialogs trap attention, close with Escape or the scrim, and return focus to the trigger. Menus open on click and support arrow keys.</p>
      <div className="ds-row">
        <button className="button-secondary" ref={opener} onClick={() => setDialog(true)}>Open dialog</button>
        <div className="menu-wrap">
          <button className="button-secondary" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>Actions <ChevronDown aria-hidden /></button>
          {menu && <div className="menu" role="menu" onKeyDown={onMenuKey}>
            {["Duplicate", "Rename", "Download PDF"].map((m, i) => <button key={m} ref={(el) => { menuRefs.current[i] = el; }} role="menuitem" className="menu-item" onClick={() => { setMenu(false); flash(`${m} (demo).`); }}>{m}</button>)}
            <div className="menu-separator" role="separator" />
            <button ref={(el) => { menuRefs.current[3] = el; }} role="menuitem" className="menu-item menu-item-danger" onClick={() => { setMenu(false); flash("Deleted (demo only)."); }}>Delete</button>
          </div>}
        </div>
        <button className="button-secondary" onClick={() => flash("Changes saved.")}>Show notification</button>
      </div>
      <div className="ds-stack" style={{ maxWidth: 640, marginTop: 24 }}>
        <div className="alert" role="note"><Info aria-hidden /><span><b>Tip:</b> tailor one resume per role family rather than per application.</span></div>
        <div className="alert alert-success" role="status"><CheckCircle2 aria-hidden /><span><b>Saved.</b> Your resume is up to date.</span></div>
        <div className="alert alert-warning" role="note"><AlertTriangle aria-hidden /><span><b>2 keywords missing</b> for this role.</span></div>
        <div className="alert alert-error" role="alert"><AlertCircle aria-hidden /><span><b>Upload failed.</b> Files must be PDF or DOCX under 5 MB (about 4.8 MiB).</span></div>
      </div>
    </section>

    <section className="ds-section" aria-labelledby="ds-table">
      <h2 id="ds-table">Table and progress</h2>
      <p>Numbers align right in tabular figures. Sorting is a real button on the column header. Sample data is fictional.</p>
      <div className="table-wrap"><table className="table">
        <caption className="visually-hidden">Sample applications</caption>
        <thead><tr>
          <th scope="col" aria-sort={sort === "role" ? "ascending" : "none"}><button className="button-tertiary" style={{ minHeight: 0, padding: 0, font: "inherit", color: "inherit" }} onClick={() => setSort("role")}>Role{sort === "role" ? " ↑" : ""}</button></th>
          <th scope="col">Company</th><th scope="col">Status</th>
          <th scope="col" className="num" aria-sort={sort === "match" ? "descending" : "none"}><button className="button-tertiary" style={{ minHeight: 0, padding: 0, font: "inherit", color: "inherit" }} onClick={() => setSort("match")}>Match{sort === "match" ? " ↓" : ""}</button></th>
        </tr></thead>
        <tbody>{sorted.map((r) => <tr key={r.role}><td>{r.role}</td><td>{r.company}</td><td><span className={`status${r.tone ? ` status-${r.tone}` : ""}`}>{r.status}</span></td><td className="num">{r.match}%</td></tr>)}</tbody>
      </table></div>
      <div className="ds-stack" style={{ marginTop: 24 }}>
        <div><div className="field-label" style={{ marginBottom: 8 }}>Profile complete — 60%</div><div className="progress" role="progressbar" aria-valuenow={60} aria-valuemin={0} aria-valuemax={100} aria-label="Profile complete"><span style={{ width: "60%" }} /></div></div>
        <ol className="steps"><li data-state="done">Write</li><li data-state="current">Tailor</li><li>Track</li></ol>
      </div>
    </section>

    <section className="ds-section" aria-labelledby="ds-states">
      <h2 id="ds-states">Empty, loading and error states</h2>
      <p>Every list has all three. Empty states explain the value and offer the next action; errors explain what happened and how to recover.</p>
      <div className="ds-grid">
        <div className="empty-state"><span className="empty-state-icon"><FileText aria-hidden /></span><h3>No resumes yet</h3><p>Start from a template or import a file you already have.</p><button className="button button-small" onClick={() => flash("Would open Resume Studio.")}>Create resume</button></div>
        <div className="card" aria-busy="true" aria-label="Loading"><div className="ds-stack"><div className="skeleton" style={{ width: "60%", height: 20 }} /><div className="skeleton" /><div className="skeleton" style={{ width: "80%" }} /><div className="ds-row"><span className="spinner" aria-hidden /> <span className="card-meta">Loading applications…</span></div></div></div>
        <div className="card"><div className="alert alert-error" role="alert"><AlertCircle aria-hidden /><span><b>Couldn’t load applications.</b> Check your connection and try again.</span></div><button className="button-secondary button-small" style={{ marginTop: 16 }} onClick={() => flash("Retrying…")}>Try again</button></div>
      </div>
    </section>

    {dialog && <div className="modal-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) { setDialog(false); opener.current?.focus(); } }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="ds-dialog-title" aria-describedby="ds-dialog-desc">
        <div className="modal-head"><h2 id="ds-dialog-title">Delete this resume?</h2><button ref={dialogClose} className="icon-button" aria-label="Close" onClick={() => { setDialog(false); opener.current?.focus(); }}><X size={18} aria-hidden /></button></div>
        <p id="ds-dialog-desc" style={{ margin: 0, color: "var(--color-text-muted)" }}>“Product Lead resume” and its 4 versions will be removed. This can’t be undone.</p>
        <div className="modal-actions"><button className="button-secondary" onClick={() => { setDialog(false); opener.current?.focus(); }}>Cancel</button><button className="button-danger" onClick={() => { setDialog(false); opener.current?.focus(); flash("Deleted (demo only)."); }}>Delete resume</button></div>
      </div>
    </div>}
    {toast && <div className="toast" role="status">{toast}<button onClick={() => setToast("")} aria-label="Dismiss"><X size={14} aria-hidden /></button></div>}
  </>;
}
