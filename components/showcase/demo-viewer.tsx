"use client"

/**
 * The two halves of a component specimen: the list that picks a state, and the stage the demo
 * is drawn on.
 *
 * They used to be one `StateCarousel` — a row of `FilterPill`s over a frame. That borrowed the
 * *filter* vocabulary for something that is not a filter, so on the index there were pills
 * inside pills and a reader had to work out which row filtered a list and which switched a
 * preview. Splitting them lets the page put the picker in the meta column and the demo in its
 * own column, which is the arrangement that finally makes the demo read first.
 *
 * They are separate exports rather than one component because the layout owns where each half
 * goes; the only thing they share is which state is active, and that lives in the caller.
 */

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { EASE_OUT } from "@/components/ui/reveal"
import { Skeleton } from "@/app/components/entrepta/skeleton"
import { cn } from "@/lib/utils"
import { renderDemo } from "./demos"
import type { CardStateKind } from "@/lib/showcase/state"

/**
 * What each state means, as a colour — always beside its own word, never instead of it. The
 * review checklist's colour-independence item: no information carried by hue alone.
 */
const STATE_TONE: Record<CardStateKind, string> = {
  loading: "var(--status-info-fg)",
  empty: "var(--fg-muted)",
  error: "var(--status-error-fg)",
  stale: "var(--status-warning-fg)",
  ok: "var(--status-success-fg)",
}

/**
 * The surface a demo sits on: recessed, so the component's own `.bento-card` rises back out of
 * it instead of being a card inside an identical card.
 *
 * `--bg-canvas` is darker than `--bg-card` in dark mode (#09090b vs #0b0b0e) *and* in light mode
 * (#fafafa vs #ffffff), so "inset" reads in both without a new token.
 */
const STAGE: React.CSSProperties = {
  background: "var(--bg-canvas)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
}

/**
 * The state picker, as a vertical list for the meta column.
 *
 * Vertical because five states — wristkit has five — cost no horizontal room this way, and
 * because a column of words beside a preview reads as "pick one to show" in a way a horizontal
 * row of chips above it does not.
 */
export function StateList({
  states,
  active,
  onSelect,
  label,
}: {
  states: readonly CardStateKind[]
  active: CardStateKind
  onSelect: (kind: CardStateKind) => void
  /** Names the group for a screen reader: "me, as a playlist — states". */
  label: string
}) {
  // One state is not a choice. A single honest state gets no list rather than a list of one,
  // which would imply there is something else to see.
  if (states.length < 2) return null

  return (
    <div
      role="group"
      aria-label={`${label} — states`}
      className="flex flex-wrap gap-0.5 sm:flex-col"
    >
      {states.map((kind) => {
        const on = active === kind
        return (
          <button
            key={kind}
            type="button"
            onClick={() => onSelect(kind)}
            aria-pressed={on}
            className="text-mono-sm flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] py-1.5 pr-2.5 pl-2 text-left font-mono transition-colors"
            style={{
              color: on ? "var(--fg-primary)" : "var(--fg-muted)",
              background: on ? "var(--bg-surface-elevated)" : "transparent",
              // The coloured edge is the state's meaning; the word beside it is the same fact
              // in text, so neither is load-bearing on its own.
              boxShadow: `inset 2px 0 0 0 ${on ? STATE_TONE[kind] : "transparent"}`,
            }}
          >
            <span
              aria-hidden
              className="block shrink-0 rounded-full"
              style={{
                width: 5,
                height: 5,
                background: STATE_TONE[kind],
                opacity: on ? 1 : 0.4,
              }}
            />
            {kind}
          </button>
        )
      })}
    </div>
  )
}

/**
 * The box each component's stage reserves: its *tallest* state, not its average.
 *
 * One number per component rather than one per state, because the point is that all of a
 * component's states occupy the same box. A stage sized to each would move the page under the
 * cursor clicking through them. Whatever is shorter gets centred.
 *
 * It lives here rather than at the call site, and that is a fix rather than tidying. It was a
 * table in `showcase-feed.tsx` passed in as a prop, so the index got the tuned height and the
 * doc pages, which never passed one, fell back to the 240px default. The same component had two
 * different stages depending on which page you were on, and on the doc page its states jumped —
 * exactly what the numbers exist to prevent. A `DemoStage` knows its own slug; it can look this
 * up itself.
 *
 * Measured by eye and the one thing here no test can check. A state that outgrows its number
 * pushes the stage taller, which is visible immediately, and the number is what is wrong.
 */
const STAGE_HEIGHT: Record<string, number> = {
  tree: 480,
  stack: 360,
  playlist: 260,
  piano: 280,
  contributions: 320,
  "stack-graph": 480,
  wristkit: 470,
}

/**
 * The demo itself, on its stage.
 *
 * Nothing is mounted until the stage has been near the viewport: two of these are the heaviest
 * things in the repo (React Flow, a Web Audio piano) and the index has seven of them.
 */
export function DemoStage({
  slug,
  name,
  active,
  minHeight,
  className,
}: {
  slug: string
  name: string
  active: CardStateKind
  /** Overrides `STAGE_HEIGHT` where a caller genuinely knows better. Nothing does yet. */
  minHeight?: number
  className?: string
}) {
  const reserved = minHeight ?? STAGE_HEIGHT[slug] ?? 260
  const [near, setNear] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion() ?? false

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true)
          observer.disconnect()
        }
      },
      // Generous, so the chunk is in flight before the specimen is actually read.
      { rootMargin: "400px 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <figure
      ref={ref}
      className={cn("flex flex-col justify-center", className)}
      style={{ ...STAGE, margin: 0, minHeight: reserved }}
    >
      {/* The inset the specimen sits in, and the last of four nested paddings before the
          component's own — so it is halved on a phone rather than kept for symmetry. */}
      <div className="w-full p-2 sm:p-4">
        {near ? (
          <AnimatePresence mode="wait" initial={false}>
            {/* Keyed on the state, so switching crossfades rather than snapping. Not an
                entrance — the demo's own useReveal already ran when it mounted — so it is
                AnimatePresence rather than whileInView, and it asks useReducedMotion itself
                because the global reset only reaches CSS. */}
            <motion.div
              key={active}
              initial={{ opacity: reduce ? 1 : 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: reduce ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 0.18, ease: EASE_OUT }}
            >
              {renderDemo(slug, active)}
            </motion.div>
          </AnimatePresence>
        ) : (
          // Not a card, and not this component's own skeleton either: nothing has been
          // requested yet, so there is nothing to be a skeleton *of*. One shimmering block
          // holding the stage's height until the observer fires.
          <Skeleton style={{ height: reserved - 32, borderRadius: "var(--radius-md)" }} />
        )}
      </div>

      <figcaption className="sr-only">{`${name}, shown in its "${active}" state`}</figcaption>
    </figure>
  )
}
