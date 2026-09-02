"use client"

import { useId, useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { Skeleton } from "@/app/components/entrepta/skeleton"
import { ArrowLink } from "@/components/ui/arrow-link"
import { CardFoot, CardHead } from "@/components/ui/card-parts"
import { EASE_OUT, useReveal } from "@/components/ui/reveal"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import { roadmapSlice } from "@/lib/roadmap/widget"
import { STATUS_LABEL, STATUS_MARK, type RoadmapItem } from "@/lib/roadmap/validation"
import type { CardState } from "@/lib/showcase/state"
import { cn } from "@/lib/utils"

/**
 * The roadmap on the home page, read as `git log --graph`: a gutter that branches where the
 * status changes, the `[x] [~] [ ]` marks `/roadmap` already uses, and a ship date. Every
 * glyph on it is one the site is drawn with, so it needs no explaining beside a titlebar
 * with tabs and a status bar.
 *
 * It shows the last two things that shipped, what is moving, and the next two queued — the
 * order time runs in — and counts the rest into the foot. The slicing and its caps live in
 * `lib/roadmap/widget.ts`, tested there, so the card's height does not follow the data.
 *
 * A row with a blurb is a `<button>` that opens it; a row without one is a plain `<div>`.
 * The alternative was a disabled button on half the rows, and an affordance that does
 * nothing when you press it is worse than no affordance — the same call `RoadmapMark` made
 * about not being a `<button role="checkbox">` on a board nobody visiting can edit.
 */
export function RoadmapChangelogCard({
  state,
  className,
}: {
  state: CardState<RoadmapItem[]>
  className?: string
}) {
  const reduce = useReducedMotion() ?? false
  const { onMouseMove, spotlight } = useSpotlight(560)
  const reveal = useReveal()

  const items = state.kind === "ok" || state.kind === "stale" ? state.data : null
  const slice = items ? roadmapSlice(items) : null

  return (
    <motion.div className={cn("bento-card", className)} onMouseMove={onMouseMove} {...reveal}>
      <Spotlight {...spotlight} />

      <CardHead
        label="roadmap"
        as="h3"
        meta={
          <ArrowLink href="/roadmap" className="text-mono-sm text-(--fg-brand)">
            open the board
          </ArrowLink>
        }
      />

      {/* Same shape as the log card's headline row beside it: the row wraps and neither
          half breaks. Two sibling cards in one grid row solving this differently is the
          drift the Standardization check is about. */}
      <div className="relative flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p
          className="text-heading-md font-serif leading-none"
          style={{ color: "var(--fg-primary)", margin: 0 }}
        >
          What I&rsquo;m{" "}
          <em className="italic" style={{ color: "var(--fg-brand)" }}>
            building
          </em>
        </p>
        {slice && slice.total > 0 && (
          <span
            className="text-mono-sm font-mono whitespace-nowrap tabular-nums"
            style={{ color: "var(--fg-muted)" }}
          >
            {slice.counts.done} / {slice.total} shipped
          </span>
        )}
      </div>

      {state.kind === "loading" ? (
        <RowsSkeleton />
      ) : slice && slice.rows.length > 0 ? (
        <Rows slice={slice} reduce={reduce} />
      ) : (
        <Blank
          message={state.kind === "error" ? "couldn't load the board" : "nothing on the board yet"}
        />
      )}

      <CardFoot comment={slice ? `${slice.total} items on the board` : "the board"}>
        {slice && slice.hidden > 0 ? (
          <Link href="/roadmap" style={{ color: "var(--fg-brand)" }}>
            +{slice.hidden} more
          </Link>
        ) : (
          <span aria-hidden style={{ color: "var(--fg-brand)" }}>
            ◆
          </span>
        )}
      </CardFoot>
    </motion.div>
  )
}

// ─── The rows ─────────────────────────────────────────────────────────────────

function Rows({
  slice,
  reduce,
}: {
  slice: NonNullable<ReturnType<typeof roadmapSlice>>
  reduce: boolean
}) {
  const [open, setOpen] = useState<string | null>(null)

  return (
    // The trigger is on the list, which has an honest box, and the rows hear about it
    // through variants. A `whileInView` on a row that starts at `opacity: 0, x: -6` would
    // still work — but one trigger per list is one thing to get wrong instead of seven.
    <motion.ul
      className="relative m-0 flex list-none flex-col p-0"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {slice.rows.map((item, i) => (
        <Row
          key={item.id}
          item={item}
          index={i}
          branches={i > 0 && slice.rows[i - 1].status !== item.status}
          open={open === item.id}
          onToggle={() => setOpen(open === item.id ? null : item.id)}
          reduce={reduce}
        />
      ))}
    </motion.ul>
  )
}

function Row({
  item,
  index,
  branches,
  open,
  onToggle,
  reduce,
}: {
  item: RoadmapItem
  index: number
  branches: boolean
  open: boolean
  onToggle: () => void
  reduce: boolean
}) {
  const drawerId = useId()
  const live = item.status === "doing"
  const expandable = Boolean(item.blurb)

  const line = (
    <>
      {/* The graph gutter: a branch where the status changes, a commit line everywhere
          else. Decoration — the status is in the row's text below. */}
      <span aria-hidden style={{ color: live ? "var(--fg-brand)" : "var(--border-strong)" }}>
        {branches ? "├" : "│"}
      </span>

      <span
        aria-hidden
        className="tabular-nums"
        style={{ color: live ? "var(--fg-brand)" : "var(--fg-muted)" }}
      >
        {STATUS_MARK[item.status]}
      </span>

      {/* The overflow contract: the title truncates. `.bento-card` clips with no ellipsis,
          so a title left to overflow reads as missing data rather than as a long title. */}
      <span
        className="rm-log-title min-w-0 flex-1 truncate"
        style={{
          color: live ? "var(--fg-primary)" : "var(--fg-secondary)",
          textDecoration: item.status === "done" ? "line-through" : undefined,
          textDecorationColor: "var(--border-strong)",
        }}
      >
        <span className="sr-only">{STATUS_LABEL[item.status]}: </span>
        {item.title}
      </span>

      {/* Dropped below sm rather than wrapped: at 287px the title is the row, and a date
          that pushed it to two lines would cost more than it tells. */}
      <span
        className="text-mono-sm hidden shrink-0 tabular-nums sm:inline"
        style={{ color: "var(--fg-muted)" }}
      >
        {item.shippedAt ? item.shippedAt.slice(5).replace("-", "/") : "··/··"}
      </span>
    </>
  )

  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, x: reduce ? 0 : -6 },
        show: {
          opacity: 1,
          x: 0,
          transition: {
            duration: reduce ? 0 : 0.3,
            ease: EASE_OUT,
            // The delay belongs to the entrance and to nothing else — left on a shared
            // transition, every later interaction would sit out the stagger before moving.
            delay: reduce ? 0 : index * 0.05,
          },
        },
      }}
    >
      {expandable ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={drawerId}
          data-open={open}
          className="rm-log-row text-mono-md flex w-full cursor-pointer items-baseline gap-2 rounded-[6px] px-1.5 py-1 text-left font-mono outline-none"
        >
          {line}
        </button>
      ) : (
        <div className="text-mono-md flex items-baseline gap-2 px-1.5 py-1 font-mono">{line}</div>
      )}

      {expandable && (
        <div className="rm-log-drawer" data-open={open} id={drawerId} aria-hidden={!open}>
          <div className="overflow-hidden">
            <p
              className="text-body-md m-0 ml-1.5 py-1.5 pr-2 pl-3 leading-relaxed"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--fg-muted)",
                borderLeft: "1px solid var(--border-brand)",
              }}
            >
              {item.blurb}
            </p>
          </div>
        </div>
      )}
    </motion.li>
  )
}

// ─── The states that are not rows ─────────────────────────────────────────────

/** Empty and error share a frame and differ only in the line, the way the calendar does. */
function Blank({ message }: { message: string }) {
  return (
    <div
      className="relative grid flex-1 place-items-center rounded-[10px] border border-dashed py-8"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <span className="text-mono-sm font-mono" style={{ color: "var(--fg-muted)" }}>
        {message}
      </span>
    </div>
  )
}

/**
 * The rows in grey at the rows' own rhythm — gutter, mark, title, date — so the card is
 * recognisable before it has anything to say and nothing below it moves when it does.
 */
function RowsSkeleton() {
  return (
    <div className="relative flex flex-col gap-[9px]" aria-hidden>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex items-center gap-2 px-1.5">
          <Skeleton delay={i * 0.05} style={{ width: 6, height: 12, borderRadius: 2 }} />
          <Skeleton delay={i * 0.05} style={{ width: 22, height: 10, borderRadius: 3 }} />
          <Skeleton
            delay={i * 0.05}
            style={{ width: `${58 - (i % 3) * 12}%`, height: 10, borderRadius: 3 }}
          />
          <Skeleton
            delay={i * 0.05}
            className="ml-auto hidden sm:block"
            style={{ width: 34, height: 10, borderRadius: 3 }}
          />
        </div>
      ))}
      <span className="sr-only" role="status">
        Loading the roadmap
      </span>
    </div>
  )
}
