import {
  HashIcon,
  LinkedinLogoIcon,
  LockSimpleIcon,
  SmileyIcon,
} from "@phosphor-icons/react/dist/ssr"
import { Avatar } from "@/app/components/entrepta/avatar"
import type { Letter } from "./letters"
import { Reactions } from "./reactions"
import "./wall.css"

/** One letter as one message: who wrote it, where they are from, the words, the reactions. */
function Message({ letter, readOnly }: { letter: Letter; readOnly: boolean }) {
  return (
    <article className="st-wl-msg" lang={letter.lang}>
      <Avatar name={letter.name || "?"} src={letter.photo} size="lg" shape="square" />
      <div className="flex min-w-0 flex-col gap-2">
        <header className="st-wl-head">
          <h2 className="text-body-lg font-sans font-semibold text-[var(--fg-primary)]">
            {letter.name}
          </h2>
          <p className="text-mono-sm min-w-0 font-mono text-[var(--fg-muted)]">
            {[letter.role, letter.company, letter.when].filter(Boolean).join(" · ")}
          </p>
          {letter.linkedin ? (
            <a
              href={letter.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="st-wl-linkedin focus-ring"
              aria-label={`${letter.name} on LinkedIn`}
            >
              <LinkedinLogoIcon aria-hidden size={15} weight="fill" />
            </a>
          ) : null}
        </header>
        <div className="st-wl-text text-body-lg font-sans text-[var(--fg-secondary)]">
          {letter.text.split(/\n\s*\n/).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <Reactions id={letter.id} who={letter.name} counts={letter.reactions} readOnly={readOnly} />
      </div>
    </article>
  )
}

/**
 * The wall of love as a channel: `#wall-of-love` at the top, every letter a message, and a
 * composer at the foot that is locked, because the wall is by invitation.
 *
 * `preview` is a letter that is not on the wall yet (the invite showing someone their own
 * words, the admin reading one before deciding): the same message, with reactions that only
 * show, and a head that does not count letters.
 */
export function Channel({ letters, preview = false }: { letters: Letter[]; preview?: boolean }) {
  return (
    <section className="st-wl-channel" aria-label="wall-of-love">
      <header className="st-wl-channel-head">
        <p className="text-mono-md flex items-center gap-1.5 font-mono text-[var(--fg-primary)]">
          <HashIcon aria-hidden size={15} weight="bold" className="text-[var(--fg-brand)]" />
          wall-of-love
        </p>
        <p className="text-mono-sm min-w-0 truncate font-mono text-[var(--fg-muted)]">
          {preview
            ? "how it will look on the wall"
            : `${letters.length} ${letters.length === 1 ? "letter" : "letters"} · kind words, by invitation`}
        </p>
      </header>

      <ol className="st-wl-list">
        {letters.map((letter) => (
          <li key={letter.id}>
            <Message letter={letter} readOnly={preview} />
          </li>
        ))}
      </ol>

      {preview ? null : (
        <footer className="st-wl-composer">
          <LockSimpleIcon aria-hidden size={15} />
          <span className="text-mono-sm min-w-0 flex-1 truncate font-mono">
            only people with an invitation can write here
          </span>
          <SmileyIcon aria-hidden size={16} />
        </footer>
      )}
    </section>
  )
}
