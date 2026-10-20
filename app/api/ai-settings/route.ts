import {env} from 'cloudflare:workers';
import {currentUser,requireAdmin} from '../../../lib/access';
import {settings,aiReady,aiMode,aiSchema} from '../../../lib/ai';
import {bodyJson,apiError,HttpError} from '../../../lib/server-guard';
export const dynamic='force-dynamic';
export async function GET(){if(!await currentUser())return Response.json({error:'Sign in required'},{status:401});const admin=await requireAdmin();return Response.json({ready:aiReady(),mode:aiMode(),...(admin?{settings:await settings()}:{}),provider:'OpenAI'},{headers:{'Cache-Control':'no-store'}})}
export async function PUT(request:Request){try{if(!await requireAdmin())throw new HttpError('Admin access required',403);const parsed=aiSchema.safeParse(await bodyJson(request));if(!parsed.success)throw new HttpError('Choose a valid model, a 20–8000 character system prompt, and a token limit of 128–4096.');if(!env.DB)throw new HttpError('Database unavailable',503);await env.DB.prepare("INSERT INTO ai_settings (key,value) VALUES ('model',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP").bind(JSON.stringify(parsed.data)).run();return Response.json({settings:parsed.data,ready:aiReady(),mode:aiMode()})}catch(e){return apiError(e)}}
