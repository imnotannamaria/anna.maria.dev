import { asc, desc, ne, eq } from "drizzle-orm"
import { createDb, dbUrl } from "@/lib/db/client"
import { isUuid } from "@/lib/utils"
import { roadmapItems } from "./schema"
import type { RoadmapItem, RoadmapStatus } from "./validation"

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
 * Ordered by `position`, the hand-set order, with `created_at` breaking the tie so a column
 * nobody has ordered still comes back oldest-first rather than at random. No CASE ranking
 * the statuses: the board groups these rows into columns itself, so nothing downstream can
 * observe what order the statuses came back in.
 */
export async function getPublicItems(): Promise<RoadmapItem[]> {
  const conn = db()
  if (!conn) return []

  const rows = await conn
    .select()
    .from(roadmapItems)
    .where(ne(roadmapItems.status, "raw"))
    .orderBy(asc(roadmapItems.position), asc(roadmapItems.createdAt))

  return rows.map(toItem)
}

/**
 * The admin list. Includes `raw` — that is the whole point of it. Newest first.
 *
 * Not by `position`: that is the board's within-column order and it means nothing in a flat
 * list across four statuses. This screen is the capture log, so what was written last is
 * what wants to be at the top.
 */
export async function getAllItems(): Promise<RoadmapItem[]> {
  const conn = db()
  if (!conn) return []

  const rows = await conn.select().from(roadmapItems).orderBy(desc(roadmapItems.createdAt))

  return rows.map(toItem)
}

export async function getItemById(id: string): Promise<RoadmapItem | null> {
  const conn = db()
  // A URL can hold anything, and `where id = 'garbage'` against a uuid column raises rather
  // than returning nothing — which would turn a wrong URL into an error page.
  if (!conn || !isUuid(id)) return null

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
