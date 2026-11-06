import {DB} from "../../../lib/db";
import { defaultScoreWeights } from "../../../lib/scoring";
export const dynamic="force-dynamic";
export async function GET(){if(!DB)return Response.json({settings:defaultScoreWeights});const row=await DB.prepare("SELECT value FROM grader_settings WHERE key='thresholds'").first<{value:string}>();try{return Response.json({settings:row?JSON.parse(row.value):defaultScoreWeights})}catch{return Response.json({settings:defaultScoreWeights})}}
