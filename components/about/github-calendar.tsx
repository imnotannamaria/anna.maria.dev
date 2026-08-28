"use client"

import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react"
import { Skeleton } from "@/app/components/entrepta/skeleton"
import { EASE_OUT } from "@/components/ui/reveal"
import type { ContributionWeek, ContributionYear } from "@/lib/github/contributions"
import type { CardState } from "@/lib/showcase/state"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

/** The whole scale is mixed from --fg-brand, so it follows the active theme. */
const LEVEL_FILL = [
  "var(--bg-surface)",
  "color-mix(in srgb, var(--fg-brand) 25%, var(--bg-surface))",
  "color-mix(in srgb, var(--fg-brand) 50%, var(--bg-surface))",
  "var(--fg-brand)",
  "var(--fg-brand-hover)",
]

/**
 * Gap between cells, and the floor a column may shrink to.
 *
 * The floor is what makes the squares chunky rather than the container deciding
 * how small they get: 53 columns share whatever width there is, so on a narrow
 * card they'd melt to 4px. Below `53 * MIN_COL` the grid scrolls instead.
 */
const GAP = 3
const MIN_COL = 13

/** How far the hover ring is drawn outside the cell. The scroll container is
 *  padded by this, or the ring is clipped on the edges of the grid. */
const RING = 2

/**
 * Rendered tooltip height, for deciding whether it fits above the cell. Two
 * lines at the body line-height of 1.5 (12px and 11px, ≈ 18px + 17px) plus the
 * tooltip's own 6px top/bottom padding ≈ 47px, rounded up for safety.
 */
const TOOLTIP_H = 52

/** The titlebar's own height (`app/layout.tsx`'s grid row), which the
 *  portalled tooltip would otherwise draw over near the top of `<main>`. */
const TITLEBAR_H = 40

/**
 * `new Date("2026-08-12")` is UTC midnight, so every local formatter in a
 * negative offset prints the day before — the trap CLAUDE.md flags. The parts
 * are read straight off the string, and the weekday is the one thing that needs
 * a Date, read in UTC to match how the string was parsed.
 */
function formatFull(iso: string) {
  const [y, m, d] = iso.split("-")
  const weekday = WEEKDAYS[new Date(iso).getUTCDay()]
  return `${weekday} ${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`
}

function plural(n: number) {
  return `${n} contribution${n === 1 ? "" : "s"}`
}

const column: Variants = { hidden: {}, show: {} }
const cell: Variants = {
  hidden: { opacity: 0, scale: 0.4 },
  show: { opacity: 1, scale: 1 },
}

/**
 * `x`/`y`/`h`/`align` are the cell's own viewport position, captured on the
 * same pointer move that finds it. The tooltip is portalled to `document.body`
 * and positioned from these rather than from percentages of the grid, because
 * the grid sits inside two independent clipping ancestors — this scroll
 * container and `.bento-card` above it — and between them there was never
 * enough real space for a two-line tooltip to render "above" without being cut
 * by one or the other. `position: fixed` on a portalled element escapes both;
 * nothing else reliably does. `h` is the cell's real rendered height, used to
 * place the tooltip below the cell when there isn't room above it.
 */
type Hover = {
  week: number
  day: number
  x: number
  y: number
  h: number
  align: "0%" | "-50%" | "-100%"
} | null

/**
 * One week. Memoized so sweeping the pointer re-renders the column being left
 * and the one being entered, rather than all fifty-three.
 */
const Column = memo(function Column({
  week,
  weekIndex,
  hoveredDay,
  reduce,
}: {
  week: ContributionWeek
  weekIndex: number
  /** null when the pointer is in another column. */
  hoveredDay: number | null
  reduce: boolean
}) {
  return (
    <motion.div
      variants={column}
      className="flex flex-col"
      style={{ flex: "1 1 0", minWidth: MIN_COL, gap: GAP }}
    >
      {week.map((day, di) => {
        const isHovered = hoveredDay === di
        return (
          <motion.span
            key={di}
            variants={cell}
            data-week={weekIndex}
            data-day={di}
            className="relative block w-full"
            style={{
              aspectRatio: "1 / 1",
              borderRadius: 2,
              background: day.date ? LEVEL_FILL[day.level] : "transparent",
              // A ring on the cell itself, the way the reference does it — no
              // travelling band behind the column. Level 0 keeps a hairline or
              // the quiet stretches read as a hole in the card.
              boxShadow: isHovered
                ? `0 0 0 ${RING}px var(--fg-primary)`
                : day.date && day.level === 0
                  ? "inset 0 0 0 1px var(--border-subtle)"
                  : undefined,
              zIndex: isHovered ? 2 : undefined,
              transition: reduce ? undefined : "box-shadow 120ms var(--ease-out)",
            }}
          />
        )
      })}
    </motion.div>
  )
})

/**
 * The grid before the fetch lands: 53 columns of 7, at the same `MIN_COL` floor and the same
 * `GAP` the real one uses, under an empty month-label row and over the same legend line.
 *
 * It is the highest-fidelity skeleton on the site almost by accident — a contribution grid is
 * already a field of identical squares, so tracing it is just drawing the squares without a
 * colour. The shimmer walks the columns rather than firing all 371 cells at once, which is what
 * makes it read as a sweep across a year instead of a flickering wall.
 */
function CalendarSkeleton() {
  return (
    <div className="relative" aria-hidden>
      {/* The same padded, negatively-margined, horizontally scrolling box the real grid sits
          in, so the card is exactly as wide and as tall before the fetch as after it. */}
      <div
        className="overflow-x-auto"
        style={{ padding: RING + 1, margin: -(RING + 1), paddingBottom: RING + 5 }}
      >
        <div className="relative" style={{ minWidth: 53 * MIN_COL + 52 * GAP }}>
          {/* The month row is left empty rather than greyed: it is thin text on a transparent
              background, and a bar there would be the one piece claiming more ink than the
              thing it stands in for. It still reserves its 14px. */}
          <div className="h-3.5" />

          <div className="relative flex" style={{ gap: GAP }}>
            {Array.from({ length: 53 }, (_, wi) => (
              <div
                key={wi}
                className="flex flex-col"
                style={{ flex: "1 1 0", minWidth: MIN_COL, gap: GAP }}
              >
                {Array.from({ length: 7 }, (_, di) => (
                  <span
                    key={di}
                    className="relative block w-full"
                    style={{
                      aspectRatio: "1 / 1",
                      borderRadius: 2,
                      background: "var(--bg-surface-elevated)",
                    }}
                  />
                ))}
              </div>
            ))}

            <span className="skeleton-sweep" />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <Skeleton style={{ width: 128, height: 9, borderRadius: 3 }} />
        <Skeleton delay={0.2} style={{ width: 96, height: 9, borderRadius: 3 }} />
      </div>

      <span className="sr-only" role="status">
        Loading contributions
      </span>
    </div>
  )
}

export function GithubCalendar({ state }: { state: CardState<ContributionYear> }) {
  const data = state.kind === "ok" || state.kind === "stale" ? state.data : null
  const reduce = useReducedMotion() ?? false
  const [hover, setHover] = useState<Hover>(null)

  // `data?.weeks ?? []` would mint a new array every render, which defeats the
  // monthLabels memo below — it would recompute on every hover.
  const weeks = useMemo(() => data?.weeks ?? [], [data])

  // One delegated listener rather than 371 of them. The cells carry their
  // coordinates as data attributes, so the handler never closes over the week
  // list and stays stable for the memoized columns.
  //
  // `getBoundingClientRect` is read here, not in render — same reasoning as
  // `useSpotlight`, which already reads a bounding rect from a pointer event
  // on this codebase. `window.innerWidth` is with it, safe only because this
  // is inside an event handler: it never runs during SSR the way reading it
  // at render time would.
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-week]")
    // A gap between cells (there's a 3px GAP) isn't the pointer leaving the
    // grid — `onPointerLeave` on the container already handles that. Clearing
    // hover here too made the tooltip run a full exit + enter every time the
    // cursor crossed a seam between cells.
    if (!el) return
    const week = Number(el.dataset.week)
    const day = Number(el.dataset.day)
    setHover((prev) => {
      // Same cell as last time: keep the existing object so React bails out of
      // the re-render. A fresh literal here re-renders every memoized column on
      // every `pointermove` — as fast as the pointer reports, not once per cell.
      if (prev && prev.week === week && prev.day === day) return prev
      const rect = el.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const align = x < 60 ? "0%" : x > window.innerWidth - 60 ? "-100%" : "-50%"
      return { week, day, x, y: rect.top, h: rect.height, align }
    })
  }, [])

  // `app/layout.tsx` makes the editor chrome `position: fixed` and gives
  // `<main>` its own scroll — the window itself never scrolls. The tooltip is a
  // portalled `position: fixed` element holding coordinates captured once, at
  // hover time, so a scroll of `<main>` leaves it pinned to a spot the cell has
  // moved out from under (and often now sits over a *different* cell). Capture
  // phase is what catches a scroll on `<main>` rather than only on `window`.
  useEffect(() => {
    if (!hover) return
    const dismiss = () => setHover(null)
    window.addEventListener("scroll", dismiss, true)
    window.addEventListener("resize", dismiss)
    return () => {
      window.removeEventListener("scroll", dismiss, true)
      window.removeEventListener("resize", dismiss)
    }
  }, [hover])

  // A label lands on the first column of each month. Written as a loop rather
  // than a map because carrying `last` across a map callback is a closure the
  // compiler is right to reject.
  const monthLabels = useMemo(() => {
    const out: (string | null)[] = []
    let last = -1
    for (const week of weeks) {
      const first = week.find((d) => d.date)
      const m = first ? Number(first.date.split("-")[1]) - 1 : -1
      if (m === -1 || m === last) {
        out.push(null)
        continue
      }
      last = m
      out.push(MONTHS[m])
    }
    return out
  }, [weeks])

  const hoveredDay = hover ? (weeks[hover.week]?.[hover.day] ?? null) : null
  const active = hoveredDay?.date ? hoveredDay : null

  // Three branches now, and the third is the one the card was missing. This used to be a
  // single `if (!data)` that printed "contributions unavailable" whether GitHub was
  // unreachable or the account genuinely had a quiet year — the first is about this server
  // and the second is about the account, and only one of them is the visitor's business.
  // `loading` is neither: it is the grid, in grey, at the size the real grid will be.
  if (state.kind === "loading") return <CalendarSkeleton />

  if (!data) {
    return (
      <p className="text-mono-sm font-mono" style={{ color: "var(--fg-muted)" }}>
        {state.kind === "empty"
          ? "no public contributions in the last 12 months"
          : "couldn't reach github"}
      </p>
    )
  }

  // Past the guard above, `data` is never null, so `total` is always a number —
  // no `?? null` and no `=== null` branches to keep in sync with it below.
  const total = data.total

  return (
    <div className="relative">
      {/* The padding is what the hover ring lives in, and the matching negative
          margin is what keeps the grid aligned anyway. `overflow-x: auto` clips
          at the padding box — and forces the other axis to `auto` with it — so
          with no padding the 2px ring on the first column, the last column and
          the top row was drawn straight into the clip.
          The tooltip used to live here too, positioned by percentage. It was
          clipped the same way for any row but the first three: it needs ~55px
          of vertical room, and this box only ever had a few px to give, plus a
          second clipping ancestor above it — `.bento-card` itself — leaves too
          little real space either way to fix with more padding. It's rendered
          through a portal below instead, which is what actually escapes both. */}
      <div
        className="overflow-x-auto"
        style={{ padding: RING + 1, margin: -(RING + 1), paddingBottom: RING + 5 }}
      >
        <div style={{ minWidth: weeks.length * MIN_COL + (weeks.length - 1) * GAP }}>
          {/* Month labels ride the same track widths as the grid, so they stay
              aligned at any container width without measuring anything. */}
          <div className="relative flex h-3.5" style={{ gap: GAP }}>
            {monthLabels.map((label, i) => (
              <div key={i} className="relative" style={{ flex: "1 1 0", minWidth: MIN_COL }}>
                {label && (
                  <span
                    className="text-mono-xs absolute top-0 left-0 font-mono whitespace-nowrap"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {label}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="relative">
            <motion.div
              className="flex"
              style={{ gap: GAP }}
              onPointerMove={onPointerMove}
              onPointerLeave={() => setHover(null)}
              // The trigger sits here, on a box with an honest size. The cells
              // start at scale 0.4 and an observer aimed at one of those would
              // be asking for a fraction of almost nothing.
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                staggerChildren: reduce ? 0 : 0.008,
                duration: reduce ? 0 : 0.35,
                ease: EASE_OUT,
              }}
              // 371 focus stops would wreck keyboard nav for a picture of a
              // year. It is described as one, and the total is in text below.
              role="img"
              aria-label={`${plural(total)} on GitHub over the last year`}
            >
              {weeks.map((week, wi) => (
                <Column
                  key={wi}
                  week={week}
                  weekIndex={wi}
                  hoveredDay={hover?.week === wi ? hover.day : null}
                  reduce={reduce}
                />
              ))}
            </motion.div>

            {/* `createPortal` itself has to run unconditionally on every client
                render — gated only by `typeof document`, which is false during
                SSR and true in the browser — and `AnimatePresence` has to live
                inside it, not wrap it. AnimatePresence tracks presence by
                cloning its *direct* children, filtered through
                `React.isValidElement`; a `ReactPortal` fails that check (its
                `$$typeof` isn't `REACT_ELEMENT_TYPE`), so a portal call sitting
                directly inside `<AnimatePresence>` gets silently dropped from
                what it renders — not just the exit animation, the tooltip
                never appeared at all. Moving the portal outside and keeping it
                mounted at all times means AnimatePresence's child is always a
                real `motion.div`, and it's that child — not the portal — whose
                presence toggles with `active && hover`. */}
            {typeof document !== "undefined" &&
              createPortal(
                <AnimatePresence>
                  {active && hover && (
                    <motion.div
                      key="contributions-tooltip"
                      aria-hidden
                      className="pointer-events-none fixed z-50 rounded-md px-2.5 py-1.5 text-center whitespace-nowrap"
                      style={{
                        left: hover.x,
                        top: hover.y,
                        translateX: hover.align,
                        // Flip below the cell when there isn't TOOLTIP_H + an
                        // 8px gap above it before the titlebar — otherwise a
                        // cell in the top couple of rows draws the tooltip over
                        // the 40px fixed chrome instead of the page.
                        translateY:
                          hover.y - TOOLTIP_H - 8 < TITLEBAR_H
                            ? `${hover.h + 8}px`
                            : "calc(-100% - 8px)",
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-strong)",
                        boxShadow: "var(--shadow-overlay)",
                      }}
                      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
                      transition={{ duration: reduce ? 0 : 0.13, ease: EASE_OUT }}
                    >
                      <span
                        className="text-mono-sm block font-mono"
                        style={{ color: "var(--fg-primary)" }}
                      >
                        {plural(active.count)}
                      </span>
                      <span
                        className="text-mono-sm block font-mono"
                        style={{ color: "var(--fg-muted)" }}
                      >
                        {formatFull(active.date)}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>,
                document.body,
              )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div
          className="text-mono-xs flex shrink-0 items-center gap-1 font-mono"
          style={{ color: "var(--fg-muted)" }}
          aria-hidden
        >
          less
          {LEVEL_FILL.map((fill, i) => (
            <span
              key={i}
              className="block"
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: fill,
                boxShadow: i === 0 ? "inset 0 0 0 1px var(--border-subtle)" : undefined,
              }}
            />
          ))}
          more
        </div>

        <span className="text-mono-sm truncate font-mono" style={{ color: "var(--fg-muted)" }}>
          {total.toLocaleString("en-US")} contributions this year
        </span>
      </div>
    </div>
  )
}
