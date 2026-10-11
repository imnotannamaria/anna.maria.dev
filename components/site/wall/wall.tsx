import { HeartIcon } from "@phosphor-icons/react/dist/ssr"
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
  return (
    <article className="st-room st-screen">
      <PageHeader
        icon={<HeartIcon aria-hidden size={13} weight="bold" />}
        label="wall of love"
        count={letters?.length || undefined}
      >
        Kind words, <span className="text-[var(--fg-primary)]">by invitation</span>. Each one came
        from a link I sent, and was read before it went up.
      </PageHeader>

      {letters === null ? (
        <p className="text-body-md font-sans text-[var(--fg-secondary)]" role="status">
          The letters live in Postgres, and Postgres did not answer just now.
        </p>
      ) : letters.length === 0 ? (
        <ScreenNotice
          inline
          mood="asleep"
          title="Nothing on the wall yet."
          body="The first invitations are out. She is keeping the spot warm until the letters come in."
        />
      ) : (
        <Channel letters={letters} />
      )}
    </article>
  )
}
