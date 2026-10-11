import { HeartIcon } from "@phosphor-icons/react/dist/ssr"
import { useTranslations } from "next-intl"
import { ScreenNotice } from "@/components/site/frame/screen-state"
import { PageHeader } from "@/components/site/page-header"
import type { Letter } from "./letters"
import { Channel } from "./channel"
import "./wall.css"

/**
 * The wall of love: every approved letter as a message in a channel, newest first. `letters` is null when the database
 * did not answer, which is not the same as an empty wall and does not say the same thing.
 */
export function Wall({ letters }: { letters: Letter[] | null }) {
  const t = useTranslations("wall")
  return (
    <article className="st-room st-screen">
      <PageHeader
        icon={<HeartIcon aria-hidden size={13} weight="bold" />}
        label={t("label")}
        count={letters?.length || undefined}
      >
        {t.rich("lede", {
          b: (words) => <span className="text-[var(--fg-primary)]">{words}</span>,
        })}
      </PageHeader>

      {letters === null ? (
        <p className="text-body-md font-sans text-[var(--fg-secondary)]" role="status">
          {t("down")}
        </p>
      ) : letters.length === 0 ? (
        <ScreenNotice inline mood="asleep" title={t("emptyTitle")} body={t("emptyBody")} />
      ) : (
        <Channel letters={letters} />
      )}
    </article>
  )
}
