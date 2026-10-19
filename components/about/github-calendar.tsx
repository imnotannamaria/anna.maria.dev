"use client"

import { useLocale, useTranslations } from "next-intl"
import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react"
import { Skeleton } from "@/app/components/entrepta/skeleton"
import { EASE_OUT } from "@/lib/motion"
import { OVERLAY_SURFACE } from "@/lib/overlay"
import { cn } from "@/lib/utils"
import type { ContributionWeek, ContributionYear } from "@/lib/github/contributions"
import type { CardState } from "@/lib/card-state"

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

/** Keep the tooltip below the floating header's top area. */
const HEADER_CLEARANCE = 40

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
 * container and the Card above it — and between them there was never
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
 * The grid's geometry, with nothing in it.
 *
 * Every state that has no data to draw goes through here — loading, empty and error — so the
 * card is exactly as tall in all four states at every container width. That could not be done
 * with a number: a cell is `aspect-ratio: 1` over a column that is `1fr` of whatever width there
 * is, so the grid's height is a function of the card's width and there is no pixel value that is
 * right at more than one size. Rendering the real 53 × 7 and leaving it blank is the only thing
 * that agrees everywhere.
 *
 * It was a `<p>` with one line in it for empty and error, which is why those two states were a
 * third the height of the working card.
 */
function GridFrame({
  tone,
  overlay,
  footer,
}: {
  /** What the cells are filled with. Grey while loading, invisible when there is nothing. */
  tone: string
  /** Centred over the grid — the sweep while loading, a sentence when there is nothing. */
  overlay?: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <div className="relative" aria-hidden>
      {/* The same padded, negatively-margined, horizontally scrolling box the real grid sits
          in, so the card is the same width as well as the same height. */}
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
                    style={{ aspectRatio: "1 / 1", borderRadius: 2, background: tone }}
                  />
                ))}
              </div>
            ))}

            {overlay}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">{footer}</div>
    </div>
  )
}

/**
 * The grid before the fetch lands: 53 columns of 7, at the same `MIN_COL` floor and the same
 * `GAP` the real one uses.
 *
 * It is the highest-fidelity skeleton on the site almost by accident — a contribution grid is
 * already a field of identical squares, so tracing it is just drawing the squares without a
 * colour. One `.skeleton-sweep` overlay travels across them rather than 371 elements each
 * animating a gradient, which is the per-frame repaint CLAUDE.md warns about, 371 times over.
 */
function CalendarSkeleton() {
  const t = useTranslations("professional.calendar")
  return (
    <>
      <GridFrame
        tone="var(--bg-surface-elevated)"
        overlay={<span className="skeleton-sweep" />}
        footer={
          <>
            <Skeleton style={{ width: 128, height: 9, borderRadius: 3 }} />
            <Skeleton delay={0.2} style={{ width: 96, height: 9, borderRadius: 3 }} />
          </>
        }
      />
      <span className="sr-only" role="status">
        {t("loading")}
      </span>
    </>
  )
}

/**
 * Nothing to draw, and the difference between the two reasons stated in words.
 *
 * The cells are drawn at a tenth of the border colour rather than not at all: an empty year is
 * still a year, and a card with a blank rectangle where the grid goes reads as broken rather
 * than as quiet.
 */
function CalendarBlank({ message }: { message: string }) {
  return (
    <>
      <GridFrame
        tone="color-mix(in srgb, var(--border-subtle) 45%, transparent)"
        overlay={
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span
              className="text-mono-sm rounded-[var(--radius-sm)] px-3 py-1.5 font-mono"
              style={{
                color: "var(--fg-secondary)",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {message}
            </span>
          </div>
        }
        footer={<span />}
      />
      <span className="sr-only">{message}</span>
    </>
  )
}

export function GithubCalendar({ state }: { state: CardState<ContributionYear> }) {
  const t = useTranslations("professional.calendar")
  const locale = useLocale()
  const dates = useMemo(
    () => ({
      month: new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }),
      full: new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }),
    }),
    [locale],
  )
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

  // The frame scrolls each side independently. The portalled tooltip holds viewport
  // coordinates, so dismiss it on any captured scroll rather than leaving it over a
  // different cell. Listening only to window would miss the side scrolling.
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
      out.push(dates.month.format(new Date(`2000-${String(m + 1).padStart(2, "0")}-01T00:00:00Z`)))
    }
    return out
  }, [weeks, dates])

  const hoveredDay = hover ? (weeks[hover.week]?.[hover.day] ?? null) : null
  const active = hoveredDay?.date ? hoveredDay : null

  // Three branches now, and the third is the one the card was missing. This used to be a
  // single `if (!data)` that printed "contributions unavailable" whether GitHub was
  // unreachable or the account genuinely had a quiet year — the first is about this server
  // and the second is about the account, and only one of them is the visitor's business.
  // `loading` is neither: it is the grid, in grey, at the size the real grid will be.
  if (state.kind === "loading") return <CalendarSkeleton />

  if (!data) {
    return <CalendarBlank message={state.kind === "empty" ? t("empty") : t("unavailable")} />
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
          second clipping ancestor above it — the Card itself — leaves too
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
              aria-label={t("summary", { count: total })}
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
                      // The finish of entrepta's Tooltip, without the component: the overlay
                      // surface, its radius and padding, and `data-surface="dark"` so it stays
                      // dark in light mode like the sidebar's. The component itself is one
                      // Radix root per trigger, which here would be 371 of them; this is one
                      // box that follows a delegated pointer.
                      data-surface="dark"
                      className={cn(
                        OVERLAY_SURFACE,
                        "pointer-events-none fixed z-50 rounded-[var(--radius-sm)] px-2.5 py-1.5",
                        "text-center whitespace-nowrap",
                      )}
                      style={{
                        left: hover.x,
                        top: hover.y,
                        translateX: hover.align,
                        // Flip below the cell when there isn't TOOLTIP_H + an
                        // 8px gap above it before the floating header area.
                        translateY:
                          hover.y - TOOLTIP_H - 8 < HEADER_CLEARANCE
                            ? `${hover.h + 8}px`
                            : "calc(-100% - 8px)",
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
                        {t("count", { count: active.count })}
                      </span>
                      <span
                        className="text-mono-sm block font-mono"
                        style={{ color: "var(--fg-muted)" }}
                      >
                        {dates.full.format(new Date(`${active.date}T00:00:00Z`))}
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
          {t("less")}
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
          {t("more")}
        </div>

        <span className="text-mono-sm truncate font-mono" style={{ color: "var(--fg-muted)" }}>
          {t("year", { count: total })}
        </span>
      </div>
    </div>
  )
}
