import { randomUUID } from "node:crypto"
import { put } from "@vercel/blob"
import { Hono } from "hono"
import { Resend } from "resend"
import { BugReportEmail } from "@/emails/bug-report-email"
import { BUG_ATTACHMENT_MAX_BYTES, bugSchema } from "@/lib/bug-schema"
import { siteConfig } from "@/lib/site-config"
import { sniffImage } from "@/lib/wall/avatar"
import { rateLimit } from "../middleware/rate-limit"

export const bug = new Hono()

const MAX_BODY_BYTES = BUG_ATTACHMENT_MAX_BYTES + 64 * 1024
const text = (value: unknown) => (typeof value === "string" ? value : "")

/**
 * A bug report from the header: a few fields of text and, at most, one screenshot. It becomes
 * an email and nothing else: there is no table of reports to keep.
 *
 * The screenshot goes to Vercel Blob under a random name and the email carries the link. What
 * the file is comes from its first bytes, not from the name or type the browser sent. Without
 * a Blob token the report still goes, without its image.
 */
bug.post(
  "/",
  // its own bucket: the default key is the bare address, which the invite route counts on too
  rateLimit({
    max: 5,
    windowMs: 10 * 60 * 1000,
    key: (c) => `bug:${c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"}`,
  }),
  async (c) => {
    if (!c.req.header("content-type")?.includes("multipart/form-data")) {
      return c.json({ error: "expected multipart/form-data" }, 415)
    }
    const length = Number(c.req.header("content-length") ?? "0")
    if (Number.isFinite(length) && length > MAX_BODY_BYTES) {
      return c.json({ error: "too_large" }, 413)
    }

    const body = await c.req.parseBody()

    // Honeypot: a field no person sees. Answer as if it worked, so a bot does not retry.
    if (text(body.website)) return c.json({ ok: true }, 201)

    const parsed = bugSchema.safeParse({
      name: text(body.name),
      email: text(body.email),
      description: text(body.description),
      page: text(body.page),
    })
    if (!parsed.success) {
      const fields: Record<string, string> = {}
      for (const issue of parsed.error.issues) fields[String(issue.path[0])] ??= issue.message
      return c.json({ error: "invalid", fields }, 400)
    }

    const key = process.env.RESEND_API_KEY?.trim()
    if (!key) return c.json({ error: "unavailable" }, 503)

    let attachment: string | null = null
    const file = body.attachment
    if (file instanceof File && file.size > 0) {
      if (file.size > BUG_ATTACHMENT_MAX_BYTES) {
        return c.json({ error: "invalid", fields: { attachment: "that image is over 4 MB" } }, 400)
      }
      const bytes = new Uint8Array(await file.arrayBuffer())
      const kind = sniffImage(bytes)
      if (!kind) {
        return c.json(
          { error: "invalid", fields: { attachment: "a png, jpg or webp, please" } },
          400,
        )
      }
      if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
        try {
          const blob = await put(`bugs/${randomUUID()}.${kind.ext}`, Buffer.from(bytes), {
            access: "public",
            contentType: kind.type,
            addRandomSuffix: false,
          })
          attachment = blob.url
        } catch (err) {
          // the report matters more than its picture
          console.error("[bug] attachment upload failed:", err)
        }
      }
    }

    const { name, email, description, page } = parsed.data
    const { error } = await new Resend(key).emails.send({
      from: "onboarding@resend.dev",
      to: [siteConfig.email],
      ...(email ? { replyTo: email } : {}),
      subject: `Bug report from ${name}`,
      react: BugReportEmail({ name, email, description, page, attachment }),
    })
    if (error) {
      console.error("[bug] Resend error:", error)
      return c.json({ error: "unavailable" }, 502)
    }
    return c.json({ ok: true }, 201)
  },
)
