import { Resend } from "resend"
import { NextResponse } from "next/server"
import { z } from "zod"
import { ContactEmail } from "@/emails/contact-email"
import { contactSchema } from "@/lib/contact-schema"
import { clientIp, take } from "@/lib/api/middleware/rate-limit"

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

  let payload: unknown
  try {
    payload = await req.json()
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
