"use client"

/**
 * The progress card.
 *
 * A Card like the rest: head, body, foot. The body is entrepta's `Stepper` — the three
 * columns as stages, with the one being worked on marked as current.
 */

import { Diamond } from "@/app/components/entrepta/diamond"
import { motion, useReducedMotion } from "motion/react"
import {
  CardComment,
  CardFooter,
  CardHeader,
  CardLabel,
  CardMeta,
} from "@/app/components/entrepta/card"
import { Reveal } from "@/app/components/entrepta/reveal"
import { revealViewport } from "@/lib/motion"
import { RollingNumber, useRollOnHover } from "@/app/components/entrepta/rolling-number"
import { SpotlightCard } from "@/app/components/entrepta/spotlight-card"
import { Stepper, type StepperProps } from "@/app/components/entrepta/stepper"
import { PUBLIC_STATUSES, STATUS_LABEL, type PublicStatus } from "@/lib/roadmap/constants"

export function RoadmapProgressCard({ counts }: { counts: Record<PublicStatus, number> }) {
  const reduce = useReducedMotion() ?? false
  const roll = useRollOnHover(0.3)

  // Counted by the board, off the grouping it already did. No second pass over the same
  // array, and no second query for a number we are holding. `raw` is out of both the
  // numerator and the denominator: it is not a promise, so it is not progress either.
  const total = counts.todo + counts.doing + counts.done
  const pct = total === 0 ? 0 : counts.done / total

  /**
   * The stages, each carrying its count as the line under its label.
   *
   * The stepper this replaced was drawn here, and put the count *inside* the mark. entrepta's
   * marks say state instead — a number for a stage not reached, the ◆ for the live one, a ✓
   * for the one that is done — so the count moved to the description, where "how many" and
   * "which stage" stop sharing a slot.
   *
   * `completed` is spelled out because a Stepper assumes a flow: by default everything before
   * the current step is done. Here the order is the board's, and what is done is the last
   * column, not the first.
   */
  const stepper: Pick<StepperProps, "steps" | "current" | "completed"> = {
    steps: PUBLIC_STATUSES.map((status) => ({
      id: status,
      label: STATUS_LABEL[status],
      description: `${counts[status]} ${counts[status] === 1 ? "item" : "items"}`,
    })),
    current: "doing",
    completed: ["done"],
  }

  return (
    <Reveal>
      <SpotlightCard glow={420}>
        <CardHeader>
          <CardLabel>progress</CardLabel>
          <CardMeta>{`${Math.round(pct * 100)}% shipped`}</CardMeta>
        </CardHeader>

        <div className="flex flex-wrap items-center gap-4">
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
                reduce
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 110, damping: 20, mass: 0.9 }
              }
            />
          </motion.div>
        </div>

        {/* Two renders of one stepper, and only one is ever displayed. A horizontal Stepper
            keeps just the current label below 640px, which on a phone would hide two of the
            three counts; the vertical one keeps every label. `hidden` takes the other out of
            the accessibility tree too, so a screen reader meets a single list. */}
        <Stepper {...stepper} className="max-sm:hidden" />
        <Stepper {...stepper} orientation="vertical" className="sm:hidden" />

        <CardFooter>
          <CardComment>{"what I'm building next"}</CardComment>
          <Diamond size={10} />
        </CardFooter>
      </SpotlightCard>
    </Reveal>
  )
}
