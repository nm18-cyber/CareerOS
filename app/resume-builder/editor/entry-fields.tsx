'use client';
import {useState} from 'react';
import {Trash2,X} from 'lucide-react';
import {formatDates,sectionSchema,type Entry} from '../../../lib/resume-model';
const monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
const thisYear=new Date().getFullYear(),years=Array.from({length:thisYear+8-1950+1},(_,i)=>String(thisYear+8-i));
export const splitTags=(body:string)=>body.split(/[,\n]/).map(t=>t.trim()).filter(Boolean);
// Month is optional so "2019" alone stays valid; stored as 'YYYY-MM' or 'YYYY'.
function MonthYear({label,value='',disabled,onChange}:{label:string;value?:string;disabled?:boolean;onChange:(v:string)=>void}){
 const [y='',m='']=value.split('-'),set=(ny:string,nm:string)=>onChange(`${ny}${nm?`-${nm}`:''}`);
 return <fieldset className="rs-field rs-date" disabled={disabled}><legend>{label}</legend><div><select aria-label={`${label} month`} value={m} onChange={e=>set(y,e.target.value)}><option value="">Month</option>{monthNames.map((n,i)=><option key={n} value={String(i+1).padStart(2,'0')}>{n}</option>)}</select><select aria-label={`${label} year`} value={y} onChange={e=>set(e.target.value,m)}><option value="">Year</option>{years.map(n=><option key={n}>{n}</option>)}</select></div></fieldset>;
}
function TagInput({label,placeholder,value,onChange}:{label:string;placeholder:string;value:string;onChange:(v:string)=>void}){
 const tags=splitTags(value),[draft,setDraft]=useState('');
 const add=(parts:string[])=>{const next=[...tags];for(const p of parts.map(t=>t.trim()).filter(Boolean))if(!next.some(x=>x.toLowerCase()===p.toLowerCase()))next.push(p);if(next.length!==tags.length)onChange(next.join(', '));setDraft('')};
 // Mobile keyboards often report commas as "Unidentified" keydowns, so split on change too.
 return <div className="rs-field">{label}<div className="rs-tags">{tags.map(t=><span key={t}>{t}<button type="button" aria-label={`Remove ${t}`} onClick={()=>onChange(tags.filter(x=>x!==t).join(', '))}><X size={12}/></button></span>)}<input value={draft} aria-label={label} placeholder={tags.length?'Add another…':placeholder} onChange={e=>{const v=e.target.value;if(/[,\n]/.test(v)){const parts=v.split(/[,\n]/),rest=parts.pop()||'';add(parts);setDraft(rest)}else setDraft(v)}} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();add([draft])}else if(e.key==='Backspace'&&!draft&&tags.length)onChange(tags.slice(0,-1).join(', '))}} onBlur={()=>add([draft])}/></div><small>Press Enter or type a comma to add.</small></div>;
}
export function EntryForm({section,entry,index,onPatch,onRemove}:{section:string;entry:Entry;index:number;onPatch:(patch:Partial<Entry>)=>void;onRemove:()=>void}){
 const s=sectionSchema(section);
 const text=(k:'title'|'subtitle'|'location'|'link',f?:[string,string])=>f&&<label className="rs-field">{f[0]}<input type={k==='link'?'url':'text'} placeholder={f[1]} value={entry[k]||''} onChange={e=>onPatch({[k]:e.target.value})}/></label>;
 const dates=(p:Partial<Entry>)=>onPatch({...p,date:formatDates({...entry,...p},s.dates)});
 const [sy,sm]=(entry.start||'').split('-'),[ey,em]=(entry.end||'').split('-'),badRange=s.dates==='range'&&!entry.current&&!!sy&&!!ey&&(+ey<+sy||(ey===sy&&!!sm&&!!em&&+em<+sm));
 return <div className="rs-entry"><div className="rs-entry-top"><b>{entry.title||`${s.noun} ${index+1}`}</b><button aria-label={`Remove ${s.noun.toLowerCase()} ${index+1}`} onClick={onRemove}><Trash2 size={15}/></button></div>
  <div className="rs-fields">{text('title',s.title)}{text('subtitle',s.subtitle)}{text('location',s.location)}{text('link',s.link)}</div>
  {s.dates!=='none'&&<><div className="rs-fields"><MonthYear label={s.startLabel||'Date'} value={entry.start} onChange={v=>dates({start:v})}/>{s.dates==='range'&&<MonthYear label={entry.current?`${s.endLabel||'End date'} · Present`:s.endLabel||'End date'} value={entry.current?'':entry.end} disabled={entry.current} onChange={v=>dates({end:v})}/>}</div>{s.dates==='range'&&s.current&&<label className="rs-current"><input type="checkbox" checked={!!entry.current} onChange={e=>dates({current:e.target.checked})}/>{s.current}</label>}{badRange&&<p className="rs-date-error" role="alert">End date is before the start date.</p>}{!entry.start&&!entry.end&&!entry.current&&entry.date&&<small>Currently shown as “{entry.date}”. Pick dates above to replace it.</small>}</>}
  {s.tags?<TagInput label={s.body[0]} placeholder={s.body[1]} value={entry.body} onChange={body=>onPatch({body})}/>:<label className="rs-field">{s.body[0]}<textarea rows={s.rows||4} placeholder={s.body[1]} value={entry.body} onChange={e=>onPatch({body:e.target.value})}/></label>}
 </div>;
}
