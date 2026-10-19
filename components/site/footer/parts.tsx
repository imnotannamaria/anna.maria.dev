"use client"

import { ArrowRightIcon, ClockIcon } from "@phosphor-icons/react"
import { useTranslations } from "next-intl"
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { buttonVariants } from "@/app/components/entrepta/button-variants"
import { DESTINATIONS, type Destination } from "@/components/site/icons"
import type { PageId } from "@/components/site/pages"
import { ScreenLink } from "@/components/site/screen-link"
import { cn } from "@/lib/utils"

/** The small pieces of the footer's game: the pages, the bar, the clock. */

export type Place = Destination & { short: string }

/** The seven pages, named in the page's language. */
export function usePlaces(): Place[] {
  const pages = useTranslations("pages")
  return DESTINATIONS.map((destination) => ({
    ...destination,
    label: pages(`${destination.id}.label`),
    short: pages(`${destination.id}.short`),
    tagline: pages(`${destination.id}.tagline`),
  }))
}

/**
 * The plain way out, under the game: the seven pages as links. A page the game found is lit, so
 * the game points at the row instead of replacing it.
 */
export function Places({
  places,
  current,
  lit,
}: {
  places: Place[]
  current: PageId
  lit?: ReadonlySet<PageId>
}) {
  const t = useTranslations("footer")
  return (
    <nav aria-label={t("places")} className="st-ft-places">
      {places.map((place) => (
        <ScreenLink
          key={place.id}
          to={place.id}
          data-sound="click"
          className="st-ft-place focus-ring text-mono-xs font-mono"
          aria-current={place.id === current ? "page" : undefined}
          data-lit={lit?.has(place.id) || undefined}
        >
          <place.Icon aria-hidden size={16} weight={lit?.has(place.id) ? "fill" : "regular"} />
          <span className="max-w-full truncate">{place.short}</span>
        </ScreenLink>
      ))}
    </nav>
  )
}

/** What the game says, and, when it has just found a page, the way there. */
export function Prize({ place, children }: { place: Place | null; children: ReactNode }) {
  return (
    <div className="st-ft-prize text-mono-sm font-mono" aria-live="polite">
      <span className="min-w-0 text-[var(--fg-secondary)]">{children}</span>
      {place ? (
        <ScreenLink
          to={place.id}
          data-sound="click"
          className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "shrink-0")}
        >
          {place.short}
          <ArrowRightIcon aria-hidden size={14} weight="bold" />
        </ScreenLink>
      ) : null}
    </div>
  )
}

/** The bar under the cards: a clock and chips on the left, the actions on the right. */
export function GameBar({
  seconds,
  chips,
  children,
}: {
  seconds: number
  chips?: ReactNode
  children?: ReactNode
}) {
  const t = useTranslations("footer.game")
  return (
    <div className="st-ft-bar">
      <Chip icon={<ClockIcon aria-hidden size={14} />} label={t("time")}>
        {formatClock(seconds)}
      </Chip>
      {chips}
      <span className="ml-auto flex shrink-0 gap-2">{children}</span>
    </div>
  )
}

export function Chip({
  icon,
  label,
  tone,
  children,
}: {
  icon: ReactNode
  /** What the number is, for a screen reader. */
  label: string
  tone?: "brand"
  children: ReactNode
}) {
  return (
    <span className="st-ft-chip text-mono-sm font-mono" data-tone={tone}>
      {icon}
      <span className="sr-only">{label}:</span>
      {children}
    </span>
  )
}

export function BarButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button type="button" className="st-ft-round focus-ring" aria-label={label} onClick={onClick}>
      {children}
    </button>
  )
}

export const formatClock = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`

/** Now, for a clock started or stopped by a click. */
export const stamp = () => Date.now()

/** Whole seconds from `start` to `end`, or to now while there is no `end`. Times are Date.now(). */
export function useClock(start: number | null, end: number | null): number {
  const [now, setNow] = useState(0)
  useEffect(() => {
    if (start === null || end !== null) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [start, end])
  if (start === null) return 0
  return Math.max(0, Math.floor(((end ?? now) - start) / 1000))
}

/** setTimeout that is cleared with the component, and all at once on `clear()`. */
export function useTimers() {
  const ids = useRef<ReturnType<typeof setTimeout>[]>([])
  const clear = useCallback(() => {
    ids.current.forEach(clearTimeout)
    ids.current = []
  }, [])
  const later = useCallback((fn: () => void, ms: number) => {
    ids.current.push(setTimeout(fn, ms))
  }, [])
  useEffect(() => clear, [clear])
  return { later, clear }
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
