import { Resend } from "resend"
import { NextResponse } from "next/server"
import { ContactEmail } from "@/emails/contact-email"

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const body = await req.json()
  const { name, email, message, website } = body

  if (website) {
    return NextResponse.json({ success: true })
  }

  if (!name || !email || !message) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 })
  }

  if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 })
  }

  if (name.length > 100 || email.length > 200 || message.length > 5000) {
    return NextResponse.json({ error: "Input too long." }, { status: 400 })
  }

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
