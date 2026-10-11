import "server-only"
import { and, eq, gt, isNotNull } from "drizzle-orm"
import { createDb, dbUrl } from "@/lib/db/client"
import { isUuid } from "@/lib/format"
import { INVITE_TTL_MS, type Decision } from "./constants"
import { wallTestimonials } from "./schema"
import { generateToken, hashToken, isTokenShape } from "./token"
import type { InviteInput, SubmissionInput } from "./validation"

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

const expiry = () => new Date(Date.now() + INVITE_TTL_MS)

/**
 * A new invite, and the one time its token exists in plain text: the caller builds the link
 * from it and shows it, and only the hash is kept.
 */
export async function createInvite(input: InviteInput) {
  const token = generateToken()
  const [row] = await db()
    .insert(wallTestimonials)
    .values({
      status: "invited",
      tokenHash: hashToken(token),
      expiresAt: expiry(),
      name: input.name.trim(),
      company: input.company.trim(),
      note: blankToNull(input.note),
      formLang: input.formLang,
    })
    .returning({ id: wallTestimonials.id, expiresAt: wallTestimonials.expiresAt })

  return { id: row.id, token, expiresAt: row.expiresAt.toISOString() }
}

/**
 * A fresh link for an invite nobody has used: a new token and another day. The old link stops
 * working at once, because its hash is gone. Only while the row is still `invited` — a written
 * testimonial has no use for a link.
 */
export async function renewInvite(id: string) {
  if (!isUuid(id)) return null
  const token = generateToken()
  const [row] = await db()
    .update(wallTestimonials)
    .set({ tokenHash: hashToken(token), expiresAt: expiry() })
    .where(and(eq(wallTestimonials.id, id), eq(wallTestimonials.status, "invited")))
    .returning({ id: wallTestimonials.id, expiresAt: wallTestimonials.expiresAt })

  return row ? { id: row.id, token, expiresAt: row.expiresAt.toISOString() } : null
}

/**
 * The testimonial, written through an open invite.
 *
 * One conditional UPDATE, not a read and then a write: the `where` is the whole check — this
 * token, still waiting, not yet expired — so two submits racing each other cannot both land,
 * and a link that expired between opening the page and pressing send is refused here.
 * Returns null when the invite was not open; the caller decides what that means for any
 * photo it already uploaded.
 */
export async function submitTestimonial(
  token: string,
  input: SubmissionInput,
  avatarUrl: string | null,
) {
  if (!isTokenShape(token)) return null
  const now = new Date()

  const [row] = await db()
    .update(wallTestimonials)
    .set({
      status: "submitted",
      name: input.name.trim(),
      company: input.company.trim(),
      role: blankToNull(input.role),
      linkedinUrl: blankToNull(input.linkedin),
      message: input.message.trim(),
      lang: input.lang,
      avatarUrl,
      submittedAt: now,
    })
    .where(
      and(
        eq(wallTestimonials.tokenHash, hashToken(token)),
        eq(wallTestimonials.status, "invited"),
        gt(wallTestimonials.expiresAt, now),
      ),
    )
    .returning({
      id: wallTestimonials.id,
      name: wallTestimonials.name,
      company: wallTestimonials.company,
      role: wallTestimonials.role,
      message: wallTestimonials.message,
      lang: wallTestimonials.lang,
    })

  return row ?? null
}

/**
 * Approve or reject. Only something that was written can be decided, so an invite still
 * waiting is out of reach; approved and rejected can swap, which is how a testimonial is
 * taken down and put back.
 */
export async function decide(id: string, status: Decision) {
  if (!isUuid(id)) return null
  const [row] = await db()
    .update(wallTestimonials)
    .set({ status, decidedAt: new Date() })
    .where(and(eq(wallTestimonials.id, id), isNotNull(wallTestimonials.submittedAt)))
    .returning({ id: wallTestimonials.id, status: wallTestimonials.status })

  return row ?? null
}

/** Gone for good. Returns the photo's URL so the caller can delete the file too. */
export async function deleteEntry(id: string) {
  if (!isUuid(id)) return null
  const [row] = await db()
    .delete(wallTestimonials)
    .where(eq(wallTestimonials.id, id))
    .returning({ id: wallTestimonials.id, avatarUrl: wallTestimonials.avatarUrl })

  return row ?? null
}
