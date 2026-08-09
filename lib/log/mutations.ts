import "server-only"
import { eq } from "drizzle-orm"
import { createDb, dbUrl } from "@/lib/db/client"
import { getTakenSlugs } from "./queries"
import { logEntries } from "./schema"
import { slugify, uniqueSlug } from "@/lib/slug"
import type { LogEntryInput } from "./validation"

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

/** Shared shape for insert and update. `rating` is numeric, so drizzle wants a string. */
function toRow(input: LogEntryInput) {
  return {
    type: input.type,
    title: input.title.trim(),
    creator: blankToNull(input.creator),
    year: input.year ?? null,
    rating: input.rating == null ? null : input.rating.toFixed(1),
    // Defaults live here rather than in zod: `.default()` makes zod's input type diverge
    // from its output type, which breaks react-hook-form's generics.
    favorite: input.favorite ?? false,
    note: blankToNull(input.note),
    posterUrl: blankToNull(input.posterUrl),
    externalUrl: blankToNull(input.externalUrl),
    loggedAt: input.loggedAt,
    published: input.published ?? true,
  }
}

export async function createEntry(input: LogEntryInput) {
  const desired = blankToNull(input.slug) ?? slugify(input.title, input.year)
  const slug = uniqueSlug(desired, await getTakenSlugs())

  const [row] = await db()
    .insert(logEntries)
    .values({ ...toRow(input), slug })
    .returning({ id: logEntries.id, slug: logEntries.slug })

  return row
}

export async function updateEntry(id: string, input: LogEntryInput) {
  const desired = blankToNull(input.slug) ?? slugify(input.title, input.year)

  const [current] = await db()
    .select({ slug: logEntries.slug })
    .from(logEntries)
    .where(eq(logEntries.id, id))
    .limit(1)

  if (!current) return null

  // An entry's own slug is not a collision with itself — without this filter, saving a
  // form without touching the title would rename it to "-2" every time.
  const taken = (await getTakenSlugs()).filter((s) => s !== current.slug)

  const [row] = await db()
    .update(logEntries)
    .set({ ...toRow(input), slug: uniqueSlug(desired, taken), updatedAt: new Date() })
    .where(eq(logEntries.id, id))
    .returning({ id: logEntries.id, slug: logEntries.slug })

  return row ?? null
}

export async function deleteEntry(id: string) {
  const [row] = await db()
    .delete(logEntries)
    .where(eq(logEntries.id, id))
    .returning({ id: logEntries.id })

  return row ?? null
}
