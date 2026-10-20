import {BriefcaseBusiness,FileText,LayoutDashboard,ListChecks,Search,Settings,Sparkles,Building2,Users,Grid2X2} from 'lucide-react';
export const workspaceLinks=[
 {label:'Home',href:'/home',icon:LayoutDashboard},
 {label:'Resumes',href:'/resume-builder/resumes',icon:FileText},
 {label:'Career Assistant',href:'/ai-job-search',icon:Sparkles},
 {label:'Discover Jobs',href:'/discover-jobs',icon:Search},
 {label:'Job Tracker',href:'/jobs',icon:ListChecks},
 {label:'Companies',href:'/companies',icon:Building2},
 {label:'Contacts',href:'/contacts',icon:Users},
 {label:'Resources',href:'/search',icon:Search},
 {label:'All Tools',href:'/tools',icon:Grid2X2},
 {label:'Documents',href:'/documents',icon:BriefcaseBusiness},
 {label:'Settings',href:'/settings',icon:Settings},
];
/** Native links deliberately use a full request so navigation works without client hydration. */
export function ProductSidebar({name,active='/resume-builder/resumes',variant='product'}:{name:string;active?:string;variant?:'product'|'dashboard'}){
 return <aside className={variant==='dashboard'?'dash-sidebar':'product-sidebar'}><a href="/home" className="brand"><span className="brand-mark"><Sparkles size={15}/></span>career<span className="brand-os">os</span></a><span className="dash-label">YOUR SPACE</span><nav className="workspace-navigation" aria-label="Workspace">{workspaceLinks.map(({label,href,icon:Icon})=><a key={href} href={href} className={`dash-nav${active===href?' active':''}`} aria-current={active===href?'page':undefined}><Icon size={17}/>{label}</a>)}</nav><div className={variant==='dashboard'?'dash-side-bottom':'product-user'}><span className="dash-avatar">{name.slice(0,1).toUpperCase()}</span><span>{name}<small>CareerOS member</small></span></div></aside>;
}
