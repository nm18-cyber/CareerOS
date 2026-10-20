import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
import {DatabaseSync} from 'node:sqlite';
const root=process.cwd(),out=path.join(root,'.sites-runtime/ai-regression');fs.mkdirSync(out,{recursive:true});
const db=new DatabaseSync(':memory:');db.exec('PRAGMA foreign_keys=ON');
for(const filename of fs.readdirSync('drizzle').filter(n=>n.endsWith('.sql')).sort())db.exec(fs.readFileSync(path.join('drizzle',filename),'utf8'));
function prepare(sql,values=[]){return {bind(...args){return prepare(sql,args)},async first(){return db.prepare(sql).get(...values)||null},async all(){return {results:db.prepare(sql).all(...values)}},async run(){const r=db.prepare(sql).run(...values);return {meta:{changes:Number(r.changes)}}}}}
const D1={prepare,async batch(statements){db.exec('BEGIN');try{const result=[];for(const s of statements)result.push(await s.run());db.exec('COMMIT');return result}catch(e){db.exec('ROLLBACK');throw e}}};
globalThis.__careerTest={env:{DB:D1},user:{userId:'test-user-a',email:'a@example.com'}};
fs.writeFileSync(path.join(out,'env.mjs'),'export const env=globalThis.__careerTest.env;');fs.writeFileSync(path.join(out,'access.mjs'),'export async function currentUser(){return globalThis.__careerTest.user} export async function requireAdmin(){return globalThis.__careerTest.user?.role==="ADMIN"?globalThis.__careerTest.user:null}');fs.writeFileSync(path.join(out,'profile.mjs'),'export async function markTask(){}');
const built=new Map();function compile(file){file=path.resolve(file);if(built.has(file))return built.get(file);const target=path.join(out,path.relative(root,file).replace(/\.tsx?$/,'.mjs'));built.set(file,target);fs.mkdirSync(path.dirname(target),{recursive:true});let js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;js=js.replace(/from ["']([^"']+)["']/g,(whole,spec)=>{if(spec==='cloudflare:workers')return `from '${pathToFileURL(path.join(out,'env.mjs'))}'`;if(spec.startsWith('.')){const abs=path.resolve(path.dirname(file),spec);if(abs===path.join(root,'lib/access'))return `from '${pathToFileURL(path.join(out,'access.mjs'))}'`;if(abs===path.join(root,'lib/profile'))return `from '${pathToFileURL(path.join(out,'profile.mjs'))}'`;const found=[abs,abs+'.ts',abs+'.tsx'].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());if(found)return `from '${pathToFileURL(compile(found))}'`;}return whole});fs.writeFileSync(target,js);return target;}
const load=async p=>import(pathToFileURL(compile(p)).href);

const chat=await load('app/api/chat/route.ts'),admin=await load('app/api/ai-settings/route.ts'),feed=await load('app/api/job-feed/route.ts'),templates=await load('app/api/resources/use-template/route.ts');
const {filterJobs}=await load('lib/job-feed.ts'),{limit}=await load('lib/server-guard.ts'),{demoConfig}=await load('lib/resume-model.ts');
for(const [id,email] of [['test-user-a','a@example.com'],['test-user-b','b@example.com']])db.prepare('INSERT INTO users (id,email) VALUES (?,?)').run(id,email);
const config=demoConfig();config.summary='A unique verified career fact: designed the Northstar dashboard.';
db.prepare('INSERT INTO resumes (id,user_id,title,template_config_json) VALUES (?,?,?,?)').run('resume-a','test-user-a','Test resume',JSON.stringify(config));
function req(path,data,method='POST',origin='https://career.test'){return new Request('https://career.test'+path,{method,headers:{'Content-Type':'application/json',Origin:origin},...(data===undefined?{}:{body:JSON.stringify(data)})});}
async function good(response){assert(response.ok,await response.clone().text());return response.json();}
function events(text){return text.split('\n\n').filter(Boolean).map(x=>({type:x.split('\n')[0].slice(7),data:JSON.parse(x.split('\n')[1].slice(6))}));}
assert.equal((await chat.POST(req('/api/chat',{prompt:' '}))).status,400);
assert.equal((await chat.POST(req('/api/chat',{prompt:'hello'},'POST','https://evil.example'))).status,403);
assert.equal((await chat.POST(req('/api/chat',{prompt:'x'.repeat(65000)}))).status,413);
assert.equal((await chat.POST(new Request('https://career.test/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:'{'}))).status,400);
let response=await chat.POST(req('/api/chat',{prompt:'Explore my options',resumeId:'resume-a'}));assert.equal(response.status,200);assert(response.headers.get('content-type').startsWith('text/event-stream'));
const chunks=events(await response.text()),id=chunks.find(e=>e.type==='session').data.id;assert(chunks.filter(e=>e.type==='delta').length>2);assert.equal(chunks.at(-1).type,'done');
const conversation=await good(await chat.GET(req('/api/chat?id='+id,undefined,'GET')));assert.equal(conversation.messages.length,2);assert(conversation.messages[1].content.includes('DEMO AI'));assert(conversation.messages[1].content.includes('Northstar dashboard'));assert.equal(conversation.messages[0].context_label,'Test resume');
assert.equal(db.prepare('SELECT busy_until FROM chat_sessions WHERE id=?').get(id).busy_until,0);
globalThis.__careerTest.user={userId:'test-user-b',email:'b@example.com'};
assert.equal((await chat.GET(req('/api/chat?id='+id,undefined,'GET'))).status,404);
assert.equal((await chat.POST(req('/api/chat',{sessionId:id,prompt:'Steal history'}))).status,404);
assert.equal((await chat.POST(req('/api/chat',{resumeId:'resume-a',prompt:'Steal resume'}))).status,404);
assert.equal((await chat.DELETE(req('/api/chat',{id},'DELETE'))).status,404);
assert.equal((await admin.PUT(req('/api/ai-settings',{model:'x',systemPrompt:'Example safe system prompt long enough.',maxTokens:512},'PUT'))).status,403);
globalThis.__careerTest.user=null;assert.equal((await chat.GET(req('/api/chat',undefined,'GET'))).status,401);assert.equal((await feed.GET(req('/api/job-feed',undefined,'GET'))).status,401);
globalThis.__careerTest.user={userId:'test-user-a',email:'a@example.com',role:'ADMIN'};
await good(await admin.PUT(req('/api/ai-settings',{model:'gpt-4.1-mini',systemPrompt:'A saved career coaching system prompt for testing.',maxTokens:512},'PUT')));assert.equal((await good(await admin.GET())).settings.maxTokens,512);
assert.equal((await admin.PUT(req('/api/ai-settings',{model:'https://evil.example',systemPrompt:'A safe prompt with enough characters.',maxTokens:512},'PUT'))).status,400);
assert.equal((await admin.PUT(req('/api/ai-settings',{model:'model',systemPrompt:'A safe prompt with enough characters.',maxTokens:100000},'PUT'))).status,400);
// Real provider contract mocked locally: split SSE frames, persist result, pass resume facts server-side.
globalThis.__careerTest.env.OPENAI_API_KEY='test-only-not-a-real-key';const originalFetch=globalThis.fetch;let sent;
globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.openai.com/v1/chat/completions');sent=JSON.parse(options.body);return new Response(new ReadableStream({start(c){for(const part of ['data: {"choices":[{"delta":{"content":"Streamed "}}]}\n','\ndata: {"choices":[{"delta":{"content":"response"}}]}\n\ndata: [DONE]\n\n'])c.enqueue(new TextEncoder().encode(part));c.close()}}))};
response=await chat.POST(req('/api/chat',{sessionId:id,prompt:'Write my summary',resumeId:'resume-a',mode:'summary'}));const live=events(await response.text());assert.equal(live.at(-1).data.status,'complete');assert(sent.messages.at(-1).content.includes('Northstar dashboard'));assert(!sent.messages.at(-1).content.includes('alex.morgan@example.com'));assert.equal(sent.max_completion_tokens,512);
let saved=await good(await chat.GET(req('/api/chat?id='+id,undefined,'GET')));assert.equal(saved.messages.at(-1).content,'Streamed response');
// Truncated provider stream is marked interrupted, never recorded as complete.
globalThis.fetch=async()=>new Response('data: {"choices":[{"delta":{"content":"Partial"}}]}\n\n');response=await chat.POST(req('/api/chat',{sessionId:id,prompt:'One more question'}));const broken=events(await response.text());assert(broken.some(e=>e.type==='error'));assert.equal(broken.at(-1).data.status,'interrupted');
assert.equal(db.prepare('SELECT busy_until FROM chat_sessions WHERE id=?').get(id).busy_until,0);
globalThis.fetch=originalFetch;delete globalThis.__careerTest.env.OPENAI_API_KEY;
// Concurrent sends are rejected without consuming an existing lock.
db.prepare('UPDATE chat_sessions SET busy_until=? WHERE id=?').run(Date.now()+30000,id);assert.equal((await chat.POST(req('/api/chat',{sessionId:id,prompt:'Busy'}))).status,409);assert(db.prepare('SELECT busy_until FROM chat_sessions WHERE id=?').get(id).busy_until>Date.now());db.prepare('UPDATE chat_sessions SET busy_until=0 WHERE id=?').run(id);
const fixture=[{id:'a',title:'Engineer',company:'Test',location:'Berlin',remote:true,tags:['IT'],url:'https://www.arbeitnow.com/jobs/example',description:'Build systems',published:1},{id:'b',title:'Designer',company:'Studio',location:'London',remote:false,tags:['Design'],url:'https://www.arbeitnow.com/jobs/example2',description:'Design products',published:2}];
assert.equal(filterJobs(fixture,{remote:'remote',location:'berlin',industry:'IT'}).length,1);assert.equal(filterJobs(fixture,{location:'Delhi'}).length,0);assert.equal(filterJobs(fixture,{remote:'onsite'})[0].id,'b');
db.prepare('INSERT INTO feed_cache (key,payload,fetched_at) VALUES (?,?,?)').run('arbeitnow-v1',JSON.stringify(fixture),Date.now());const jobs=await good(await feed.GET(req('/api/job-feed?remote=remote',undefined,'GET')));assert.equal(jobs.jobs.length,1);assert.equal(jobs.source,'Arbeitnow');
const doc=await good(await templates.POST(req('/api/resources/use-template',{slug:'template-modern-technical'})));const created=db.prepare('SELECT template_config_json,user_id FROM resumes WHERE id=?').get(doc.id);assert.equal(created.user_id,'test-user-a');assert.equal(JSON.parse(created.template_config_json).layout,'Compact');
assert.equal((await templates.POST(req('/api/resources/use-template',{slug:'missing'}))).status,404);
await limit('rate-user','test',1);await assert.rejects(()=>limit('rate-user','test',1),e=>e.status===429);
await good(await chat.DELETE(req('/api/chat',{id},'DELETE')));assert.equal(db.prepare('SELECT count(*) AS n FROM chat_messages WHERE session_id=?').get(id).n,0);assert.equal(db.prepare('PRAGMA foreign_key_check').all().length,0);
console.log('PASS: demo streaming, resume context, saved history, cross-account isolation, CSRF/body limits, live SSE adapter contract, interrupted responses, concurrent-send lock, admin settings, job filters/cache, template creation, rate limits, cascade deletion. Provider integration uses test doubles; no live AI call made.');
