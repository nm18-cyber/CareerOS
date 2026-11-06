// The app's database: Neon Postgres over HTTP (works inside Cloudflare Workers).
import { env } from "cloudflare:workers";
import { neon } from "@neondatabase/serverless";
import { createDatabase, type Database, type Executor, type QueryResult } from "./db-core";

export type { Database, Statement } from "./db-core";

function neonExecutor(url: string): Executor {
  const sql = neon(url, { fullResults: true });

  return {
    query: (text, params) => sql.query(text, params) as Promise<QueryResult>,
    transaction: (queries) =>
      sql.transaction(queries.map((q) => sql.query(q.text, q.params))) as Promise<QueryResult[]>,
  };
}

// Undefined when DATABASE_URL is not configured, so routes can answer "storage unavailable".
export const DB: Database | undefined = env.DATABASE_URL
  ? createDatabase(neonExecutor(env.DATABASE_URL))
  : undefined;
