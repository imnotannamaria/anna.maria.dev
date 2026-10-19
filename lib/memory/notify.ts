import "server-only"
import { Resend } from "resend"
import { MemoryRecordEmail } from "@/emails/memory-record-email"
import { siteConfig } from "@/lib/site-config"
import { formatMs } from "./constants"

/**
 * The email that says a name is waiting for the board. Never part of the claim's success: the
 * row is saved and in the admin already, so a mail failure is logged and swallowed, the same as
 * the wall's.
 */
export async function notifyRecord(entry: {
  name: string
  ms: number
  moves: number
  rank: number
  origin: string
}) {
  const key = process.env.RESEND_API_KEY
  if (!key) return

  try {
    const { error } = await new Resend(key).emails.send({
      from: "onboarding@resend.dev",
      to: [siteConfig.email],
      subject: `${entry.name} made the memory board: #${entry.rank}, ${formatMs(entry.ms)}`,
      react: MemoryRecordEmail({
        name: entry.name,
        time: formatMs(entry.ms),
        moves: entry.moves,
        rank: entry.rank,
        reviewUrl: `${entry.origin}/admin/memory`,
      }),
    })
    if (error) console.error("[memory] Resend error:", error)
  } catch (err) {
    console.error("[memory] could not send the email:", err instanceof Error ? err.message : err)
  }
}
