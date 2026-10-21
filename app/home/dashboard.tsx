"use client";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowRight, Check, ChevronRight, FileText, Grid2X2, ListChecks, Pencil, PlayCircle, Search, Sparkles, Target, X } from "lucide-react";
import { ProductSidebar } from "../../components/workspace-sidebar";

type Profile = { next_goal: string; target_title: string; target_date: string; salary_range: string };
type Load = "loading" | "ready" | "error";

const goalFields: { key: keyof Profile; label: string; hint: string }[] = [
  { key: "target_title", label: "Target title", hint: "e.g. Senior Product Designer" },
  { key: "next_goal", label: "What you want next", hint: "e.g. Move into a lead role at a product company" },
  { key: "target_date", label: "Target date", hint: "e.g. March 2027" },
  { key: "salary_range", label: "Salary range", hint: "e.g. $95,000 – $115,000" },
];
const steps = [
  { id: "resume", title: "Create your first resume", desc: "Start from a template or import an existing file.", action: "Open Resume Studio", href: "/resume-builder/resumes" },
  { id: "job", title: "Save a role you want", desc: "Track it so you can tailor your resume against it.", action: "Open Job tracker", href: "/jobs" },
  { id: "resources", title: "Read one practical guide", desc: "Pick a guide that matches your next move.", action: "Browse resources", href: "/resources", external: true },
];
const tools = [
  { title: "Resume Studio", desc: "Edit, design and export your documents.", href: "/resume-builder/resumes", icon: FileText },
  { title: "Career Assistant", desc: "Ask career questions with your resume as context.", href: "/ai-job-search", icon: Sparkles },
  { title: "Discover jobs", desc: "Browse listings and save the ones that fit.", href: "/discover-jobs", icon: Search },
  { title: "Job tracker", desc: "See every application and its next step.", href: "/jobs", icon: ListChecks },
];
// Unset fields are stored as "Set your …" placeholders by lib/profile.ts.
const isSet = (v: string | undefined) => !!v && !/^set your/i.test(v.trim());

async function loadDashboard() {
  const [p, t] = await Promise.all([fetch("/api/profile"), fetch("/api/onboarding")]);
  if (!p.ok || !t.ok) throw new Error("load failed");
  const { profile } = await p.json() as { profile: Profile };
  const { tasks, lessonDone } = await t.json() as { tasks: string[]; lessonDone: boolean };
  return { profile, tasks, lessonDone };
}

export default function HomeDashboard({ name }: { name: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<string[]>([]);
  const [lessonDone, setLessonDone] = useState(false);
  const [state, setState] = useState<Load>("loading");
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const flash = (message: string) => { setToast(message); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(""), 3200); };
  const retry = () => {
    setState("loading");
    void loadDashboard()
      .then((d) => { setProfile(d.profile); setTasks(d.tasks); setLessonDone(d.lessonDone); setState("ready"); })
      .catch(() => setState("error"));
  };
  useEffect(() => {
    let active = true;
    void loadDashboard()
      .then((d) => { if (!active) return; setProfile(d.profile); setTasks(d.tasks); setLessonDone(d.lessonDone); setState("ready"); })
      .catch(() => { if (active) setState("error"); });
    return () => { active = false; };
  }, []);

  const setTask = async (id: string, done: boolean) => {
    const before = tasks;
    setTasks(done ? [...new Set([...tasks, id])] : tasks.filter((t) => t !== id));
    const r = await fetch("/api/onboarding", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ task: id, done }) }).catch(() => null);
    if (!r?.ok) { setTasks(before); flash("Couldn’t update that step. Please try again."); }
  };
  const toggleLesson = async () => {
    const done = !lessonDone;
    setLessonDone(done);
    const r = await fetch("/api/onboarding", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ lessonDone: done }) }).catch(() => null);
    if (!r?.ok) { setLessonDone(!done); flash("Couldn’t save that. Please try again."); } else flash(done ? "Lesson marked as done." : "Lesson marked as not done.");
  };

  const doneCount = steps.filter((s) => tasks.includes(s.id)).length;
  const firstName = name.includes("@") ? "" : name.split(/\s/)[0];
  const nextStep = steps.find((s) => !tasks.includes(s.id));
  const hasGoal = !!profile && isSet(profile.target_title);

  return <main className="dash-layout">
    <a className="skip-link" href="#main">Skip to content</a>
    <ProductSidebar name={name} active="/home" />
    <section className="dash-main home" id="main">
      <header className="page-header">
        <div>
          <span className="label">Dashboard</span>
          <h1>{firstName ? `Welcome back, ${firstName}.` : "Welcome back."}</h1>
          <p>{state !== "ready" ? "Loading your workspace…" : doneCount === steps.length ? "Your foundations are in place. Keep tailoring and tracking." : `${steps.length - doneCount} of ${steps.length} first steps left — the next one is below.`}</p>
        </div>
        {/* While first steps remain, the next step is the primary action; this stays secondary. */}
        <div className="page-actions"><a href="/resume-builder/resumes" className={state === "ready" && !nextStep ? "button" : "outline-button"}>New resume <ArrowRight aria-hidden /></a></div>
      </header>

      {state === "error" && <div className="alert alert-error home-error" role="alert"><AlertCircle aria-hidden /><span><b>We couldn’t load your dashboard.</b> Check your connection, then try again.</span><button className="outline-button button-small" onClick={retry}>Try again</button></div>}

      <div className="home-grid">
        <section className="card home-steps" aria-labelledby="steps-title">
          <div className="card-header">
            <div><h2 className="card-title" id="steps-title">Getting started</h2><p className="card-meta">Three steps that make everything else easier.</p></div>
            <span className="badge badge-accent tabular" aria-label={`${doneCount} of ${steps.length} done`}>{doneCount}/{steps.length}</span>
          </div>
          <ol className="steps" aria-hidden>{steps.map((s) => <li key={s.id} data-state={tasks.includes(s.id) ? "done" : s === nextStep ? "current" : undefined}>{s.title}</li>)}</ol>
          <ul className="home-task-list">
            {steps.map((s, i) => {
              const done = tasks.includes(s.id);
              return <li key={s.id} className={`home-task${done ? " is-done" : ""}${s === nextStep ? " is-next" : ""}`}>
                <button className="home-task-check" role="checkbox" aria-checked={done} aria-label={`${s.title}: ${done ? "done" : "not done"}`} disabled={state !== "ready"} onClick={() => void setTask(s.id, !done)}>{done ? <Check aria-hidden size={16} /> : <span className="tabular">{i + 1}</span>}</button>
                <div className="home-task-copy"><h3>{s.title}</h3><p>{done ? "Done — nice work." : s.desc}</p></div>
                {!done && <a className={s === nextStep ? "button button-small" : "outline-button button-small"} href={s.href} {...(s.external ? { target: "_blank", rel: "noreferrer", onClick: () => void setTask(s.id, true) } : {})}>{s.action}{s.external && <span className="visually-hidden"> (opens in a new tab)</span>}</a>}
              </li>;
            })}
          </ul>
        </section>

        <section className="card home-goal" aria-labelledby="goal-title">
          <div className="card-header">
            <h2 className="card-title" id="goal-title">Career goal</h2>
            {hasGoal && <button className="icon-button" aria-label="Edit career goal" data-tooltip="Edit goal" onClick={() => setEditing(true)}><Pencil size={17} aria-hidden /></button>}
          </div>
          {state === "loading" && <div className="home-goal-skeleton" aria-busy="true" aria-label="Loading career goal"><div className="skeleton" style={{ width: "70%", height: 26 }} /><div className="skeleton" style={{ width: "90%" }} /><div className="skeleton" style={{ width: "50%" }} /></div>}
          {state !== "loading" && profile && !hasGoal && <div className="home-goal-empty"><span className="empty-state-icon"><Target aria-hidden /></span><p>Set a target role so we can point every tool at it.</p><button className="button button-small" onClick={() => setEditing(true)}>Set your goal</button></div>}
          {hasGoal && profile && <>
            <p className="home-goal-title">{profile.target_title}</p>
            <p className="home-goal-next">{profile.next_goal}</p>
            <dl className="home-goal-facts">
              <div><dt>Target date</dt><dd>{isSet(profile.target_date) ? profile.target_date : "Not set"}</dd></div>
              <div><dt>Salary range</dt><dd className="tabular">{isSet(profile.salary_range) ? profile.salary_range : "Not set"}</dd></div>
            </dl>
          </>}
        </section>

        <section className="home-tools" aria-labelledby="tools-title">
          <div className="home-section-head"><h2 id="tools-title">Your workspace</h2><a className="text-button" href="/tools"><Grid2X2 aria-hidden /> All tools</a></div>
          <ul className="home-tool-list">{tools.map(({ title, desc, href, icon: Icon }) => <li key={href}><a href={href} className="home-tool"><span className="home-tool-icon"><Icon aria-hidden size={20} /></span><span><b>{title}</b><small>{desc}</small></span><ChevronRight aria-hidden className="home-tool-arrow" size={18} /></a></li>)}</ul>
        </section>

        <section className="card home-lesson" aria-labelledby="lesson-title">
          <div className="card-header">
            <div><h2 className="card-title" id="lesson-title">Tailor your resume in 3 minutes</h2><p className="card-meta"><PlayCircle aria-hidden size={14} /> Short video lesson</p></div>
            {lessonDone && <span className="badge badge-success"><Check aria-hidden /> Done</span>}
          </div>
          <div className="home-video"><iframe src="https://www.youtube-nocookie.com/embed/hmfxWjbnV-k?rel=0" title="Video: how to tailor your resume" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
          <button className={lessonDone ? "outline-button button-small" : "button-secondary button-small"} onClick={() => void toggleLesson()} disabled={state !== "ready"} aria-pressed={lessonDone}>{lessonDone ? "Mark as not done" : <><Check aria-hidden /> Mark as done</>}</button>
        </section>
      </div>
      <footer className="home-footer"><span>© 2026 CareerOS</span><a href="/admin">Admin</a></footer>
    </section>
    {editing && profile && <GoalDialog profile={profile} onClose={() => setEditing(false)} onSaved={(p) => { setProfile(p); setEditing(false); flash("Career goal saved."); }} />}
    {toast && <div className="toast" role="status">{toast}<button onClick={() => setToast("")} aria-label="Dismiss"><X size={14} aria-hidden /></button></div>}
  </main>;
}

function GoalDialog({ profile, onClose, onSaved }: { profile: Profile; onClose: () => void; onSaved: (p: Profile) => void }) {
  const [draft, setDraft] = useState<Profile>(() => Object.fromEntries(goalFields.map(({ key }) => [key, isSet(profile[key]) ? profile[key] : ""])) as Profile);
  const [errors, setErrors] = useState<Partial<Record<keyof Profile, string>>>({});
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState("");
  const first = useRef<HTMLInputElement>(null);
  useEffect(() => {
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = Object.fromEntries(goalFields.filter(({ key }) => !draft[key].trim()).map(({ key, label }) => [key, `Enter a ${label.toLowerCase()}.`]));
    setErrors(missing);
    if (Object.keys(missing).length) return;
    setSaving(true); setFailure("");
    const r = await fetch("/api/profile", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(draft) }).catch(() => null);
    setSaving(false);
    if (r?.ok) onSaved(draft); else setFailure("We couldn’t save your goal. Please try again.");
  };
  return <div className="modal-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <form className="modal" role="dialog" aria-modal="true" aria-labelledby="goal-dialog-title" onSubmit={save} noValidate>
      <div className="modal-head"><div><span className="label">Career goal</span><h2 id="goal-dialog-title">Where are you heading?</h2></div><button type="button" className="icon-button" aria-label="Close" onClick={onClose}><X size={18} aria-hidden /></button></div>
      {failure && <div className="alert alert-error" role="alert"><AlertCircle aria-hidden />{failure}</div>}
      <div className="home-goal-form">{goalFields.map(({ key, label, hint }, i) => <label className="field" key={key}>
        <span className="field-label">{label}<span className="required" aria-hidden>*</span></span>
        <input ref={i === 0 ? first : undefined} className="input" value={draft[key]} placeholder={hint} maxLength={180} required aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${key}-error` : undefined} onChange={(e) => { setDraft({ ...draft, [key]: e.target.value }); if (errors[key]) setErrors({ ...errors, [key]: undefined }); }} />
        {errors[key] && <span className="field-error" id={`${key}-error`}><AlertCircle size={14} aria-hidden />{errors[key]}</span>}
      </label>)}</div>
      <div className="modal-actions"><button type="button" className="outline-button" onClick={onClose}>Cancel</button><button className="button" type="submit" aria-busy={saving} disabled={saving}>{saving ? "Saving…" : "Save goal"}</button></div>
    </form>
  </div>;
}
