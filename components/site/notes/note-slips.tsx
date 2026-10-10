import type { CSSProperties } from "react"
import { tileClass } from "@/components/site/tile"
import { ArrowAffordance } from "@/app/components/entrepta/arrow-link"
import { Badge } from "@/app/components/entrepta/badge"
import { Reveal } from "@/app/components/entrepta/reveal"
import { Tape } from "@/components/site/tape"
import { ScreenLink } from "@/components/site/screen-link"
import { FeaturedNote } from "./featured-note"
import { shortDate, noteScreen, type Note } from "./note"

const ANGLES = [-1.4, 1, -0.6, 1.5, -1]

function Slip({ note, index }: { note: Note; index: number }) {
  return (
    <div
      className="st-nt-slip"
      style={{ "--tilt": `${ANGLES[index % ANGLES.length]}deg` } as CSSProperties}
    >
      <Tape />
      <article className={tileClass(undefined, "h-full gap-3")}>
        <ScreenLink
          to={noteScreen(note)}
          className="focus-ring absolute inset-0 z-[1] rounded-[var(--radius-lg)]"
          aria-label={`${note.title}: read the note`}
        />
        <p className="text-mono-xs font-mono text-[var(--fg-muted)]">
          <time dateTime={note.date}>{shortDate(note)}</time> · {note.minutes} min
        </p>
        <h2 className="text-heading-lg font-serif text-[var(--fg-primary)] transition-colors group-hover/arrow:text-[var(--fg-brand-text)]">
          {note.title}
        </h2>
        <p className="text-body-md line-clamp-3 font-sans text-[var(--fg-secondary)]">
          {note.summary}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-1">
          <span className="flex flex-wrap gap-1.5">
            {note.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} color="brand">
                {tag}
              </Badge>
            ))}
          </span>
          <span className="text-mono-sm font-mono text-[var(--fg-brand-text)]">
            <ArrowAffordance>read</ArrowAffordance>
          </span>
        </div>
      </article>
    </div>
  )
}

export function NoteSlips({ notes }: { notes: Note[] }) {
  return (
    <ul className="st-nt-slips">
      {notes.map((note, index) => (
        <li
          key={note.slug}
          className="st-nt-cell group/arrow"
          data-featured={note.featured || undefined}
        >
          <Reveal index={index} className="h-full">
            {note.featured ? <FeaturedNote note={note} /> : <Slip note={note} index={index} />}
          </Reveal>
        </li>
      ))}
    </ul>
  )
}
