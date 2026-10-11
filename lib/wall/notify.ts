import "server-only"
import { Resend } from "resend"
import { WallSubmissionEmail } from "@/emails/wall-submission-email"
import { siteConfig } from "@/lib/site-config"
import { LANG_LABEL, type WallLang } from "./constants"

/**
 * The email that says a testimonial arrived. Never part of the submit's success: the row is
 * already saved and visible in the admin, so a mail failure is logged and swallowed rather
 * than telling the person who wrote it that something went wrong.
 */
export async function notifySubmission(entry: {
  id: string
  name: string
  company: string
  role: string | null
  message: string | null
  lang: string | null
  origin: string
}) {
  const key = process.env.RESEND_API_KEY
  if (!key) return

  const lang = (entry.lang ?? "pt-BR") as WallLang
  try {
    const { error } = await new Resend(key).emails.send({
      from: "onboarding@resend.dev",
      to: [siteConfig.email],
      subject: `${entry.name} wrote for the wall`,
      react: WallSubmissionEmail({
        name: entry.name,
        company: entry.company,
        role: entry.role,
        language: `${LANG_LABEL[lang]} (${lang})`,
        message: entry.message ?? "",
        reviewUrl: `${entry.origin}/admin/wall/${entry.id}`,
      }),
    })
    if (error) console.error("[wall] Resend error:", error)
  } catch (err) {
    console.error("[wall] could not send the email:", err instanceof Error ? err.message : err)
  }
}
