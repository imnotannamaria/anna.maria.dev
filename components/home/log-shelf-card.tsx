"use client"

import { useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Skeleton } from "@/app/components/entrepta/skeleton"
import { ArrowLink } from "@/components/ui/arrow-link"
import { CardHead } from "@/components/ui/card-parts"
import { EASE_OUT, useReveal } from "@/components/ui/reveal"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import { posterSrc } from "@/lib/log/poster-src"
import type { CardState } from "@/lib/showcase/state"
import { TYPE_LABEL, type LogEntry } from "@/lib/log/validation"
import { cn } from "@/lib/utils"

/**
 * The log on the home page: two rows of covers drifting past each other in opposite
 * directions. Point anywhere in the strip and both stop, everything dims, and the line
 * underneath says what you are on.
 *
 * It replaces a card that was a dashboard *about* the log — one poster, five 48px thumbs,
 * four counters and a bar chart — where the biggest thing on it was a number and the only
 * part anyone recognises was the smallest. This card has no counters and no hero, and that
 * is the trade it makes: there is no single entry it is about, so the copy says "everything
 * I finished" rather than "my favourite".
 *
 * What it buys is that length stops being a problem. There is no position to drive and no
 * page to turn, so twenty entries and two hundred are the same card — which is the half of
 * the log's performance item that the layout can answer on its own.
 *
 * Everything visual is CSS (`.log-drift*` in globals.css). React state here holds the
 * caption and nothing else, because a caption is data and a hover is not.
 */

/** Below this many covers a strip is narrower than the card and the loop shows a gap. */
const MIN_PER_STRIP = 8

/** Seconds per cover. Constant speed whatever the shelf's length. */
const SECONDS_PER_COVER = 3.4

export function LogShelfCard({
  state,
  className,
}: {
  state: CardState<LogEntry[]>
  className?: string
}) {
  const [active, setActive] = useState<LogEntry | null>(null)
  const reduce = useReducedMotion() ?? false
  const { onMouseMove, spotlight } = useSpotlight(760)
  const reveal = useReveal()

  const entries = state.kind === "ok" || state.kind === "stale" ? state.data : null

  return (
    <motion.div
      className={cn("bento-card log-shelf", className)}
      onMouseMove={onMouseMove}
      {...reveal}
    >
      <Spotlight {...spotlight} />

      <CardHead
        label="log"
        as="h3"
        meta={
          <ArrowLink href="/log" className="text-mono-sm text-(--fg-brand)">
            open the log
          </ArrowLink>
        }
      />

      {/* Two children and `justify-between`, so it needs a contract: the row wraps and
          neither half breaks, which is what `CardHead` settled on for the same shape. */}
      <div className="relative flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p
          className="text-heading-md font-serif leading-none"
          style={{ color: "var(--fg-primary)", margin: 0 }}
        >
          Everything I{" "}
          <em className="italic" style={{ color: "var(--fg-brand)" }}>
            finished
          </em>
        </p>
        {entries && (
          <span
            className="text-mono-sm font-mono whitespace-nowrap tabular-nums"
            style={{ color: "var(--fg-muted)" }}
          >
            {entries.length} entries
          </span>
        )}
      </div>

      {state.kind === "loading" ? (
        <DriftSkeleton />
      ) : entries && entries.length > 0 ? (
        <Drift entries={entries} onActive={setActive} />
      ) : (
        <Blank
          message={
            state.kind === "error"
              ? "couldn't load the log"
              : "nothing logged yet — the first entry lands soon"
          }
        />
      )}

      {/*
        The caption doubles as the card's foot: idle it is the `//` comment every other card
        ends on, and pointing at a cover replaces it with that entry. One row rather than a
        caption above a foot, because the card sits beside the roadmap in the same grid row
        and 40px of chrome it does not need is 40px the neighbour has to match.
      */}
      <Caption entry={active} state={state} reduce={reduce} />
    </motion.div>
  )
}

// ─── The rows ─────────────────────────────────────────────────────────────────

function Drift({
  entries,
  onActive,
}: {
  entries: LogEntry[]
  onActive: (entry: LogEntry | null) => void
}) {
  // Split rather than repeated, so the two rows never show the same cover side by side.
  const half = Math.ceil(entries.length / 2)
  const rows = [entries.slice(0, half), entries.slice(half)].filter((r) => r.length > 0)

  return (
    <div
      className="log-drift relative flex flex-col gap-2.5"
      // Cleared on leaving the whole strip, not on leaving a cover: the gaps between
      // covers are 10px, and clearing there would blank the caption every time the
      // pointer crossed a seam.
      onPointerLeave={() => onActive(null)}
    >
      {rows.map((row, r) => (
        <Row key={r} row={row} dir={r === 0 ? "left" : "right"} onActive={onActive} />
      ))}
    </div>
  )
}

function Row({
  row,
  dir,
  onActive,
}: {
  row: LogEntry[]
  dir: "left" | "right"
  onActive: (entry: LogEntry) => void
}) {
  // One copy, padded out to at least MIN_PER_STRIP so it is wider than the card, then the
  // whole copy twice. Translating by exactly half the track lands on an identical frame.
  const reps = Math.max(1, Math.ceil(MIN_PER_STRIP / row.length))
  const copy = Array.from({ length: reps }, () => row).flat()
  const cells = [...copy, ...copy]

  return (
    <div className="log-drift-row">
      <div
        className="log-drift-track flex h-full w-max items-center gap-2.5"
        data-dir={dir}
        style={{ animationDuration: `${copy.length * SECONDS_PER_COVER}s` }}
      >
        {cells.map((entry, i) => {
          // Only the first pass over the real row is real. Everything after it is the same
          // entry again, so it is hidden from assistive tech and from the tab order —
          // otherwise a screen reader reads the shelf four times and a keyboard walks it.
          const original = i < row.length

          return (
            <button
              key={`${entry.id}-${i}`}
              type="button"
              aria-hidden={!original}
              tabIndex={original ? 0 : -1}
              // `pointerenter`, not `mouseenter`: a tap reports as a pointer event with
              // `pointerType: "touch"`, so touch gets the caption too.
              onPointerEnter={() => onActive(entry)}
              onFocus={() => onActive(entry)}
              className="log-drift-item relative shrink-0 cursor-pointer rounded-[9px] outline-none"
            >
              {/* The title is the button's accessible name and it is in the served HTML —
                  the shelf is text to a crawler, not a row of unlabelled images. */}
              <span className="sr-only">{entry.title}</span>
              <Poster entry={entry} />
              {entry.favorite && (
                <>
                  <span
                    aria-hidden
                    className="absolute top-1 right-1 leading-none"
                    style={{
                      color: "var(--fg-brand)",
                      fontSize: 11,
                      textShadow: "0 1px 3px rgba(0,0,0,0.7)",
                    }}
                  >
                    ♥
                  </span>
                  {original && <span className="sr-only">favourite</span>}
                </>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * One cover, through `/api/v1/poster/<token>` like every other poster on the site — a local
 * path, so `next/image` optimises it and no poster host ever appears in `remotePatterns` or
 * gets to set a cookie in a visitor's browser.
 */
function Poster({ entry }: { entry: LogEntry }) {
  return (
    // `absolute inset-0`, not `h-full`: the parent is a <button>, and a percentage height
    // inside one does not resolve in every engine — `next/image` with `fill` then measures a
    // height of 0 and warns for every poster on the page, which is how this was caught.
    <span
      className="absolute inset-0 block overflow-hidden rounded-[9px]"
      style={{
        background: "var(--bg-canvas)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 8px 20px -14px rgba(0,0,0,0.8)",
      }}
    >
      {entry.posterUrl ? (
        <Image
          src={posterSrc(entry.posterUrl)}
          alt=""
          fill
          // The two branches of --log-cover-w in globals.css. A wrong `sizes` here is what
          // put 2.7 MB of oversized posters on /log once already.
          sizes="(min-width: 640px) 84px, 62px"
          className="object-cover"
          draggable={false}
        />
      ) : (
        <span
          aria-hidden
          className="text-mono-xs absolute inset-0 grid place-items-center px-1 text-center font-mono uppercase"
          style={{ color: "var(--fg-muted)" }}
        >
          {TYPE_LABEL[entry.type]}
        </span>
      )}
    </span>
  )
}

// ─── The line underneath ──────────────────────────────────────────────────────

function Caption({
  entry,
  state,
  reduce,
}: {
  entry: LogEntry | null
  state: CardState<LogEntry[]>
  reduce: boolean
}) {
  const idle =
    state.kind === "ok" || state.kind === "stale"
      ? "point at anything to stop the rows"
      : "the log, when it comes back"

  return (
    // A fixed two-line box. Without it the card grows by a line the first time a long
    // title arrives, and in a grid row that drags its neighbour with it.
    <div className="relative mt-auto grid" style={{ minHeight: 40 }}>
      <AnimatePresence initial={false}>
        <motion.div
          key={entry?.id ?? "idle"}
          className="col-start-1 row-start-1 flex min-w-0 flex-col gap-0.5"
          initial={{ opacity: 0, y: reduce ? 0 : 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : -4 }}
          transition={{ duration: reduce ? 0 : 0.2, ease: EASE_OUT }}
        >
          {entry ? (
            <>
              {/* Each line truncates. `.bento-card` clips with no ellipsis, so a title that
                  overflows would look like missing data rather than a long title. */}
              <span className="flex min-w-0 items-baseline gap-2">
                <span
                  className="text-mono-xs shrink-0 font-mono tracking-[0.08em] uppercase"
                  style={{ color: "var(--fg-brand)" }}
                >
                  {TYPE_LABEL[entry.type]}
                </span>
                <span
                  className="text-mono-md min-w-0 truncate font-mono"
                  style={{ color: "var(--fg-primary)" }}
                >
                  {entry.title}
                </span>
              </span>
              <span
                className="text-mono-sm truncate font-mono"
                style={{ color: "var(--fg-secondary)" }}
              >
                {[entry.creator, entry.year].filter(Boolean).join(" · ") || " "}
              </span>
            </>
          ) : (
            <span className="text-mono-sm font-mono" style={{ color: "var(--fg-muted)" }}>
              <span style={{ opacity: 0.6 }}>{"// "}</span>
              {idle}
            </span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── The states that are not covers ───────────────────────────────────────────

/** Empty and error share a frame and differ only in the line, the way the calendar does. */
function Blank({ message }: { message: string }) {
  return (
    <div
      className="relative grid place-items-center rounded-[10px] border border-dashed"
      style={{
        height: "calc(var(--log-cover-h) * 2 + 10px)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <span className="text-mono-sm font-mono" style={{ color: "var(--fg-muted)" }}>
        {message}
      </span>
    </div>
  )
}

/**
 * The rows in grey, at the size the real rows will be, so nothing below moves when the
 * query lands. Not a generic pair of boxes: a skeleton you recognise tells you *which*
 * card is coming, which is the only thing worth knowing while you wait.
 */
function DriftSkeleton() {
  return (
    <div className="log-drift relative flex flex-col gap-2.5" aria-hidden>
      {[0, 1].map((r) => (
        <div key={r} className="log-drift-row">
          <div className="flex h-full w-max items-center gap-2.5">
            {Array.from({ length: 12 }, (_, i) => (
              <Skeleton
                key={i}
                delay={r * 0.08 + i * 0.04}
                className="shrink-0"
                // The real box, from the same two custom properties the covers use — not
                // `.log-drift-item`, which dims on container hover and a loading state
                // should not answer a pointer.
                style={{
                  width: "var(--log-cover-w)",
                  height: "var(--log-cover-h)",
                  borderRadius: 9,
                }}
              />
            ))}
          </div>
        </div>
      ))}
      <span className="sr-only" role="status">
        Loading the log
      </span>
    </div>
  )
}
