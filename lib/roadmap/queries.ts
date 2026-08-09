import { asc, desc, ne, eq, sql } from "drizzle-orm"
import { createDb, dbUrl } from "@/lib/db/client"
import { roadmapItems } from "./schema"
import { PUBLIC_STATUSES, type RoadmapItem, type RoadmapStatus } from "./validation"

type Row = typeof roadmapItems.$inferSelect

function toItem(row: Row): RoadmapItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    blurb: row.blurb,
    status: row.status as RoadmapStatus,
    position: row.position,
    planUrl: row.planUrl,
    shippedAt: row.shippedAt,
  }
}

/**
 * Without a database the board renders empty instead of crashing, the same way the log and
 * the wristkit card already behave. A fork with no DATABASE_URL should still build.
 */
function db() {
  const url = dbUrl()
  return url ? createDb(url).db : null
}

/**
 * Everything the site shows: to do, in progress, shipped. `raw` never leaves the admin.
 *
 * Ordered so the board can slice this one array into three columns without a second query.
 * Within a column, `position` is the hand-set order and `created_at` breaks the tie, so a
 * column nobody has ordered still comes back oldest-first rather than at random.
 */
export async function getPublicItems(): Promise<RoadmapItem[]> {
  const conn = db()
  if (!conn) return []

  // A CASE giving each public status its board index, so one query returns the columns in
  // the order they are rendered.
  const statusRank = sql`case ${roadmapItems.status} ${sql.join(
    PUBLIC_STATUSES.map((s, i) => sql`when ${s} then ${i}`),
    sql` `,
  )} else ${PUBLIC_STATUSES.length} end`

  const rows = await conn
    .select()
    .from(roadmapItems)
    .where(ne(roadmapItems.status, "raw"))
    .orderBy(statusRank, asc(roadmapItems.position), asc(roadmapItems.createdAt))

  return rows.map(toItem)
}

/** The admin list. Includes `raw` — that is the whole point of it. Newest first. */
export async function getAllItems(): Promise<RoadmapItem[]> {
  const conn = db()
  if (!conn) return []

  const rows = await conn
    .select()
    .from(roadmapItems)
    .orderBy(asc(roadmapItems.position), desc(roadmapItems.createdAt))

  return rows.map(toItem)
}

export async function getItemById(id: string): Promise<RoadmapItem | null> {
  const conn = db()
  if (!conn) return null

  const rows = await conn.select().from(roadmapItems).where(eq(roadmapItems.id, id)).limit(1)
  return rows[0] ? toItem(rows[0]) : null
}

/** Every slug in use, so a collision is resolved before it reaches the unique index. */
export async function getTakenSlugs(): Promise<string[]> {
  const conn = db()
  if (!conn) return []

  const rows = await conn.select({ slug: roadmapItems.slug }).from(roadmapItems)
  return rows.map((r) => r.slug)
}
