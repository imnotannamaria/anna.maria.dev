"use client"

import { motion, useReducedMotion, type Variants } from "motion/react"
import { EASE_OUT } from "@/components/ui/reveal"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import { Badge, CardHead } from "@/components/ui/card-parts"

/**
 * The same segmented bar the card has always had, given something to do.
 *
 * On arrival each segment draws out from its left edge in sequence, so the bar
 * fills rather than appearing. On hover the filled ones rise in a wave, which is
 * why the track is taller than the segments and aligned to the bottom — the
 * growth needs somewhere to go, and growing upward is what makes it read as a
 * chart instead of a loading bar.
 *
 * Past the goal the bar keeps going rather than capping. It used to draw exactly
 * `goal` segments, so the seventh project of a six-project year had nowhere to
 * land: the bar looked identical at 6/6 and at 7/6, and the only thing on the
 * card that knew was a badge reading "-1 to go". The extra segments carry
 * `--fg-brand-hover` and a double gap at the boundary, so where the goal was is
 * still legible in a bar that has passed it.
 */
function ProgressBar({ count, goal, reduce }: { count: number; goal: number; reduce: boolean }) {
  const track: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.06, delayChildren: reduce ? 0 : 0.15 } },
    hover: { transition: { staggerChildren: reduce ? 0 : 0.04 } },
  }

  const on: Variants = {
    hidden: { scaleX: 0, scaleY: 1 },
    show: { scaleX: 1, scaleY: 1, transition: { duration: reduce ? 0 : 0.45, ease: EASE_OUT } },
    hover: { scaleX: 1, scaleY: reduce ? 1 : 1.9, transition: { duration: 0.25, ease: EASE_OUT } },
  }
  // The empty segments hold still on hover; a wave running through the part
  // that hasn't happened yet would be claiming progress that doesn't exist.
  const off: Variants = {
    hidden: { scaleX: 0 },
    show: { scaleX: 1, transition: { duration: reduce ? 0 : 0.45, ease: EASE_OUT } },
    hover: { scaleX: 1 },
  }

  return (
    <motion.div
      className="relative mt-auto flex items-end gap-[3px]"
      style={{ height: 16 }}
      variants={track}
      aria-hidden
    >
      {Array.from({ length: Math.max(count, goal) }, (_, i) => {
        const past = i >= goal
        return (
          <motion.span
            key={i}
            variants={i < count ? on : off}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 2,
              originX: 0,
              originY: 1,
              background: past
                ? "var(--fg-brand-hover)"
                : i < count
                  ? "var(--fg-brand)"
                  : "var(--border-subtle)",
              // Double the 3px gap where the goal used to end, so the overshoot
              // reads as past a line rather than as a longer bar.
              marginLeft: i === goal ? 3 : undefined,
            }}
          />
        )
      })}
    </motion.div>
  )
}

export function OssCard({
  count,
  goal,
  yearShort,
}: {
  count: number
  goal: number
  yearShort: string
}) {
  const reduce = useReducedMotion() ?? false
  const { onMouseMove, spotlight } = useSpotlight(340)

  /**
   * The badge was `goal - count` printed raw, which is a countdown that runs off the
   * bottom: the seventh project of a six-project year rendered "-1 to go". A goal you
   * have passed is the good outcome, so it gets said as one. Every string here is at
   * most eight characters, the same as the "-1 to go" it replaces, which is what keeps
   * it inside `CardHead`'s nowrap meta half in a card that clips.
   */
  const over = count - goal
  const status = over > 0 ? `+${over} over` : over === 0 ? "goal met" : `${-over} to go`

  return (
    <motion.div
      className="bento-card"
      onMouseMove={onMouseMove}
      initial="hidden"
      // Same reason as the wristkit rings: this section sits below the fold, so
      // an entrance tied to mount plays to an empty room.
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
      whileHover="hover"
    >
      <Spotlight {...spotlight} />

      <CardHead
        label={`oss '${yearShort}`}
        as="h3"
        id="card-oss"
        meta={
          <Badge variant="success-soft">
            {/* Same pulse as the tree card's "live" dot — a count that is still
                moving should read as still moving. `live-pulse` is a CSS
                keyframe, so the global prefers-reduced-motion block already
                stops it without anything needed here.

                It stops once the goal is met, though: the pulse belongs to the
                countdown, where there is something outstanding. "goal met" is a
                result, and a dot still resolving beside it would suggest the
                number hasn't landed yet. The dot stays, so the badge still reads
                as live data. */}
            <span
              className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
              style={{
                background: "currentColor",
                animation: over >= 0 ? undefined : "live-pulse 2s ease-in-out infinite",
              }}
            />
            {status}
          </Badge>
        }
      />

      <div className="relative flex items-end gap-4">
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "var(--text-display-md)",
            lineHeight: 1,
            color: "var(--fg-primary)",
            letterSpacing: "-0.02em",
            fontWeight: 400,
          }}
        >
          <em style={{ fontStyle: "italic", color: "var(--fg-brand)" }}>{count}</em>
          <sub
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-mono-sm)",
              color: "var(--fg-muted)",
              fontWeight: 400,
              marginLeft: 4,
              letterSpacing: 0,
              verticalAlign: "baseline",
            }}
          >
            / {goal}
          </sub>
        </div>
        <span
          className="text-mono-sm mb-1 font-mono tracking-[0.06em]"
          style={{ color: "var(--fg-muted)" }}
        >
          shipped this year
        </span>
      </div>

      <ProgressBar count={count} goal={goal} reduce={reduce} />
    </motion.div>
  )
}
