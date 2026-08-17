"use client"

/**
 * The progress card.
 *
 * A `.bento-card` like the rest: head, body, foot. The body is a stepper — the three
 * columns as stages, with the live one pulsing.
 */

import { motion, useReducedMotion } from "motion/react"
import { CardFoot, CardHead } from "@/components/ui/card-parts"
import { revealViewport, useReveal } from "@/components/ui/reveal"
import { RollingNumber, useRollOnHover } from "@/components/ui/rolling-number"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import { PUBLIC_STATUSES, STATUS_LABEL, type PublicStatus } from "@/lib/roadmap/validation"

export function RoadmapProgressCard({ counts }: { counts: Record<PublicStatus, number> }) {
  const reduce = useReducedMotion() ?? false
  const { onMouseMove, spotlight } = useSpotlight(420)
  const reveal = useReveal(0)
  const roll = useRollOnHover(0.3)

  // Counted by the board, off the grouping it already did. No second pass over the same
  // array, and no second query for a number we are holding. `raw` is out of both the
  // numerator and the denominator: it is not a promise, so it is not progress either.
  const total = counts.todo + counts.doing + counts.done
  const pct = total === 0 ? 0 : counts.done / total

  return (
    <motion.div className="bento-card" onMouseMove={onMouseMove} {...reveal}>
      <Spotlight {...spotlight} />

      <CardHead label="progress" meta={`${Math.round(pct * 100)}% shipped`} />

      <div className="relative flex flex-wrap items-center gap-4">
        <span
          className="text-heading-lg flex items-baseline gap-1 font-mono leading-none"
          style={{ color: "var(--fg-primary)" }}
          {...roll.handlers}
        >
          <RollingNumber value={counts.done} cycle={roll.cycle} delay={roll.delay} height={30} />
          <span className="text-heading-md" style={{ color: "var(--fg-muted)" }}>
            /{total}
          </span>
        </span>

        {/* The trigger is on the track, not on the fill. A `scaleX: 0` element has no width,
            no width is no area, and an observer asked for a quarter of no area never fires —
            the bar would sit at zero forever. The track has an honest box, so it watches and
            the fill hears about it through a variant. */}
        <motion.div
          className="rm-progress min-w-[160px] flex-1"
          initial="hidden"
          whileInView="show"
          viewport={revealViewport}
        >
          {/* Scales, never resizes: width reflows layout, a transform does not. */}
          <motion.div
            className="rm-progress-fill"
            style={{ width: "100%", transformOrigin: "left" }}
            variants={{ hidden: { scaleX: 0 }, show: { scaleX: pct } }}
            transition={
              reduce ? { duration: 0 } : { type: "spring", stiffness: 110, damping: 20, mass: 0.9 }
            }
          />
        </motion.div>
      </div>

      {/* The stepper. Each stage carries its count; the live one pulses. */}
      <div className="relative flex flex-wrap items-center gap-x-3 gap-y-2">
        {PUBLIC_STATUSES.map((status, i) => {
          const state = status === "done" ? "done" : status === "doing" ? "live" : "idle"

          return (
            <div key={status} className="rm-step" data-state={state}>
              {/* Every stage shows its count, shipped included. A ✓ there was a different
                  kind of information in the same slot — two stages answering "how many"
                  and the third answering "is it done", which is not a scale. */}
              <span className="rm-step-mark" aria-hidden>
                {counts[status]}
              </span>
              <span
                className="text-mono-sm font-mono tracking-[0.08em] whitespace-nowrap uppercase"
                style={{ color: state === "idle" ? "var(--fg-muted)" : "var(--fg-secondary)" }}
              >
                {STATUS_LABEL[status]}
                <span className="sr-only">: {counts[status]} items</span>
              </span>
              {i < PUBLIC_STATUSES.length - 1 && <span className="rm-step-rule" aria-hidden />}
            </div>
          )
        })}
      </div>

      <CardFoot comment="what I'm building next">
        <span aria-hidden style={{ color: "var(--fg-brand)" }}>
          ◆
        </span>
      </CardFoot>
    </motion.div>
  )
}
