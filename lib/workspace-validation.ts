import {z} from 'zod';
export const text=(max:number)=>z.string().trim().max(max).default('');
export const webUrl=text(500).refine(v=>!v||/^https?:\/\//i.test(v)&&(()=>{try{new URL(v);return true}catch{return false}})(),'Use a full http:// or https:// URL');
export const date=text(10).refine(v=>!v||/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v,'Use a valid date');
export const ref=z.string().max(100).nullable().optional().transform(v=>v||null);
export const companySchema=z.object({name:z.string().trim().min(1,'Company name is required').max(120),website:webUrl,industry:text(120),location:text(120),status:z.enum(['Researching','Target','Applied','Interview','Offer','Archived']).default('Researching'),notes:text(8000)});
export const contactSchema=z.object({name:z.string().trim().min(1,'Contact name is required').max(120),company_id:ref,role:text(120),email:text(200).refine(v=>!v||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),'Enter a valid email'),url:webUrl,relationship:z.enum(['Recruiter','Hiring manager','Referral','Colleague','Other']).default('Recruiter'),notes:text(8000),follow_up:date});
export const jobSchema=z.object({title:z.string().trim().min(1,'Job title is required').max(120),company:text(120),location:text(120),status:z.enum(['Saved','Applied','Interview','Offer','Rejected','Withdrawn']).default('Saved'),url:webUrl,notes:text(8000)});
export const workspaceSchema=jobSchema.extend({id:z.string().min(1).max(100),company_id:ref,contact_id:ref,resume_id:ref,cover_letter_id:ref,job_description:text(16000),interview_notes:text(12000),follow_up:date});
export function problem(message:string,status=400){return Response.json({error:message},{status});}
export async function input(request:Request){try{return await request.json() as Record<string,unknown>}catch{return null}}
