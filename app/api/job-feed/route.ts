import {currentUser} from '../../../lib/access';
import {jobFeed,filterJobs} from '../../../lib/job-feed';
import {apiError} from '../../../lib/server-guard';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{if(!await currentUser())return Response.json({error:'Sign in required'},{status:401});const p=new URL(request.url).searchParams;const result=await jobFeed();const filters={query:(p.get('query')??'').slice(0,120),location:(p.get('location')??'').slice(0,120),industry:(p.get('industry')??'').slice(0,80),remote:p.get('remote')??'all'};return Response.json({...result,jobs:filterJobs(result.jobs,filters),industries:[...new Set(result.jobs.flatMap(j=>j.tags))].sort(),source:'Arbeitnow',coverage:'Latest feed page, primarily European jobs. Remote roles may have location restrictions.'},{headers:{'Cache-Control':'private, no-store'}})}catch(e){return apiError(e)}}
