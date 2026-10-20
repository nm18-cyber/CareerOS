export type ScoreWeights={metricWeight:number;actionWeight:number;keywordWeight:number};
export const defaultScoreWeights:ScoreWeights={metricWeight:40,actionWeight:30,keywordWeight:30};
export function scoreResume(lines:string[],weights:ScoreWeights=defaultScoreWeights){
 const text=lines.join(" ");const words=text.trim().split(/\s+/).filter(Boolean).length;
 const metrics=(text.match(/\b\d+(?:%|x|k|\+)?\b|\$\d+/gi)||[]).length;
 const actions=(text.match(/\b(led|grew|built|launched|increased|reduced|managed|created|improved|delivered|generated|optimized|drove)\b/gi)||[]).length;
 const structure=Math.min(96,35+Math.min(60,words/2));
 const measurable=Math.min(96,18+metrics*22);
 const keywords=Math.min(96,28+actions*9+Math.min(35,words/6));
 if(!words)return {overall:32,structure:32,measurable:18,keywords:28};
 const total=Math.max(0,weights.metricWeight+weights.actionWeight+weights.keywordWeight)||100;
 const weighted=(measurable*weights.metricWeight+keywords*weights.actionWeight+structure*weights.keywordWeight)/total;
 return {overall:Math.min(96,Math.round(32+weighted*.64)),structure:Math.round(structure),measurable:Math.round(measurable),keywords:Math.round(keywords)};
}
