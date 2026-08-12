"use client"

import { memo, useCallback, useMemo, useState } from "react"
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react"
import { EASE_OUT } from "@/components/ui/reveal"
import { useContributions, type ContributionWeek } from "./use-contributions"

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

type Hover = { week: number; day: number } | null

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

export function ContributionsCalendar({ username }: { username: string }) {
  const reduce = useReducedMotion() ?? false
  const { weeks, total, error, loading } = useContributions(username)
  const [hover, setHover] = useState<Hover>(null)

  // One delegated listener rather than 371 of them. The cells carry their
  // coordinates as data attributes, so the handler never closes over the week
  // list and stays stable for the memoized columns.
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-week]")
    if (!el) return setHover(null)
    setHover({ week: Number(el.dataset.week), day: Number(el.dataset.day) })
  }, [])

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

  if (error) {
    return (
      <p className="font-mono text-[12px]" style={{ color: "var(--fg-muted)" }}>
        {error}
      </p>
    )
  }

  // Both coordinates are percentages of the grid box, which is what lets the
  // tooltip track a cell without measuring anything.
  //
  // The top three rows flip it below the cell. The tooltip shares the grid's
  // clipping container, so anything it draws above the first row has only the
  // month labels' worth of room before it is cut — flipping keeps it inside the
  // box for every row instead of relying on there being space above.
  const tipLeft = hover ? ((hover.week + 0.5) / weeks.length) * 100 : 0
  const tipBelow = hover ? hover.day <= 2 : false
  const tipAlign = tipLeft < 12 ? "0%" : tipLeft > 88 ? "-100%" : "-50%"

  return (
    <div className="relative">
      {/* The padding is what the hover ring lives in, and the matching negative
          margin is what keeps the grid aligned anyway. `overflow-x: auto` clips
          at the padding box — and forces the other axis to `auto` with it — so
          with no padding the 2px ring on the first column, the last column and
          the top row was drawn straight into the clip. */}
      <div
        className="overflow-x-auto"
        style={{ padding: RING + 1, margin: -(RING + 1), paddingBottom: RING + 5 }}
      >
        <div style={{ minWidth: 53 * MIN_COL + 52 * GAP }}>
          {/* Month labels ride the same track widths as the grid, so they stay
              aligned at any container width without measuring anything. */}
          <div className="relative flex h-3.5" style={{ gap: GAP }}>
            {monthLabels.map((label, i) => (
              <div key={i} className="relative" style={{ flex: "1 1 0", minWidth: MIN_COL }}>
                {label && (
                  <span
                    className="absolute top-0 left-0 font-mono text-[10px] whitespace-nowrap"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {label}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="relative">
            {loading ? (
              // The skeleton is the real grid with no data, so there is no
              // height to guess and nothing shifts when the fetch lands.
              <div className="flex animate-pulse" style={{ gap: GAP }}>
                {Array.from({ length: 53 }, (_, wi) => (
                  <div
                    key={wi}
                    className="flex flex-col"
                    style={{ flex: "1 1 0", minWidth: MIN_COL, gap: GAP }}
                  >
                    {Array.from({ length: 7 }, (_, di) => (
                      <span
                        key={di}
                        className="block w-full"
                        style={{
                          aspectRatio: "1 / 1",
                          borderRadius: 2,
                          background: "var(--bg-surface)",
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
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
                aria-label={
                  total === null
                    ? "GitHub contributions over the last year"
                    : `${plural(total)} on GitHub over the last year`
                }
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
            )}

            <AnimatePresence>
              {active && hover && (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute z-10 rounded-md px-2.5 py-1.5 text-center whitespace-nowrap"
                  style={{
                    left: `${tipLeft}%`,
                    top: `${(hover.day / 7) * 100}%`,
                    translateX: tipAlign,
                    translateY: tipBelow ? "calc(100% + 26px)" : "calc(-100% - 8px)",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-strong)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
                  }}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
                  transition={{ duration: reduce ? 0 : 0.13, ease: EASE_OUT }}
                >
                  <span
                    className="block font-mono text-[12px]"
                    style={{ color: "var(--fg-primary)" }}
                  >
                    {plural(active.count)}
                  </span>
                  <span
                    className="block font-mono text-[11px]"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {formatFull(active.date)}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div
          className="flex shrink-0 items-center gap-1 font-mono text-[10px]"
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

        <span className="truncate font-mono text-[11px]" style={{ color: "var(--fg-muted)" }}>
          {total !== null ? `${total.toLocaleString("en-US")} contributions this year` : ""}
        </span>
      </div>
    </div>
  )
}
