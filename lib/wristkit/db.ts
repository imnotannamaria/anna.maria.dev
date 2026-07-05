import { type PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js"
import postgres, { type Sql } from "postgres"
import * as schema from "./schema"

export type RegistryDb = {
  db: PostgresJsDatabase<typeof schema>
  sql: Sql
  close: () => Promise<void>
}

let cached: { url: string; entry: RegistryDb } | null = null

export function createDb(url: string): RegistryDb {
  if (cached && cached.url === url) return cached.entry

  const sql = postgres(url, { prepare: false })
  const db = drizzle(sql, { schema })
  const entry: RegistryDb = {
    db,
    sql,
    close: async () => {},
  }
  cached = { url, entry }
  return entry
}
