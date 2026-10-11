import { Hono } from "hono"
import { avatarUploadsEnabled, removeAvatar, storeAvatar } from "@/lib/wall/avatar"
import { submitTestimonial } from "@/lib/wall/mutations"
import { notifySubmission } from "@/lib/wall/notify"
import { getInviteByToken } from "@/lib/wall/queries"
import { isTokenShape } from "@/lib/wall/token"
import { submissionSchema } from "@/lib/wall/validation"
import { rateLimit } from "../middleware/rate-limit"

/**
 * The one public write the wall has: a testimonial, sent through an invite link.
 *
 * The link is the authorisation. A token is 32 random bytes, good for a day and for one
 * submission, and only its hash is stored. Everything here runs before anything is read in
 * full: the rate limit, the token's shape, the content type and size, then the lookup —
 * so a junk request costs a header check, not a multipart parse or an upload.
 *
 * Nothing written here is public. It lands as `submitted` and waits for the admin.
 */
export const wallInvite = new Hono()

/** A photo the form has already shrunk to 512px, plus a few fields of text. */
const MAX_BODY_BYTES = 2 * 1024 * 1024

const text = (value: unknown) => (typeof value === "string" ? value : "")

wallInvite.post("/:token", rateLimit({ max: 10, windowMs: 10 * 60 * 1000 }), async (c) => {
  const token = c.req.param("token")
  if (!isTokenShape(token)) return c.json({ error: "not_found" }, 404)

  if (!c.req.header("content-type")?.includes("multipart/form-data")) {
    return c.json({ error: "expected multipart/form-data" }, 415)
  }
  const length = Number(c.req.header("content-length") ?? "0")
  if (Number.isFinite(length) && length > MAX_BODY_BYTES) {
    return c.json({ error: "payload too large" }, 413)
  }

  // Looked up before the body is parsed, so an expired link never uploads a photo. The
  // statuses are what the form needs to show the right screen instead of a generic error.
  const invite = await getInviteByToken(token)
  if (invite.state === "missing") return c.json({ error: "not_found" }, 404)
  if (invite.state === "expired") return c.json({ error: "expired" }, 410)
  if (invite.state === "used") return c.json({ error: "used" }, 409)

  const body = await c.req.parseBody()

  // Honeypot: a field no person sees. Answer as if it worked, so a bot does not retry.
  if (text(body.website)) return c.json({ ok: true }, 201)

  const parsed = submissionSchema.safeParse({
    name: text(body.name),
    company: text(body.company),
    role: text(body.role),
    linkedin: text(body.linkedin),
    lang: text(body.lang),
    message: text(body.message),
  })
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((issue) => String(issue.path[0])))]
    return c.json({ error: "invalid", fields }, 400)
  }

  // A photo is optional, and without a Blob store there is nowhere to put one: the form does
  // not offer the step then, and a request that sends one anyway just has it ignored.
  let avatarUrl: string | null = null
  const file = body.avatar
  if (file instanceof File && file.size > 0 && avatarUploadsEnabled()) {
    const stored = await storeAvatar(file)
    if (!stored.ok) return c.json({ error: "invalid", fields: ["avatar"] }, 400)
    avatarUrl = stored.url
  }

  // The update re-checks the invite on its own: it may have expired, or been used by a second
  // tab, since the lookup above. If it did, the photo just uploaded belongs to nothing.
  const row = await submitTestimonial(token, parsed.data, avatarUrl)
  if (!row) {
    await removeAvatar(avatarUrl)
    return c.json({ error: "used" }, 409)
  }

  await notifySubmission({ ...row, origin: new URL(c.req.url).origin })
  return c.json({ ok: true }, 201)
})
