"use client"

import { motion, useReducedMotion, type Variants } from "motion/react"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import { Badge, CardHead } from "@/components/ui/card-parts"

const EASE_OUT = [0.2, 0.8, 0.2, 1] as const

/**
 * The same segmented bar the card has always had, given something to do.
 *
 * On arrival each segment draws out from its left edge in sequence, so the bar
 * fills rather than appearing. On hover the filled ones rise in a wave, which is
 * why the track is taller than the segments and aligned to the bottom — the
 * growth needs somewhere to go, and growing upward is what makes it read as a
 * chart instead of a loading bar.
 */
function ProgressBar({
  filled,
  total,
  reduce,
}: {
  filled: number
  total: number
  reduce: boolean
}) {
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
      {Array.from({ length: total }, (_, i) => (
        <motion.span
          key={i}
          variants={i < filled ? on : off}
          style={{
            flex: 1,
            height: 6,
            borderRadius: 2,
            originX: 0,
            originY: 1,
            background: i < filled ? "var(--fg-brand)" : "var(--border-subtle)",
          }}
        />
      ))}
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
                stops it without anything needed here. */}
            <span
              className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
              style={{
                background: "currentColor",
                animation: "live-pulse 2s ease-in-out infinite",
              }}
            />
            {goal - count} to go
          </Badge>
        }
      />

      <div className="relative flex items-end gap-4">
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 48,
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
              fontSize: 12,
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
          className="mb-1 font-mono text-[11px] tracking-[0.06em]"
          style={{ color: "var(--fg-muted)" }}
        >
          shipped this year
        </span>
      </div>

      <ProgressBar filled={count} total={goal} reduce={reduce} />
    </motion.div>
  )
}
