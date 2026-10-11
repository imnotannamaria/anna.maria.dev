import { HandPalmIcon, HourglassIcon, MoonIcon, RulerIcon, ShieldIcon } from "@phosphor-icons/react"
import { useTranslations } from "next-intl"
import type { ReactElement } from "react"
import { Cat, CatAngry, CatSleeping } from "@/components/site/abimaela/abimaela"
import { Tile } from "@/components/site/tile"
import { MAX_QUESTION, MIN_GAP_SECONDS, PER_VISITOR } from "@/lib/ai/limits"

/** The moments the chat says no, each with Abimaela in the mood for it. */
export type NoticeKind = "budget" | "visitor" | "slow" | "scope" | "blocked" | "long"

/** The icon and the mood of each notice. Its words are in the messages, under `chat.notice`. */
const NOTICES: Record<NoticeKind, { icon: ReactElement; cat: "angry" | "asleep" | "sitting" }> = {
  budget: { icon: <MoonIcon />, cat: "asleep" },
  visitor: { icon: <MoonIcon />, cat: "asleep" },
  slow: { icon: <HourglassIcon />, cat: "sitting" },
  long: { icon: <RulerIcon />, cat: "sitting" },
  scope: { icon: <HandPalmIcon />, cat: "angry" },
  blocked: { icon: <ShieldIcon />, cat: "angry" },
}

export function ChatNotice({ kind }: { kind: NoticeKind }) {
  const t = useTranslations("chat.notice")
  const { icon, cat } = NOTICES[kind]
  // the numbers a notice quotes are the real limits
  const values = { count: PER_VISITOR, seconds: MIN_GAP_SECONDS, max: MAX_QUESTION }
  return (
    <Tile label={t(`${kind}.label`)} icon={icon} className="st-enter st-ia-notice">
      <div className="st-ia-notice-row">
        <span aria-hidden className="st-ia-notice-cat">
          {cat === "angry" ? (
            <CatAngry height={72} />
          ) : cat === "asleep" ? (
            <CatSleeping height={72} />
          ) : (
            <Cat height={64} />
          )}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-heading-md m-0 font-serif text-[var(--fg-primary)]">
            {t(`${kind}.title`, values)}
          </p>
          <p className="text-body-md m-0 font-sans text-[var(--fg-secondary)]">
            {t(`${kind}.body`, values)}
          </p>
        </div>
      </div>
    </Tile>
  )
}
