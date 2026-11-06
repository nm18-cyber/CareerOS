// lib/access.ts against Postgres with a stubbed Neon Auth session: account creation, admin role,
// pre-Neon (Supabase-era) account handover by verified email only, and guest data claim.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
import {createTestDatabase,orphanCount} from './pg-harness.mjs';

const root=process.cwd(),out=path.join(root,'.sites-runtime/auth-handover');
const {DB,db,pg}=await createTestDatabase(out);
const t=globalThis.__careerTest={env:{DB,ADMIN_EMAIL:'boss@example.com'},session:null,cookies:{},headers:{}};
const stub=(name,code)=>{const p=path.join(out,name);fs.writeFileSync(p,code);return pathToFileURL(p).href;};
const stubs={
  'cloudflare:workers':stub('env.mjs','export const env=globalThis.__careerTest.env;'),
  'next/headers':stub('headers.mjs','export async function cookies(){const c=globalThis.__careerTest.cookies;return {get:n=>n in c?{value:c[n]}:undefined}} export async function headers(){const h=globalThis.__careerTest.headers;return {get:n=>h[n]??null}}'),
  'next/navigation':stub('nav.mjs','export function redirect(url){const e=new Error("REDIRECT "+url);e.redirect=url;throw e}'),
};
const local={'lib/db':stub('db.mjs','export const DB=globalThis.__careerTest.env.DB;'),'lib/auth/server':stub('auth.mjs','export const auth={getSession:async()=>({data:globalThis.__careerTest.session})};')};
function compile(file){const target=path.join(out,path.relative(root,file).replace(/\.tsx?$/,'.mjs'));fs.mkdirSync(path.dirname(target),{recursive:true});
  let js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
  js=js.replace(/from ["']([^"']+)["']/g,(whole,spec)=>{if(stubs[spec])return `from '${stubs[spec]}'`;if(spec.startsWith('.')){const rel=path.relative(root,path.resolve(path.dirname(file),spec)).replace(/\\/g,'/');if(local[rel])return `from '${local[rel]}'`;return `from '${pathToFileURL(compile(rel+'.ts'))}'`;}return whole});
  fs.writeFileSync(target,js);return target;}
const {currentUser,requireUser,requireAdmin}=await import(pathToFileURL(compile('lib/access.ts')).href);
const signIn=(id,email,emailVerified=true,name='Pat Example')=>{t.session={session:{id:'s'},user:{id,email,name,emailVerified}}};

// Signed out: null, and pages redirect to /login with the current path.
assert.equal(await currentUser(),null);
t.headers['x-careeros-path']='/jobs?tab=open';
await assert.rejects(requireUser(),e=>e.redirect==='/login?return_to=%2Fjobs%3Ftab%3Dopen');

// First sign-in creates the user row.
signIn('n-1','Pat@Example.com');
const pat=await currentUser();
assert.deepEqual([pat.userId,pat.email,pat.fullName,pat.role],['neon:n-1','pat@example.com','Pat Example','USER']);
assert.equal((await db.prepare('SELECT auth_provider FROM users WHERE id=?').get('neon:n-1')).auth_provider,'neon');

// Admin by verified ADMIN_EMAIL only.
signIn('n-2','boss@example.com',false);assert.equal(await requireAdmin(),null);
signIn('n-2','boss@example.com',true);assert.equal((await requireAdmin()).role,'ADMIN');

// A Supabase-era account with data, same email as a new Neon user.
await db.prepare("INSERT INTO users (id,email,auth_provider) VALUES ('supabase:old','legacy@example.com','supabase')").run();
await db.prepare("INSERT INTO resumes (id,user_id,title) VALUES ('r-old','supabase:old','Old resume')").run();
await db.prepare("INSERT INTO user_profiles (user_id,target_title) VALUES ('supabase:old','Designer')").run();
await db.prepare("INSERT INTO job_applications (id,user_id,title) VALUES ('j-old','supabase:old','Old job')").run();
await db.prepare("INSERT INTO application_workspace (job_id,user_id,resume_id) VALUES ('j-old','supabase:old','r-old')").run();

// Unverified email cannot claim it.
signIn('n-3','legacy@example.com',false);
assert.equal(await currentUser(),null);
assert.equal((await db.prepare('SELECT user_id FROM resumes WHERE id=?').get('r-old')).user_id,'supabase:old');

// Verified email takes the data over; the old row is gone.
signIn('n-3','legacy@example.com',true);
assert.equal((await currentUser()).userId,'neon:n-3');
for(const [sql,id] of [['SELECT user_id FROM resumes WHERE id=?','r-old'],['SELECT user_id FROM job_applications WHERE id=?','j-old'],['SELECT user_id FROM application_workspace WHERE job_id=?','j-old'],['SELECT user_id FROM user_profiles WHERE user_id=?','neon:n-3']])assert.equal((await db.prepare(sql).get(id)).user_id,'neon:n-3',sql);
assert.equal(await db.prepare("SELECT id FROM users WHERE id='supabase:old'").get(),undefined);
assert.equal((await db.prepare("SELECT target_title FROM user_profiles WHERE user_id='neon:n-3'").get()).target_title,'Designer');

// Guest work (anonymous cookie from the guest-access era) moves into the account once.
const guest='0b3c2f6e-1a2b-4c3d-8e4f-5a6b7c8d9e0f';
await db.prepare("INSERT INTO users (id,email,auth_provider) VALUES (?,?,'guest')").run('guest:'+guest,guest+'@guest.invalid');
await db.prepare("INSERT INTO resumes (id,user_id,title) VALUES ('r-guest',?,'Guest resume')").run('guest:'+guest);
await db.prepare("INSERT INTO user_profiles (user_id) VALUES (?)").run('guest:'+guest);
await db.prepare("INSERT INTO chat_sessions (id,user_id,title) VALUES ('c-guest',?,'Chat')").run('guest:'+guest);
t.cookies.careeros_guest=guest;signIn('n-1','pat@example.com');
await currentUser();
assert.equal((await db.prepare('SELECT user_id FROM resumes WHERE id=?').get('r-guest')).user_id,'neon:n-1');
assert.equal((await db.prepare('SELECT user_id FROM chat_sessions WHERE id=?').get('c-guest')).user_id,'neon:n-1');
assert.equal(await db.prepare('SELECT id FROM users WHERE id=?').get('guest:'+guest),undefined);
assert.equal((await db.prepare("SELECT count(*) AS n FROM user_profiles WHERE user_id='neon:n-1'").get()).n,1);

// Suspended accounts are refused.
await db.prepare("UPDATE users SET status='SUSPENDED' WHERE id='neon:n-1'").run();
assert.equal(await currentUser(),null);

assert.equal(await orphanCount(pg),0);
console.log('PASS: sign-in user record, admin by verified email, signed-out redirect with return path, legacy account handover (verified email only), guest data claim, suspended accounts, referential integrity.');
