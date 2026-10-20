import {env} from 'cloudflare:workers';
import {HttpError} from './server-guard';
export type FeedJob={id:string;title:string;company:string;location:string;remote:boolean;tags:string[];url:string;description:string;published:number};
export type Filters={query?:string;location?:string;industry?:string;remote?:string};
export function filterJobs(jobs:FeedJob[],f:Filters){return jobs.filter(j=>(!f.query||`${j.title} ${j.company} ${j.tags.join(' ')}`.toLowerCase().includes(f.query.toLowerCase()))&&(!f.location||j.location.toLowerCase().includes(f.location.toLowerCase()))&&(!f.industry||(f.industry==='__tech'?j.tags.some(t=>/\bit\b|software|engineering|developer|data science|cyber|devops|technology/i.test(t)):j.tags.some(t=>t.toLowerCase().includes(f.industry!.toLowerCase()))))&&(f.remote!=='remote'||j.remote)&&(f.remote!=='onsite'||!j.remote));}
export function cleanText(s:unknown){return String(s??'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim()}
export async function jobFeed(){
 if(!env.DB)throw new HttpError('Job feed storage unavailable',503);
 const key='arbeitnow-v1';const cache=await env.DB.prepare('SELECT payload,fetched_at FROM feed_cache WHERE key=?').bind(key).first<{payload:string;fetched_at:number}>();
 if(cache&&Date.now()-cache.fetched_at<3600000)return {jobs:JSON.parse(cache.payload) as FeedJob[],fetchedAt:cache.fetched_at,stale:false};
 try{
 const response=await fetch('https://www.arbeitnow.com/api/job-board-api',{signal:AbortSignal.timeout(12000),headers:{Accept:'application/json'}});if(!response.ok)throw Error('Feed unavailable');
 const raw=await response.text();if(raw.length>5000000)throw Error('Feed too large');const data=JSON.parse(raw) as {data:Record<string,unknown>[]};if(!Array.isArray(data.data))throw Error('Invalid feed');
 const jobs:FeedJob[]=data.data.slice(0,150).flatMap(j=>{let url;try{url=new URL(String(j.url))}catch{return []}if(url.protocol!=='https:'||!['www.arbeitnow.com','arbeitnow.com'].includes(url.hostname))return [];return [{id:String(j.slug).slice(0,200),title:cleanText(j.title).slice(0,200),company:cleanText(j.company_name).slice(0,200),location:cleanText(j.location).slice(0,200),remote:j.remote===true,tags:Array.isArray(j.tags)?j.tags.map(t=>cleanText(t).slice(0,80)).slice(0,15):[],url:url.href,description:cleanText(j.description).slice(0,12000),published:Number(j.created_at)||0}]});
 if(!jobs.length)throw Error('Empty feed');const fetchedAt=Date.now();await env.DB.prepare('INSERT INTO feed_cache (key,payload,fetched_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET payload=excluded.payload,fetched_at=excluded.fetched_at').bind(key,JSON.stringify(jobs),fetchedAt).run();return {jobs,fetchedAt,stale:false};
 }catch{if(cache&&Date.now()-cache.fetched_at<86400000)return {jobs:JSON.parse(cache.payload) as FeedJob[],fetchedAt:cache.fetched_at,stale:true};throw new HttpError('The job provider is unavailable. Please retry later.',503)}
}
