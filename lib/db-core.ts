// Postgres access with the small D1-style API the routes were written against:
//   DB.prepare(sql).bind(...values).first() / .all() / .run(),  DB.batch([...statements])
// SQL keeps SQLite-style `?` placeholders; they are rewritten to $1, $2, ... here.
// No runtime imports, so tests can run it against an in-memory Postgres (PGlite).

export type QueryResult = {
  rows: Record<string, unknown>[];
  rowCount: number | null;
  fields: { name: string; dataTypeID: number }[];
};

export type Executor = {
  query(text: string, params: unknown[]): Promise<QueryResult>;
  // All statements commit together or none do (same guarantee as D1 batch).
  transaction(queries: { text: string; params: unknown[] }[]): Promise<QueryResult[]>;
};

type RunResult = { meta: { changes: number } };

export type Statement = {
  bind(...values: unknown[]): Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<RunResult>;
  readonly text: string;
  readonly params: unknown[];
};

export type Database = {
  prepare(sql: string): Statement;
  batch(statements: Statement[]): Promise<RunResult[]>;
};

// Timestamps are stored as UTC text "YYYY-MM-DD HH:MM:SS", the format the app has always used.
const UTC_NOW = "to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')";

// Rewrite `?` placeholders and CURRENT_TIMESTAMP outside quoted strings/identifiers.
export function toPostgres(sql: string) {
  let out = "";
  let n = 0;
  let i = 0;

  while (i < sql.length) {
    const ch = sql[i];

    if (ch === "'" || ch === '"') {
      const end = sql.indexOf(ch, i + 1);
      const stop = end === -1 ? sql.length : end + 1;
      out += sql.slice(i, stop);
      i = stop;
      continue;
    }

    if (ch === "?") {
      out += `$${++n}`;
      i++;
      continue;
    }

    if (/[A-Za-z_]/.test(ch) && (i === 0 || !/[A-Za-z0-9_$]/.test(sql[i - 1]))) {
      const word = /^[A-Za-z_][A-Za-z0-9_]*/.exec(sql.slice(i))![0];
      out += word.toUpperCase() === "CURRENT_TIMESTAMP" ? UTC_NOW : word;
      i += word.length;
      continue;
    }

    out += ch;
    i++;
  }

  return out;
}

// bigint (20) and numeric (1700) arrive as strings; the app expects JS numbers.
const NUMERIC_TYPES = new Set([20, 1700]);

function normalize(result: QueryResult) {
  const numeric = result.fields.filter((f) => NUMERIC_TYPES.has(f.dataTypeID)).map((f) => f.name);

  if (numeric.length) {
    for (const row of result.rows) {
      for (const name of numeric) {
        if (row[name] !== null && row[name] !== undefined) row[name] = Number(row[name]);
      }
    }
  }

  return result.rows;
}

function bindValue(value: unknown) {
  if (value === undefined) return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  return value;
}

export function createDatabase(exec: Executor): Database {
  function statement(text: string, params: unknown[]): Statement {
    return {
      text,
      params,
      bind: (...values) => statement(text, values.map(bindValue)),
      async first<T>() {
        const rows = normalize(await exec.query(text, params));
        return (rows[0] as T) ?? null;
      },
      async all<T>() {
        return { results: normalize(await exec.query(text, params)) as T[] };
      },
      async run() {
        const result = await exec.query(text, params);
        return { meta: { changes: result.rowCount ?? 0 } };
      },
    };
  }

  return {
    prepare: (sql) => statement(toPostgres(sql), []),
    async batch(statements) {
      const results = await exec.transaction(statements.map((s) => ({ text: s.text, params: s.params })));
      return results.map((r) => ({ meta: { changes: r.rowCount ?? 0 } }));
    },
  };
}
