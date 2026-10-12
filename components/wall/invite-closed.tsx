import { buttonVariants } from "@/app/components/entrepta/button-variants"
import { ScreenNotice } from "@/components/site/frame/screen-state"
import { siteConfig } from "@/lib/site-config"
import type { WallLang } from "@/lib/wall/constants"
import { COPY } from "@/lib/wall/copy"

/**
 * The two ways an invite link stops being a form: past its day, or already used. In the
 * invite's language, rendered by the page itself. When the form finds out on send, it refreshes
 * the page rather than drawing this inside its own column.
 */
export function InviteClosed({ kind, lang }: { kind: "expired" | "used"; lang: WallLang }) {
  const copy = COPY[lang]
  const expired = kind === "expired"

  return (
    <div lang={lang} className="h-full">
      <ScreenNotice
        mood={expired ? "angry" : "asleep"}
        title={expired ? copy.expiredTitle : copy.usedTitle}
        body={expired ? copy.expiredBody : copy.usedBody}
        action={
          expired ? (
            <a href={`mailto:${siteConfig.email}`} data-sound="click" className={buttonVariants()}>
              {copy.expiredAction}
            </a>
          ) : undefined
        }
      />
    </div>
  )
}
