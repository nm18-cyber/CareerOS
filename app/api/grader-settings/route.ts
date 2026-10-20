import { env } from "cloudflare:workers";
import { defaultScoreWeights } from "../../../lib/scoring";
export const dynamic="force-dynamic";
export async function GET(){if(!env.DB)return Response.json({settings:defaultScoreWeights});const row=await env.DB.prepare("SELECT value FROM grader_settings WHERE key='thresholds'").first<{value:string}>();try{return Response.json({settings:row?JSON.parse(row.value):defaultScoreWeights})}catch{return Response.json({settings:defaultScoreWeights})}}
