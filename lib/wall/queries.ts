import { asc, desc, eq } from "drizzle-orm"
import { createDb, dbUrl } from "@/lib/db/client"
import { isUuid } from "@/lib/format"
import { reactionCounts, type WallLang, type WallStatus } from "./constants"
import { wallTestimonials } from "./schema"
import { hashToken, isTokenShape } from "./token"
import type { Testimonial, WallEntry } from "./validation"

type Row = typeof wallTestimonials.$inferSelect

/** Public reads report an unavailable database; admin reads keep their guarded fallbacks. */
function db() {
  const url = dbUrl()
  return url ? createDb(url).db : null
}

const iso = (d: Date | null) => (d ? d.toISOString() : null)

export function toEntry(row: Row, now: Date = new Date()): WallEntry {
  return {
    id: row.id,
    status: row.status as WallStatus,
    expired: row.status === "invited" && row.expiresAt.getTime() <= now.getTime(),
    expiresAt: row.expiresAt.toISOString(),
    note: row.note,
    formLang: row.formLang as WallLang,
    name: row.name,
    company: row.company,
    role: row.role,
    linkedinUrl: row.linkedinUrl,
    message: row.message,
    lang: row.lang as WallLang | null,
    avatarUrl: row.avatarUrl,
    reactions: reactionCounts(row.reactions),
    createdAt: row.createdAt.toISOString(),
    submittedAt: iso(row.submittedAt),
    decidedAt: iso(row.decidedAt),
  }
}

/**
 * The month a testimonial went up, as `YYYY-MM` in São Paulo. Computed here, on the server,
 * once: a date formatted on both sides of the hydration boundary is a mismatch waiting for a
 * render that straddles midnight.
 */
function monthOf(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
  }).format(d)
}

/** The wall: approved only, the oldest decision first, the way a channel reads: the newest is last. */
export async function getApprovedTestimonials(): Promise<Testimonial[]> {
  const conn = db()
  if (!conn) throw new Error("Database unavailable")

  const rows = await conn
    .select()
    .from(wallTestimonials)
    .where(eq(wallTestimonials.status, "approved"))
    .orderBy(asc(wallTestimonials.decidedAt), asc(wallTestimonials.createdAt))

  return rows.flatMap((row) =>
    // The CHECK constraint guarantees both, and the type cannot know that.
    row.message && row.lang
      ? [
          {
            id: row.id,
            name: row.name,
            company: row.company,
            role: row.role,
            linkedinUrl: row.linkedinUrl,
            message: row.message,
            lang: row.lang as WallLang,
            avatarUrl: row.avatarUrl,
            reactions: reactionCounts(row.reactions),
            month: monthOf(row.decidedAt ?? row.createdAt),
          },
        ]
      : [],
  )
}

/** The admin list: every row, newest first. */
export async function getAllEntries(): Promise<WallEntry[]> {
  const conn = db()
  if (!conn) return []

  const rows = await conn.select().from(wallTestimonials).orderBy(desc(wallTestimonials.createdAt))
  const now = new Date()
  return rows.map((row) => toEntry(row, now))
}

export async function getEntryById(id: string): Promise<WallEntry | null> {
  const conn = db()
  // `where id = 'garbage'` against a uuid column raises instead of matching nothing.
  if (!conn || !isUuid(id)) return null

  const rows = await conn.select().from(wallTestimonials).where(eq(wallTestimonials.id, id))
  return rows[0] ? toEntry(rows[0]) : null
}

/**
 * What an invite link opens to.
 *
 * - `missing`: no such token, or not a token at all. The page is a 404.
 * - `expired`: still waiting, but past its day.
 * - `used`: already written. Whether it was approved is not the visitor's business.
 * - `open`: the form.
 */
export type InviteLookup =
  | { state: "missing" }
  | { state: "expired"; entry: WallEntry }
  | { state: "used"; entry: WallEntry }
  | { state: "open"; entry: WallEntry }

export async function getInviteByToken(token: string): Promise<InviteLookup> {
  const conn = db()
  if (!conn || !isTokenShape(token)) return { state: "missing" }

  const rows = await conn
    .select()
    .from(wallTestimonials)
    .where(eq(wallTestimonials.tokenHash, hashToken(token)))
    .limit(1)

  const row = rows[0]
  if (!row) return { state: "missing" }

  const entry = toEntry(row)
  if (entry.status !== "invited") return { state: "used", entry }
  if (entry.expired) return { state: "expired", entry }
  return { state: "open", entry }
}
