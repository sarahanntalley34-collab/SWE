import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;

// Lazy initialization: only connect when actually used, so builds don't fail
// when DATABASE_URL is not set.
let _db: ReturnType<typeof drizzle> | null = null;
let _sql: ReturnType<typeof neon> | null = null;

function getDb() {
  if (!_db) {
    if (!DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is not set. Please configure it in your environment."
      );
    }
    _sql = neon(DATABASE_URL);
    _db = drizzle(_sql, { schema });
  }
  return _db;
}

function getSql() {
  if (!_sql) {
    if (!DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is not set. Please configure it in your environment."
      );
    }
    _sql = neon(DATABASE_URL);
    _db = drizzle(_sql, { schema });
  }
  return _sql;
}

// Proxy that defers database connection until first query
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    return (getDb() as any)[prop];
  },
});

export const sql = new Proxy({} as ReturnType<typeof neon>, {
  get(_, prop) {
    return (getSql() as any)[prop];
  },
});
