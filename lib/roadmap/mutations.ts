import "server-only"
import { eq } from "drizzle-orm"
import { createDb, dbUrl } from "@/lib/db/client"
import { slugify, uniqueSlug } from "@/lib/slug"
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

/** Shared shape for insert and update. Defaults live here, not in zod. */
function toRow(input: RoadmapItemInput) {
  return {
    title: input.title.trim(),
    blurb: blankToNull(input.blurb),
    status: input.status,
    position: input.position ?? 0,
    planUrl: blankToNull(input.planUrl),
  }
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
  const desired = blankToNull(input.slug) ?? slugify(input.title)

  const [current] = await db()
    .select({ slug: roadmapItems.slug, shippedAt: roadmapItems.shippedAt })
    .from(roadmapItems)
    .where(eq(roadmapItems.id, id))
    .limit(1)

  if (!current) return null

  // An item's own slug is not a collision with itself — without this filter, saving a form
  // without touching the title would rename it to "-2" every time.
  const taken = (await getTakenSlugs()).filter((s) => s !== current.slug)

  const [row] = await db()
    .update(roadmapItems)
    .set({
      ...toRow(input),
      slug: uniqueSlug(desired, taken),
      shippedAt: shippedAtFor(input.status, current.shippedAt),
      updatedAt: new Date(),
    })
    .where(eq(roadmapItems.id, id))
    .returning({ id: roadmapItems.id, slug: roadmapItems.slug })

  return row ?? null
}

export async function deleteItem(id: string) {
  const [row] = await db()
    .delete(roadmapItems)
    .where(eq(roadmapItems.id, id))
    .returning({ id: roadmapItems.id })

  return row ?? null
}
