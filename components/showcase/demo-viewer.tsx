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
export const STATE_TONE: Record<CardStateKind, string> = {
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
 * The demo itself, on its stage.
 *
 * Nothing is mounted until the stage has been near the viewport: two of these are the heaviest
 * things in the repo (React Flow, a Web Audio piano) and the index has seven of them.
 */
export function DemoStage({
  slug,
  name,
  active,
  minHeight = 240,
  className,
}: {
  slug: string
  name: string
  active: CardStateKind
  /**
   * The box every state of this component gets, tuned to its tallest.
   *
   * It is a floor and the demo is centred in it, which is what stops switching states from
   * jumping: `me, as a playlist` in `ok` is a whole card and in `error` it is a shorter one, and
   * a stage that shrank to fit each would move the page under the cursor that is clicking
   * through them. Centring also reads better than a short frame pinned to the top of a tall box.
   *
   * A state taller than this still grows the stage rather than being clipped — the number is a
   * reservation, not a cage. If one state pushes past it, the number is wrong, not the state.
   */
  minHeight?: number
  className?: string
}) {
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
      style={{ ...STAGE, margin: 0, minHeight }}
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
          <Skeleton style={{ height: minHeight - 32, borderRadius: "var(--radius-md)" }} />
        )}
      </div>

      <figcaption className="sr-only">{`${name}, shown in its "${active}" state`}</figcaption>
    </figure>
  )
}
