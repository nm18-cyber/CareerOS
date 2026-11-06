#!/usr/bin/env node
// Load a Cloudflare D1 export (wrangler d1 export ... --output file.sql) into Neon Postgres.
//
//   DATABASE_URL='postgresql://...' node scripts/neon-import.mjs path/to/careeros-d1-full.sql
//   node scripts/neon-import.mjs path/to/careeros-d1-full.sql --local   # rehearsal in an in-memory Postgres
//
// Creates the schema (db/postgres/schema.sql), copies every row in its original order, adds the
// starter content (db/postgres/seed.sql) and checks row counts. Refuses to run if the target
// database already holds CareerOS users, so it can't overwrite live data.
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';

const [file,...flags]=process.argv.slice(2);
const local=flags.includes('--local');
if(!file||!fs.existsSync(file)){console.error('Usage: node scripts/neon-import.mjs <d1-export.sql> [--local]');process.exit(1);}
if(!local&&!process.env.DATABASE_URL){console.error('Set DATABASE_URL to the Neon connection string (or pass --local to rehearse).');process.exit(1);}

// 1. Read the D1 export into an in-memory SQLite database.
const src=new DatabaseSync(':memory:',{enableForeignKeyConstraints:false});
src.exec(fs.readFileSync(file,'utf8').replace(/^PRAGMA .*$/gm,''));

// 2. Connect to the target.
let query,transaction,close=async()=>{};
if(local){
  const {PGlite}=await import('@electric-sql/pglite');const pg=new PGlite();
  query=async(text,params=[])=>(await pg.query(text,params)).rows;
  transaction=async list=>pg.transaction(async tx=>{for(const [t,p] of list)await tx.query(t,p)});
  close=()=>pg.close();
}else{
  const {neon}=await import('@neondatabase/serverless');const sql=neon(process.env.DATABASE_URL);
  query=(text,params=[])=>sql.query(text,params);
  transaction=list=>sql.transaction(list.map(([t,p])=>sql.query(t,p)));
}
const runScript=async text=>{for(const stmt of text.split(/;\s*$/m).map(s=>s.replace(/^\s*--.*$/gm,'').trim()).filter(Boolean))await query(stmt);};

// 3. Schema, with a guard against overwriting live data.
await runScript(fs.readFileSync('db/postgres/schema.sql','utf8'));
const existing=Number((await query('SELECT count(*) AS n FROM users'))[0].n);
if(existing>0){console.error(`Target already has ${existing} users; nothing was imported.`);await close();process.exit(1);}

// 4. Copy rows table by table, parents first, in original insertion (rowid) order.
const ORDER=['users','cms_resources','grader_settings','ai_settings','feed_cache','usage_limits','resumes','job_applications','user_profiles','resume_match_scores','companies','contacts','application_workspace','resume_versions','chat_sessions','chat_messages'];
const WITH_ROWID=new Set(['resume_versions','chat_sessions','chat_messages']);
const have=new Set(src.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r=>r.name));
const counts={};
for(const table of ORDER){
  if(!have.has(table)){counts[table]=0;continue;}
  const cols=src.prepare(`PRAGMA table_info("${table}")`).all().map(c=>c.name);
  const all=WITH_ROWID.has(table)?['rowid',...cols]:cols;
  const rows=src.prepare(`SELECT ${all.map(c=>c==='rowid'?'rowid':`"${c}"`).join(',')} FROM "${table}" ORDER BY rowid`).all();
  const insert=`INSERT INTO ${table} (${all.map(c=>`"${c}"`).join(',')}) VALUES (${all.map((_,i)=>'$'+(i+1)).join(',')})`;
  for(let i=0;i<rows.length;i+=200)await transaction(rows.slice(i,i+200).map(r=>[insert,all.map(c=>r[c]===undefined?null:typeof r[c]==='bigint'?Number(r[c]):r[c])]));
  if(WITH_ROWID.has(table)&&rows.length)await query(`SELECT setval(pg_get_serial_sequence('${table}','rowid'),(SELECT max(rowid) FROM ${table}))`);
  counts[table]=rows.length;
}

// 5. Starter content (skipped where the export already had it), then verify.
await runScript(fs.readFileSync('db/postgres/seed.sql','utf8'));
let ok=true;
for(const table of ORDER){
  const n=Number((await query(`SELECT count(*) AS n FROM ${table}`))[0].n);
  const flag=n>=counts[table]?'ok':'MISMATCH';if(flag!=='ok')ok=false;
  console.log(`${table.padEnd(22)} source ${String(counts[table]).padStart(4)}  target ${String(n).padStart(4)}  ${flag}`);
}
await close();
console.log(ok?`Import complete${local?' (local rehearsal; nothing sent to Neon)':''}.`:'Import finished with mismatches; check the rows above.');
process.exit(ok?0:1);
