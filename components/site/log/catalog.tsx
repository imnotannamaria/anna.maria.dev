import { useTranslations } from "next-intl"
import Image from "next/image"
import type { ReactNode } from "react"
import { RollingNumber } from "@/app/components/entrepta/rolling-number"
import { StarRating } from "@/components/log/star-rating"
import { posterSrc } from "@/lib/log/poster-src"
import type { LogEntry } from "@/lib/log/validation"

export function LogCover({ entry, sizes }: { entry: LogEntry; sizes: string }) {
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

export function Note({ entry, size = 13 }: { entry: LogEntry; size?: number }) {
  const t = useTranslations("log")
  return (
    <span className="flex shrink-0 items-center gap-2">
      <StarRating rating={entry.rating} size={size} />
      {entry.favorite ? (
        <span className="text-[var(--fg-brand)]">
          <span aria-hidden>♥</span>
          <span className="sr-only">{t("favourite")}</span>
        </span>
      ) : null}
    </span>
  )
}

export const who = (entry: LogEntry) => [entry.creator, entry.year].filter(Boolean).join(" · ")

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
