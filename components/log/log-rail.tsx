"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react"
import { useReducedMotion } from "motion/react"

/**
 * One type's entries as a horizontal rail instead of a wrapping grid.
 *
 * `/log` used to lay each type out as a grid that grew downwards, so a type with forty
 * entries was forty cards tall and everything under it was pushed off the page. A rail is
 * one row whatever the count, which is what makes the page's height a function of how many
 * *types* there are rather than how many entries.
 *
 * It also lets the page stop rendering everything. Only the first `CHUNK` cards of a rail
 * exist; a sentinel sits after the last one and, when it comes within `REACH` of the right
 * edge, the next chunk appends. Scrolling towards the end is the load-more gesture, so there
 * is no button to press and nothing to wait for — by the time the last visible card is under
 * the cursor, the next twelve are already there.
 *
 * **The cost, named.** The slice is real on the server too, so a crawler sees the first
 * twelve of each type rather than all of them. That is the trade the optimisation *is*:
 * trimming after hydration would leave the browser building the whole DOM on first paint,
 * which is the slowness the roadmap item is about. It is affordable here because `/log` has
 * no page per entry — deliberately, see CLAUDE.md — so the indexed unit is this page, whose
 * heading, description and true per-type counts are all unaffected.
 *
 * No carousel library. Native `overflow-x` already gives momentum, touch dragging, snap
 * points and a scrollable region a keyboard can reach; a library would take the scroll
 * container over and would have to be taught all of it again, for ten kilobytes.
 */

/** Cards per reveal. Above every current type's total, so today nothing is trimmed at all. */
const CHUNK = 12

/** How close to the end, in px, counts as "approaching it". */
const REACH = 600

export function LogRail<T>({
  items,
  label,
  renderItem,
}: {
  items: T[]
  /** The type's plural, for the region's accessible name: `albums`, `films`. */
  label: string
  renderItem: (item: T, index: number) => React.ReactNode
}) {
  const [shown, setShown] = useState(() => Math.min(CHUNK, items.length))
  const [edges, setEdges] = useState<{ start: boolean; end: boolean } | null>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const sentinel = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion() ?? false

  /**
   * Recreated whenever `shown` changes, and that is the point: an IntersectionObserver does
   * not fire again while its target stays intersecting, so a rail short enough that the
   * sentinel is still in reach after a chunk lands would stop after one. A fresh observer
   * re-evaluates immediately and appends again until the sentinel is genuinely out of reach
   * or there is nothing left, which the early return guarantees terminates.
   */
  useEffect(() => {
    if (shown >= items.length) return
    const root = scroller.current
    const target = sentinel.current
    if (!root || !target) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShown((n) => Math.min(n + CHUNK, items.length))
      },
      // Only the right edge is pushed out: the rail reveals forwards, and expanding the
      // other three would fire on a rail that merely exists on screen.
      { root, rootMargin: `0px ${REACH}px 0px 0px` },
    )
    io.observe(target)
    return () => io.disconnect()
  }, [shown, items.length])

  /** Which arrows have anywhere to go. `null` until measured, so none render server-side. */
  const measure = useCallback(() => {
    const el = scroller.current
    if (!el) return
    const start = el.scrollLeft <= 1
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1
    setEdges((prev) => (prev && prev.start === start && prev.end === end ? prev : { start, end }))
  }, [])

  useEffect(() => {
    measure()
    const el = scroller.current
    if (!el || typeof ResizeObserver === "undefined") return
    // The card width is `min(320px, 100%)`, so the rail becomes scrollable or stops being
    // scrollable as the column resizes — a resize listener on the window would miss the
    // outline rail appearing at 1100px, which changes this element's width and nothing else.
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure, shown])

  const page = (dir: -1 | 1) => {
    const el = scroller.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" })
  }

  const scrollable = edges !== null && !(edges.start && edges.end)

  /**
   * Which sides are hiding something. The fade is the same measurement the arrows are, so it
   * can only ever say what they say — and at rest it says nothing, which is the point: a
   * gradient over the first card's edge when there is nothing to its left does not read as
   * depth, it reads as a card that failed to finish drawing.
   */
  const more = edges
    ? [!edges.start && "start", !edges.end && "end"].filter(Boolean).join(" ")
    : undefined

  return (
    <div className="log-rail relative">
      <div
        ref={scroller}
        onScroll={measure}
        className="log-rail-track"
        data-more={more}
        // A scrollable region with no focusable child would be unreachable by keyboard, and
        // some cards have neither a link nor a note. `group` rather than `region` so nine
        // types do not become nine landmarks.
        tabIndex={0}
        role="group"
        aria-label={`${label}, scrollable`}
      >
        {items.slice(0, shown).map((item, i) => renderItem(item, i))}

        {shown < items.length && <span ref={sentinel} className="log-rail-sentinel" aria-hidden />}
      </div>

      {scrollable && (
        <>
          <RailButton
            dir={-1}
            disabled={edges.start}
            label={`Scroll ${label} left`}
            onClick={page}
          />
          <RailButton dir={1} disabled={edges.end} label={`Scroll ${label} right`} onClick={page} />
        </>
      )}

      {/* Announced only when a chunk lands, which is the moment it is worth knowing that the
          rail has more in it than it did a second ago. */}
      <p className="sr-only" aria-live="polite">
        {shown < items.length
          ? `Showing ${shown} of ${items.length} ${label}`
          : `All ${items.length} ${label}`}
      </p>
    </div>
  )
}

function RailButton({
  dir,
  disabled,
  label,
  onClick,
}: {
  dir: -1 | 1
  disabled: boolean
  label: string
  onClick: (dir: -1 | 1) => void
}) {
  const Icon = dir === -1 ? CaretLeftIcon : CaretRightIcon
  return (
    <button
      type="button"
      onClick={() => onClick(dir)}
      disabled={disabled}
      aria-label={label}
      className="log-rail-arrow"
      data-dir={dir === -1 ? "prev" : "next"}
    >
      <Icon size={14} weight="bold" aria-hidden />
    </button>
  )
}
