import { afterAll, beforeEach } from "vitest"
import postgres from "postgres"
import { assertDisposableDatabase } from "./assert-disposable-db"

const url = process.env.DATABASE_URL
if (!url) {
  throw new Error(
    "Integration tests need DATABASE_URL. Run `docker compose -f docker-compose.test.yml up -d` " +
      "first, or export DATABASE_URL to point at a disposable Postgres — never the real one.",
  )
}

// The `beforeEach` below TRUNCATEs three tables with no undo. "never the real one" as
// advice is not a guard, and .env.local holds a real connection string one `source` away.
assertDisposableDatabase(url, "TRUNCATE")

const sql = postgres(url, { prepare: false })

beforeEach(async () => {
  await sql`truncate log_entries, roadmap_items, wristkit_samples restart identity cascade`
})

afterAll(async () => {
  await sql.end()
})
