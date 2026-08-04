import { type PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js"
import postgres, { type Sql } from "postgres"
import * as wristkitSchema from "@/lib/wristkit/schema"

/**
 * Every feature that talks to Postgres goes through here. wristkit and /log share one
 * Supabase database, so they should also share one connection pool.
 *
 * Phase 1 of docs/log-plan.md adds the log tables: `{ ...wristkitSchema, ...logSchema }`.
 */
const schema = { ...wristkitSchema }

export type AppDb = {
  db: PostgresJsDatabase<typeof schema>
  sql: Sql
}

// Serverless invocations reuse the module scope, so caching by URL keeps us from opening
// a new pool on every warm request.
let cached: { url: string; entry: AppDb } | null = null

export function createDb(url: string): AppDb {
  if (cached && cached.url === url) return cached.entry

  // Supabase's transaction pooler (port 6543) rejects prepared statements.
  const sql = postgres(url, { prepare: false })
  const entry: AppDb = { db: drizzle(sql, { schema }), sql }
  cached = { url, entry }
  return entry
}

/**
 * The one place that resolves the connection string. Returns null rather than throwing so
 * callers can degrade to an empty state — a missing database should not take down a page.
 *
 * WRISTKIT_DATABASE_URL is the old name, kept until DATABASE_URL is set in Vercel.
 */
export function dbUrl(): string | null {
  return process.env.DATABASE_URL ?? process.env.WRISTKIT_DATABASE_URL ?? null
}
