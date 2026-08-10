import "server-only"
import { eq } from "drizzle-orm"
import { createDb, dbUrl } from "@/lib/db/client"
import { slugify, uniqueSlug } from "@/lib/slug"
import { isUuid } from "@/lib/utils"
import { getTakenSlugs } from "./queries"
import { roadmapItems } from "./schema"
import type { RoadmapItemInput } from "./validation"

function db() {
  const url = dbUrl()
  if (!url) throw new Error("DATABASE_URL is not set")
  return createDb(url).db
}

/** The form sends "" for untouched optional fields; the columns want null. */
function blankToNull(v: string | undefined | null): string | null {
  const trimmed = v?.trim()
  return trimmed ? trimmed : null
}

/** Today in São Paulo as YYYY-MM-DD, so a ship date is never a day off. */
function today(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date())
}

/**
 * shipped_at is derived, never typed.
 *
 * The database rejects a ship date on anything that is not `done`, so this is the only
 * place that decides: moving into `done` stamps today, moving out clears it, and an item
 * that was already shipped keeps the date it had rather than being re-stamped on every
 * unrelated edit.
 */
function shippedAtFor(status: RoadmapItemInput["status"], current: string | null): string | null {
  if (status !== "done") return null
  return current ?? today()
}

/** The insert shape. Defaults live here, not in zod — an omitted field takes the default. */
function toRow(input: RoadmapItemInput) {
  return {
    title: input.title.trim(),
    blurb: blankToNull(input.blurb),
    status: input.status,
    position: input.position ?? 0,
    planUrl: blankToNull(input.planUrl),
  }
}

/**
 * The update shape, which is not the insert shape.
 *
 * Every optional field in the schema is optional, so a PATCH that only moves the status
 * validates — and running it through `toRow` would write the defaults over the blurb, the
 * plan link and the hand-set position of an item that never mentioned them. There is no
 * undo for that. A key that is absent is left alone; an empty string is still a clear,
 * which is what the form sends when you empty a field.
 */
function toUpdate(input: RoadmapItemInput): Partial<typeof roadmapItems.$inferInsert> {
  const set: Partial<typeof roadmapItems.$inferInsert> = {
    title: input.title.trim(),
    status: input.status,
  }

  if (input.blurb !== undefined) set.blurb = blankToNull(input.blurb)
  if (input.planUrl !== undefined) set.planUrl = blankToNull(input.planUrl)
  if (input.position !== undefined) set.position = input.position

  return set
}

export async function createItem(input: RoadmapItemInput) {
  const desired = blankToNull(input.slug) ?? slugify(input.title)
  const slug = uniqueSlug(desired, await getTakenSlugs())

  const [row] = await db()
    .insert(roadmapItems)
    .values({ ...toRow(input), slug, shippedAt: shippedAtFor(input.status, null) })
    .returning({ id: roadmapItems.id, slug: roadmapItems.slug })

  return row
}

export async function updateItem(id: string, input: RoadmapItemInput) {
  // `where id = 'garbage'` against a uuid column raises instead of matching nothing, and
  // the caller reads null as a 404.
  if (!isUuid(id)) return null

  const [current] = await db()
    .select({ slug: roadmapItems.slug, shippedAt: roadmapItems.shippedAt })
    .from(roadmapItems)
    .where(eq(roadmapItems.id, id))
    .limit(1)

  if (!current) return null

  // No slug in the payload means keep the one the item has: a slug is a stable anchor, and
  // regenerating it from the title on an unrelated edit breaks every link to it. An empty
  // string is the form's "generate one for me".
  const desired =
    input.slug === undefined ? current.slug : (blankToNull(input.slug) ?? slugify(input.title))

  // An item's own slug is not a collision with itself — without this filter, saving a form
  // without touching the title would rename it to "-2" every time.
  const taken = (await getTakenSlugs()).filter((s) => s !== current.slug)

  const [row] = await db()
    .update(roadmapItems)
    .set({
      ...toUpdate(input),
      slug: uniqueSlug(desired, taken),
      shippedAt: shippedAtFor(input.status, current.shippedAt),
      updatedAt: new Date(),
    })
    .where(eq(roadmapItems.id, id))
    .returning({ id: roadmapItems.id, slug: roadmapItems.slug })

  return row ?? null
}

export async function deleteItem(id: string) {
  if (!isUuid(id)) return null

  const [row] = await db()
    .delete(roadmapItems)
    .where(eq(roadmapItems.id, id))
    .returning({ id: roadmapItems.id })

  return row ?? null
}
