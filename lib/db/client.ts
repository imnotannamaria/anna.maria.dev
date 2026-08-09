import { type PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js"
import postgres, { type Sql } from "postgres"
import * as logSchema from "@/lib/log/schema"
import * as roadmapSchema from "@/lib/roadmap/schema"
import * as wristkitSchema from "@/lib/wristkit/schema"

/**
 * Every feature that talks to Postgres goes through here. wristkit, /log and /roadmap share
 * one Supabase database, so they should also share one connection pool.
 */
const schema = { ...wristkitSchema, ...logSchema, ...roadmapSchema }

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
 * Empty counts as unset. `??` alone would not do that, and `.env.example` ships
 * `DATABASE_URL=` with no value, so anyone copying it would get "" here: truthy enough to
 * build a client, useless enough to fail on the first query. That turns "the log renders
 * empty" into "the page throws", which is the opposite of the intent.
 *
 * WRISTKIT_DATABASE_URL is the old name, kept until DATABASE_URL is set in Vercel.
 */
export function dbUrl(): string | null {
  const candidates = [process.env.DATABASE_URL, process.env.WRISTKIT_DATABASE_URL]
  return candidates.find((v) => v?.trim())?.trim() ?? null
}
