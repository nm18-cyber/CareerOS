"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, BadgeCheck, BriefcaseBusiness, Check, ChevronDown, CircleHelp, FileText, ListChecks, Menu, Search, Sparkles, Target, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { defaultScoreWeights, scoreResume, type ScoreWeights } from "../lib/scoring";

type User = { name: string; email: string } | null;
type ResourceApi={resource_type:string;title:string;description:string;column_no:number;slug:string};
const resourceGroups = [
  [{icon:"✳",title:"Career Hub",desc:"Practical strategies for your next move."},{icon:"⌕",title:"Tech Job Board",desc:"Roles worth your attention."},{icon:"▧",title:"Cover Letter Templates",desc:"Strong starts for every application."},{icon:"▤",title:"Resume Hub",desc:"A clear guide to better resumes."}],
  [{icon:"◫",title:"Resume Examples",desc:"Role-specific examples to learn from."},{icon:"▣",title:"Resume Templates",desc:"Layouts made for readable resumes."},{icon:"Aa",title:"Resume Synonyms",desc:"Sharper words for your experience."}],
  [{icon:"✉",title:"Cover Letter Examples",desc:"Examples for different roles and goals."},{icon:"▤",title:"CV Examples",desc:"Formats for academic and global CVs."},{icon:"↗",title:"Career Paths",desc:"Explore practical role guides."}],
];
const toolItems = ["Resume Keyword Scanner","ATS Resume Checker","Resume Job Description Match","Resume Bullet Point Generator"];

export default function CareerHome({ user }: { user: User }) {
  const router = useRouter();
  const [menu, setMenu] = useState<"tools"|"resources"|null>(null);
  const [tab, setTab] = useState("AI Resumes");
  const [bullets, setBullets] = useState("");
  const [weights,setWeights]=useState<ScoreWeights>(defaultScoreWeights);
  const [toast, setToast] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hubItems, setHubItems] = useState(() => resourceGroups.flat().map((r,i)=>({...r,columnNo:i<4?1:i<7?2:3,slug:r.title.toLowerCase().replaceAll(" ","-")})));
  const score = useMemo(() => scoreResume(bullets.split("\n"),weights), [bullets,weights]);
  useEffect(()=>{void fetch("/api/grader-settings").then(r=>r.json() as Promise<{settings?:ScoreWeights}>).then(d=>d?.settings&&setWeights(d.settings)).catch(()=>{})},[]);
  useEffect(()=>{void fetch("/api/resources").then(r=>r.ok?r.json() as Promise<{resources:ResourceApi[]}>:null).then(data=>{if(data?.resources?.length){const resources=data.resources as ResourceApi[];setHubItems(resources.filter(r=>r.resource_type==="link").map((r,i)=>({icon:resourceGroups.flat()[i]?.icon??"✳",title:r.title,desc:r.description,columnNo:r.column_no,slug:r.slug})))}}).catch(()=>{});},[]);
  const menuGroups = [1,2,3].map(col=>hubItems.filter(r=>r.columnNo===col));


  return <main className="site-shell">
    <header className="topbar">
      <a className="brand" href="#top" aria-label="CareerOS home"><span className="brand-mark"><Sparkles size={17}/></span><span>career<span className="brand-os">os</span></span></a>
      <nav className={`nav-links ${mobileOpen ? "nav-open" : ""}`}>
        <button className={`nav-trigger ${menu === "tools" ? "active" : ""}`} onClick={() => setMenu(menu === "tools" ? null : "tools")}>Tools <ChevronDown size={14}/></button>
        <button className={`nav-trigger ${menu === "resources" ? "active" : ""}`} onClick={() => setMenu(menu === "resources" ? null : "resources")}>Resources <ChevronDown size={14}/></button>
        <a href="#how-it-works" onClick={() => setMenu(null)}>How it works</a>
      </nav>
      <div className="top-actions"><a className="login-link" href={user ? "#workspace" : "/signin-with-chatgpt?return_to=%2Fhome"}>{user ? "My workspace" : "Sign in"}</a><a className="button button-yellow button-small" href="/signin-with-chatgpt?return_to=%2Fhome">Get started <ArrowRight size={14}/></a></div>
      <button className="mobile-menu" aria-label="Open menu" onClick={() => setMobileOpen(!mobileOpen)}><Menu size={20}/></button>
      {menu && <div className={`mega-menu ${menu === "resources" ? "mega-resources" : "mega-tools"}`}>
        <div className="mega-heading"><div><span className="eyebrow">{menu === "tools" ? "CAREER TOOLKIT" : "LEARN & EXPLORE"}</span><h3>{menu === "tools" ? "Tools for your next move" : "Career resources"}</h3></div><button className="icon-button" onClick={() => setMenu(null)} aria-label="Close menu"><X size={17}/></button></div>
        {menu === "tools" ? <div className="tool-menu-grid">{toolItems.map((x,i)=><a href={["/tools/keyword-scanner","/tools/ats-checker","/tools/keyword-scanner","/tools/writing"][i]} onClick={()=>{setMenu(null)}} className="menu-item" key={x}><span className="menu-icon"><Search size={16}/></span><span><b>{x}</b><small>{["Find the right words for each role.","Check your resume against ATS basics.","See how closely your resume fits.","Turn duties into clear achievements."][i]}</small></span><ArrowUpRight size={15}/></a>)}</div> : <div className="resource-menu-grid">{menuGroups.map((group,i)=><div className="resource-col" key={i}>{group.map(r=><a className="resource-menu-item" href={`/resources/${encodeURIComponent(r.slug)}`} onClick={()=>setMenu(null)} key={r.title}><span className="resource-glyph">{r.icon}</span><span><b>{r.title}</b><small>{r.desc}</small></span></a>)}</div>)}</div>}
      </div>}
    </header>

    <section className="hero" id="top">
      <div className="hero-copy"><div className="pill"><span className="pulse-dot"/> YOUR NEXT CHAPTER STARTS HERE</div><h1>Build your resume.<br/><em>Tell your story.</em><br/>Find your next move.</h1><p className="hero-sub">A clearer way to show what you bring. Build an ATS-friendly resume, tailor it to the role, and keep your job search moving.</p><div className="hero-buttons"><a href="/signin-with-chatgpt?return_to=%2Fhome" className="button button-yellow">Sign up — it’s 100% free <ArrowRight size={17}/></a><button className="text-button" onClick={()=>{document.getElementById("workspace")?.scrollIntoView({behavior:"smooth"})}}>Explore the workspace <ArrowDown size={15}/></button></div><div className="hero-trust"><div className="avatar-stack"><i>J</i><i>M</i><i>A</i><i>+</i></div><span>Made for the work you want next</span></div></div>
      <div className="hero-art" aria-label="Resume builder preview">
        <div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-spark spark-a">✳</div><div className="art-spark spark-b">✦</div>
        <div className="resume-preview"><div className="resume-top"><span className="resume-logo">M</span><div><b>MORGAN LEE</b><small>Product Marketing · New York, NY</small></div><span className="resume-dots">•••</span></div><div className="resume-rule"/><div className="resume-heading">EXPERIENCE</div><div className="resume-job"><b>Senior Marketing Manager</b><small>WeWork <i>·</i> 2021 — Present</small><span><Check size={12}/> Grew qualified pipeline by <strong>34%</strong> in two quarters</span><span><Check size={12}/> Reduced acquisition costs by <strong>18%</strong></span><span><Check size={12}/> Led a cross-functional team of <strong>8</strong></span></div><div className="resume-heading">EDUCATION</div><div className="resume-fake-line w80"/><div className="resume-fake-line w60"/><div className="resume-footer"><span>CAREEROS BUILDER</span><span>01 / 02</span></div></div>
        <div className="score-float"><div className="score-ring"><div><b>92</b><small>ATS score</small></div></div><div><b>Looking strong</b><small>Ready for this role</small></div><BadgeCheck className="score-check" size={19}/></div>
        <div className="keyword-float"><span className="keyword-mark"><Target size={15}/></span><div><b>Role match</b><small>Keywords aligned</small></div><span className="match-percent">+28%</span></div>
        <div className="art-caption"><span className="caption-line"/> Built around your next move</div>
      </div>
      <div className="hero-bottom"><span>YOUR WORK, WELL SAID.</span><span className="bottom-line"/><span>YOUR NEXT ROLE, CLOSER.</span></div>
    </section>

    <section className="proof-strip"><div><span className="proof-num">01</span><b>Show your impact</b><small>Turn responsibilities into results.</small></div><div><span className="proof-num">02</span><b>Match the role</b><small>Focus on relevant skills and terms.</small></div><div><span className="proof-num">03</span><b>Move with clarity</b><small>Keep applications organized.</small></div><a href="#workspace">See how it works <ArrowRight size={15}/></a></section>

    <section className="workspace-section" id="workspace">
      <div className="section-intro"><span className="eyebrow">YOUR CAREER, IN ONE PLACE</span><h2>Make each application<br/><em>feel intentional.</em></h2><p>A focused workspace that helps you build, tailor, and keep track — without losing sight of the story you want to tell.</p></div>
      <div className="ws-tools-grid">{[{title:'Resume Studio',text:'Edit, design, match, and export your documents.',href:'/resume-builder/resumes'},{title:'Career Assistant',text:'Explore career questions with your resume as context. Demo AI available; live provider optional.',href:'/ai-job-search'},{title:'Discover & Track',text:'Find feed listings and manage applications in one place.',href:'/discover-jobs'},{title:'Writing Studio',text:'Draft truthful bullet points, summaries, and letters. Demo AI available; live provider optional.',href:'/tools/writing'}].map(x=><a className="ws-tool" href={x.href} key={x.title}><h3>{x.title}</h3><p>{x.text}</p><span>Open workspace →</span></a>)}</div>
    </section>

    <section className="feature-section" id="how-it-works"><div className="feature-heading"><span className="eyebrow">A BETTER WAY TO GET THERE</span><h2>Good work deserves<br/>to <em>read like good work.</em></h2><p>Clarity beats jargon. Evidence beats adjectives. CareerOS helps you make the strongest parts of your experience easy to find.</p></div><div className="feature-grid"><article className="feature-card feature-highlight"><span className="feature-number">01 / WRITE</span><div className="feature-art art-write"><div className="write-paper"><span/><span/><span/><i><Sparkles size={13}/></i></div></div><h3>Make your experience specific.</h3><p>Use action, scope, and outcomes to write bullets that sound like you — and show what changed.</p><a href="/resume-builder/resumes">Try the resume editor <ArrowRight size={14}/></a></article><article className="feature-card"><span className="feature-number">02 / TAILOR</span><div className="feature-art art-tailor"><div className="match-card"><span>ROLE ALIGNMENT</span><b>Growth Marketing Lead</b><div><i/><i/><i/></div><small>Key skills highlighted</small></div><Target className="feature-float-icon" size={28}/></div><h3>Bring the right details forward.</h3><p>Compare your resume with a role and spot relevant terms or experience to emphasize.</p><a href="/tools/keyword-scanner">Explore matching mode <ArrowRight size={14}/></a></article><article className="feature-card"><span className="feature-number">03 / TRACK</span><div className="feature-art art-track"><div className="track-card"><span>APPLICATIONS</span><div><i className="track-dot green"/> Product Marketing Lead <small>Interview</small></div><div><i className="track-dot yellow"/> Marketing Manager <small>Applied</small></div><div><i className="track-dot gray"/> Brand Strategist <small>Saved</small></div></div></div><h3>Keep your search moving.</h3><p>One calm place for the roles, applications, and follow-ups you don’t want to lose.</p><a href="/jobs">Open job tracker <ArrowRight size={14}/></a></article></div></section>

    <section className="resources-section" id="resources"><div className="resources-head"><div><span className="eyebrow">THE CAREER RESOURCE HUB</span><h2>Useful things for<br/><em>what comes next.</em></h2></div><a href="/resources">Browse all resources <ArrowRight size={15}/></a></div><div className="resources-grid" id="resources-grid">{hubItems.map((r,i)=><a href={`/resources/${encodeURIComponent(r.slug)}`} className="resource-card" key={r.slug}><span className="resource-card-icon">{r.icon}</span><span className="resource-index">{String(i+1).padStart(2,"0")}</span><b>{r.title}</b><p>{r.desc}</p><ArrowUpRight size={16} className="resource-arrow"/></a>)}</div><div className="resource-note"><span>CAREEROS FIELD NOTES</span><p>Built to help you make informed choices. Examples are starting points — your experience is the differentiator.</p></div></section>

    <section className="closing-cta"><span className="eyebrow">YOUR NEXT MOVE IS YOURS</span><h2>Let’s make your work<br/>impossible to <em>overlook.</em></h2><a href="/signin-with-chatgpt?return_to=%2Fhome" className="button button-yellow">Build your free resume <ArrowRight size={16}/></a><small>No credit card needed. Sign in securely to save your progress.</small><span className="closing-spark">✳</span></section>

    <footer className="footer"><a className="brand" href="#top"><span className="brand-mark"><Sparkles size={15}/></span><span>career<span className="brand-os">os</span></span></a><span>Clarity for the work ahead.</span><div><a href="/resources">Resources</a><a href="/admin">Admin</a><a href={user?"/signout-with-chatgpt?return_to=%2F":"/signin-with-chatgpt?return_to=%2Fhome"}>{user?"Sign out":"Sign in"}</a></div><small>© 2026 CareerOS</small></footer>
    {toast && <div className="toast"><Check size={16}/>{toast}<button onClick={()=>setToast("")} aria-label="Close notification"><X size={14}/></button></div>}
  </main>;
}
