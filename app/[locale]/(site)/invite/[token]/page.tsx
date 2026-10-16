import { pageLocale } from "@/lib/i18n/page"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { InviteClosed } from "@/components/wall/invite-closed"
import { InviteForm } from "@/components/wall/invite-form"
import { avatarUploadsEnabled } from "@/lib/wall/avatar"
import { getInviteByToken } from "@/lib/wall/queries"
import "./invite.css"

/** Read per request: the same link is a form, then an expired notice, then a thank-you. */
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "invite",
  // A link meant for one person. Also excluded from the sitemap and robots.txt.
  robots: { index: false, follow: false },
}

/**
 * Where an invite link lands, inside the site's frame.
 *
 * A token that matches nothing is a 404, never "this link is invalid": a different answer for
 * a wrong token than for a missing page would tell someone guessing that they are close.
 */
export default async function InvitePage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>
}) {
  const { token } = await params
  await pageLocale(params)
  const invite = await getInviteByToken(token)

  if (invite.state === "missing") notFound()
  if (invite.state !== "open") {
    return <InviteClosed kind={invite.state} lang={invite.entry.formLang} />
  }

  const { entry } = invite
  return (
    // One question at a time, in the middle of the page, with the track of steps at its foot.
    <div className="st-room st-screen">
      <InviteForm
        token={token}
        seed={{
          name: entry.name,
          company: entry.company,
          note: entry.note,
          formLang: entry.formLang,
        }}
        photoUploads={avatarUploadsEnabled()}
      />
    </div>
  )
}
