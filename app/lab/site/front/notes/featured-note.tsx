import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr"
import { tileClass } from "@/components/site/tile"
import { Badge } from "@/app/components/entrepta/badge"
import { buttonVariants } from "@/app/components/entrepta/button-variants"
import { cn } from "@/lib/utils"
import { Pushpin } from "@/components/site/tape"
import { ScreenLink } from "../screen-link"
import { shortDate, noteScreen, type Note } from "./note"

export function FeaturedNote({ note }: { note: Note }) {
  return (
    <div className="st-nt-bundle">
      <span aria-hidden className="st-nt-sheet" data-n="2" />
      <span aria-hidden className="st-nt-sheet" data-n="1" />
      <Pushpin />
      <span className="st-nt-sticker text-mono-xs font-mono">featured</span>

      <article className={tileClass(undefined, "st-nt-front")}>
        <ScreenLink
          to={noteScreen(note)}
          className="focus-ring absolute inset-0 z-[1] rounded-[var(--radius-lg)]"
          aria-label={`${note.title}: read the note`}
        />

        <div className="flex min-w-0 flex-col gap-4">
          <p className="text-mono-xs font-mono text-[var(--fg-muted)]">
            <time dateTime={note.date}>{shortDate(note)}</time> · {note.minutes} min · {note.words}{" "}
            words
          </p>
          <h2 className="st-nt-title-large font-serif text-[var(--fg-primary)]">
            <span>{note.title}</span>
          </h2>
          <p className="text-body-lg max-w-[58ch] font-sans text-[var(--fg-secondary)]">
            {note.summary}
          </p>
          <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
            {note.tags.map((tag) => (
              <li key={tag}>
                <Badge color="brand">{tag}</Badge>
              </li>
            ))}
          </ul>

          <span
            aria-hidden
            className={cn(buttonVariants({ size: "md" }), "st-nt-cta mt-1 self-start")}
          >
            read the note
            <ArrowRightIcon size={14} weight="bold" />
          </span>
        </div>

        {note.opening ? (
          <blockquote className="st-nt-excerpt">
            <p className="text-heading-lg font-serif text-[var(--fg-primary)] italic">
              {note.opening}
            </p>
            <footer className="text-mono-xs font-mono text-[var(--fg-muted)]">how it starts</footer>
          </blockquote>
        ) : null}
      </article>
    </div>
  )
}
