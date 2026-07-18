import { Resend } from "resend"
import { NextResponse } from "next/server"
import { z } from "zod"
import { ContactEmail } from "@/emails/contact-email"
import { contactSchema } from "@/lib/contact-schema"

export async function POST(req: Request) {
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
    subject: `New message from ${name}`,
    react: ContactEmail({ name, email, message }),
  })

  if (error) {
    console.error("[contact] Resend error:", error)
    return NextResponse.json({ error: "Failed to send message. Try again later." }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
