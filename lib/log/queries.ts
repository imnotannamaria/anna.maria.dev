import { count, desc, eq, sql } from "drizzle-orm"
import { createDb, dbUrl } from "@/lib/db/client"
import { logEntries } from "./schema"
import type { LogEntry, LogType } from "./validation"

type Row = typeof logEntries.$inferSelect

/**
 * Drizzle hands back `numeric` as a string. Convert here, once, so nothing downstream has
 * to remember. `date` already arrives as "YYYY-MM-DD", which is the shape the UI wants.
 */
function toEntry(row: Row): LogEntry {
  return {
    id: row.id,
    slug: row.slug,
    type: row.type as LogType,
    title: row.title,
    creator: row.creator,
    year: row.year,
    rating: row.rating == null ? null : Number(row.rating),
    favorite: row.favorite,
    note: row.note,
    posterUrl: row.posterUrl,
    externalUrl: row.externalUrl,
    loggedAt: row.loggedAt,
    published: row.published,
  }
}

/**
 * Without a database the page renders empty instead of crashing, which is how the wristkit
 * card already behaves. A fork with no DATABASE_URL should still build and serve.
 */
function db() {
  const url = dbUrl()
  return url ? createDb(url).db : null
}

/**
 * The public feed. Albums lead, then favorites, then newest.
 *
 * Plain recency puts whatever I happened to finish last at the top, which is rarely what I
 * want someone landing on /log to see. Music goes first deliberately; within that, and
 * within everything after it, the ♥ wins and date breaks the tie.
 *
 * To lead with a different type, change TYPE_ORDER — anything not listed sorts after
 * everything that is.
 */
const TYPE_ORDER: LogType[] = ["music"]

export async function getPublishedEntries(): Promise<LogEntry[]> {
  const conn = db()
  if (!conn) return []

  // A CASE giving each listed type its index and everything else a rank past the end.
  const typeRank = sql`case ${logEntries.type} ${sql.join(
    TYPE_ORDER.map((t, i) => sql`when ${t} then ${i}`),
    sql` `,
  )} else ${TYPE_ORDER.length} end`

  const rows = await conn
    .select()
    .from(logEntries)
    .where(eq(logEntries.published, true))
    .orderBy(
      typeRank,
      desc(logEntries.favorite),
      desc(logEntries.loggedAt),
      desc(logEntries.createdAt),
    )

  return rows.map(toEntry)
}

/** Counts per type for the stat boxes and the filter pills. Published only. */
export async function getTypeCounts(): Promise<Record<string, number>> {
  const conn = db()
  if (!conn) return {}

  const rows = await conn
    .select({ type: logEntries.type, total: count() })
    .from(logEntries)
    .where(eq(logEntries.published, true))
    .groupBy(logEntries.type)

  return Object.fromEntries(rows.map((r) => [r.type, Number(r.total)]))
}

/** The admin list. Includes drafts — that is the whole point of it. */
export async function getAllEntries(): Promise<LogEntry[]> {
  const conn = db()
  if (!conn) return []

  const rows = await conn
    .select()
    .from(logEntries)
    .orderBy(desc(logEntries.loggedAt), desc(logEntries.createdAt))

  return rows.map(toEntry)
}

export async function getEntryById(id: string): Promise<LogEntry | null> {
  const conn = db()
  if (!conn) return null

  const rows = await conn.select().from(logEntries).where(eq(logEntries.id, id)).limit(1)
  return rows[0] ? toEntry(rows[0]) : null
}

/** Every slug in use, so the admin can resolve a collision before it hits the index. */
export async function getTakenSlugs(): Promise<string[]> {
  const conn = db()
  if (!conn) return []

  const rows = await conn.select({ slug: logEntries.slug }).from(logEntries)
  return rows.map((r) => r.slug)
}
