"use client"

import { motion, useReducedMotion, type Variants } from "motion/react"
import { EASE_OUT } from "@/lib/motion"
import { Spotlight, useSpotlight } from "@/app/components/entrepta/spotlight"
import { cardVariants, CardHeader, CardLabel, CardMeta } from "@/app/components/entrepta/card"
import { Badge } from "@/app/components/entrepta/badge"

/** The gap between segments, and — doubled — the width of the goal boundary. */
const SEGMENT_GAP = 3

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
 * card that knew was a badge reading "-1 to go". The extra segments sit past a
 * doubled gap, in the brand mixed halfway into the card, so where the goal was
 * is still legible in a bar that has gone beyond it.
 *
 * That colour is derived rather than borrowed, and the first attempt is why.
 * `--fg-brand-hover` looked like the obvious dimmer sibling and is not one: it
 * is defined as the LIGHTER shade (globals.css), which holds in dark mode and
 * inverts in light, and entrepta light is the one pair of twelve where it lands
 * darker than `--fg-brand` instead of lighter. So the overshoot changed meaning
 * with the mode on the default theme. It was also invisible — ΔE76 between the
 * two tokens is under 10 in eight of the twelve theme × mode pairs, on 6px bars,
 * which put the bar back to not showing the overshoot at all.
 *
 * Mixing into `--bg-card` recedes toward whatever the card is, so it reads the
 * same way in both modes, and it is the `color-mix()` derivation the conventions
 * ask for. 55% is roughly equidistant from both neighbours — worst-case ΔE 30.8
 * from a filled segment and 33.3 from an empty one — so it reads as its own
 * third thing rather than drifting into either.
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
      className="relative mt-auto flex items-end"
      style={{ height: 16, gap: SEGMENT_GAP }}
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
              // `past` already implies the segment is filled — those indices only
              // exist when count ran beyond goal — so it is the first branch.
              background: past
                ? "color-mix(in srgb, var(--fg-brand) 55%, var(--bg-card))"
                : i < count
                  ? "var(--fg-brand)"
                  : "var(--border-subtle)",
              // Double the gap where the goal used to end, so the overshoot reads
              // as past a line rather than as a longer bar.
              marginLeft: i === goal ? SEGMENT_GAP : undefined,
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
   * it inside `CardHeader`'s nowrap meta half in a card that clips.
   */
  const over = count - goal
  const status = over > 0 ? `+${over} over` : over === 0 ? "goal met" : `${-over} to go`

  return (
    <motion.div
      className={cardVariants()}
      onMouseMove={onMouseMove}
      initial="hidden"
      // Same reason as the wristkit rings: this section sits below the fold, so
      // an entrance tied to mount plays to an empty room.
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
      whileHover="hover"
    >
      <Spotlight {...spotlight} />

      <CardHeader>
        <CardLabel as="h3" id="card-oss">{`oss '${yearShort}`}</CardLabel>
        <CardMeta>
          {
            <Badge color="success">
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
        </CardMeta>
      </CardHeader>

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
