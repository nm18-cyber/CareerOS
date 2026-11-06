// Shared test database: an in-memory Postgres (PGlite) loaded with db/postgres/schema.sql and
// seed.sql, exposed through the same adapter (lib/db-core.ts) the app uses with Neon.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
import {PGlite} from '@electric-sql/pglite';

export async function createTestDatabase(outDir){
  const pg=new PGlite();
  for(const file of ['schema.sql','seed.sql'])await pg.exec(fs.readFileSync(path.join('db/postgres',file),'utf8'));
  const core=path.join(outDir,'db-core.mjs');
  fs.mkdirSync(outDir,{recursive:true});
  fs.writeFileSync(core,ts.transpileModule(fs.readFileSync('lib/db-core.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText);
  const {createDatabase}=await import(pathToFileURL(core).href);
  const shape=r=>({rows:r.rows,rowCount:r.affectedRows??r.rows.length,fields:r.fields});
  const DB=createDatabase({
    async query(text,params){return shape(await pg.query(text,params))},
    async transaction(queries){return pg.transaction(async tx=>{const out=[];for(const q of queries)out.push(shape(await tx.query(q.text,q.params)));return out})},
  });
  // Direct helpers for assertions, with the same `?` placeholders as the app's SQL.
  const db={prepare:sql=>({
    get:(...args)=>DB.prepare(sql).bind(...args).first().then(r=>r??undefined),
    all:(...args)=>DB.prepare(sql).bind(...args).all().then(r=>r.results),
    run:(...args)=>DB.prepare(sql).bind(...args).run(),
  })};
  return {DB,db,pg};
}

// Every foreign key must point at an existing row (PGlite enforces this; double-check anyway).
export async function orphanCount(pg){
  const fks=(await pg.query(`SELECT tc.table_name t, kcu.column_name c, ccu.table_name rt, ccu.column_name rc
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON kcu.constraint_name=tc.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name=tc.constraint_name
    WHERE tc.constraint_type='FOREIGN KEY'`)).rows;
  let n=0;
  for(const f of fks)n+=Number((await pg.query(`SELECT count(*) n FROM ${f.t} x WHERE x.${f.c} IS NOT NULL AND NOT EXISTS (SELECT 1 FROM ${f.rt} y WHERE y.${f.rc}=x.${f.c})`)).rows[0].n);
  return n;
}
