import {env} from 'cloudflare:workers';
export class HttpError extends Error{constructor(message:string,public status=400){super(message)}}
export async function bodyJson(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)throw new HttpError('Cross-origin request rejected',403);
 if(!request.headers.get('content-type')?.includes('application/json'))throw new HttpError('JSON required',415);
 const reader=request.body?.getReader();if(!reader)throw new HttpError('Request body required');
 let size=0,text='';const decoder=new TextDecoder();while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>64000){await reader.cancel();throw new HttpError('Request too large',413)}text+=decoder.decode(value,{stream:true})}
 try{return JSON.parse(text+decoder.decode())}catch{throw new HttpError('Invalid JSON')}
}
export function apiError(e:unknown){return Response.json({error:e instanceof HttpError?e.message:'Request could not be completed. Please retry.'},{status:e instanceof HttpError?e.status:500,headers:{'Cache-Control':'no-store'}})}
export async function limit(userId:string,scope:string,max=30){
 if(!env.DB)throw new HttpError('Database unavailable',503);
 const now=Date.now(),bucket=Math.floor(now/3600000),key=`${scope}:${userId}:${bucket}`;
 const row=await env.DB.prepare('INSERT INTO usage_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,now+7200000).first<{count:number}>();
 if((row?.count??max+1)>max)throw new HttpError('Hourly limit reached. Please try again later.',429);
 await env.DB.prepare('DELETE FROM usage_limits WHERE expires_at<?').bind(now).run();
}
