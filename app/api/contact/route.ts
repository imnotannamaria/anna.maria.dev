import { Resend } from "resend"
import { NextResponse } from "next/server"
import { z } from "zod"
import { ContactEmail } from "@/emails/contact-email"
import { contactSchema } from "@/lib/contact-schema"
import { clientIp, take } from "@/lib/api/middleware/rate-limit"

const MAX_BODY_CHARS = 20_000

export async function POST(req: Request) {
  // Each message is an email in my inbox and one off the Resend quota. The honeypot stops a
  // bot that fills every field; this stops a script that knows which ones to fill.
  const taken = take(`contact:${clientIp(req)}`, 5, 10 * 60 * 1000)
  if (!taken.ok) {
    return NextResponse.json(
      { error: "Too many messages. Try again in a few minutes." },
      { status: 429, headers: { "retry-after": String(taken.retryAfterSec) } },
    )
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  // The message is at most MESSAGE_MAX characters; a body past this is not a postcard. The text is
  // read first and parsed after, so a request that lies about (or leaves out) its length is
  // still stopped at the limit.
  let payload: unknown
  try {
    const text = await req.text()
    if (text.length > MAX_BODY_CHARS) {
      return NextResponse.json({ error: "Message too long." }, { status: 413 })
    }
    payload = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  // Honeypot — bots fill the hidden field; pretend success so they don't retry.
  if (
    payload &&
    typeof payload === "object" &&
    "website" in payload &&
    (payload as Record<string, unknown>).website
  ) {
    return NextResponse.json({ success: true })
  }

  const parsed = contactSchema.safeParse(payload)
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error)
    return NextResponse.json(
      { error: "Please check the highlighted fields.", fieldErrors },
      { status: 400 },
    )
  }

  const { name, email, message } = parsed.data

  const { error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: ["anna.maria.dev.br@gmail.com"],
    replyTo: email,
    // one line: a name is free text, and a subject is a header
    subject: `New message from ${name.replace(/[\r\n]+/g, " ")}`,
    react: ContactEmail({ name, email, message }),
  })

  if (error) {
    console.error("[contact] Resend error:", error)
    return NextResponse.json({ error: "Failed to send message. Try again later." }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
