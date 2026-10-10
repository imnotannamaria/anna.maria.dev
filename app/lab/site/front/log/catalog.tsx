import Image from "next/image"
import { tileClass } from "@/components/site/tile"
import type { ReactNode } from "react"
import { Reveal } from "@/app/components/entrepta/reveal"
import { RollingNumber } from "@/app/components/entrepta/rolling-number"
import { StarRating } from "@/components/log/star-rating"
import { posterSrc } from "@/lib/log/poster-src"
import type { LogEntry } from "@/lib/log/validation"

function LogCover({ entry, sizes }: { entry: LogEntry; sizes: string }) {
  return (
    <span className="st-lg-cover" data-type={entry.type}>
      {entry.posterUrl ? (
        <Image src={posterSrc(entry.posterUrl)} alt="" fill sizes={sizes} />
      ) : (
        <span className="text-mono-xs p-1 text-center font-mono">{entry.title}</span>
      )}
    </span>
  )
}

function Note({ entry, size = 13 }: { entry: LogEntry; size?: number }) {
  return (
    <span className="flex shrink-0 items-center gap-2">
      <StarRating rating={entry.rating} size={size} />
      {entry.favorite ? (
        <span className="text-[var(--fg-brand)]">
          <span aria-hidden>♥</span>
          <span className="sr-only">favourite</span>
        </span>
      ) : null}
    </span>
  )
}

function Hidden({ entry }: { entry: LogEntry }) {
  if (!entry.externalUrl) return null
  return (
    <a
      href={entry.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="focus-ring absolute inset-0 z-[1] rounded-[var(--radius-md)]"
      aria-label={`${entry.title}: open the link`}
    />
  )
}

const who = (entry: LogEntry) => [entry.creator, entry.year].filter(Boolean).join(" · ")

export function Slips({ items }: { items: LogEntry[] }) {
  return (
    <ul className="st-lg-grid" data-drawing="slips">
      {items.map((entry, index) => (
        <li key={entry.id}>
          <Reveal index={index} step={0.04} className="flex flex-1">
            <article className={tileClass({ size: "sm" }, "st-lg-slip")}>
              <Hidden entry={entry} />
              <LogCover entry={entry} sizes="96px" />
              <div className="flex min-w-0 flex-col gap-1.5">
                <h3 className="text-heading-md font-serif text-[var(--fg-primary)]">
                  {entry.title}
                </h3>
                <p className="text-mono-xs font-mono text-[var(--fg-muted)]">{who(entry)}</p>
                <Note entry={entry} />
                {entry.note ? (
                  <p className="text-body-md mt-1 line-clamp-4 font-serif text-[var(--fg-secondary)] italic">
                    &ldquo;{entry.note}&rdquo;
                  </p>
                ) : null}
              </div>
            </article>
          </Reveal>
        </li>
      ))}
    </ul>
  )
}

export function ByType({
  groups,
  draw,
}: {
  groups: { type: string; items: LogEntry[] }[]
  draw: (items: LogEntry[]) => ReactNode
}) {
  return (
    <div className="st-lg-groups">
      {groups.map((group) => (
        <section key={group.type} className="flex flex-col gap-3">
          <h2 className="flex items-baseline gap-3">
            <span className="text-heading-lg font-serif text-[var(--fg-primary)]">
              {group.type}
            </span>

            <span className="text-mono-xs font-mono text-[var(--fg-muted)]">
              <RollingNumber value={group.items.length} height={13} />
            </span>
          </h2>
          {draw(group.items)}
        </section>
      ))}
    </div>
  )
}
