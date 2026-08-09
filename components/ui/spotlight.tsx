"use client"

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react"
import type { MotionValue } from "motion/react"

export type SpotlightLayer = {
  x: MotionValue<number>
  y: MotionValue<number>
  size: number
}

/**
 * A glow that trails the cursor across a card.
 *
 * The spring is the point: without it the gradient is welded to the pointer and
 * reads as a cheap cursor effect, and with it the light arrives a beat late and
 * reads as light. Colour comes from `--bg-spotlight`, which is mixed from
 * `--fg-brand` at a different strength per mode — a wash that shows up on
 * `#18181b` disappears on `#ffffff`.
 *
 * It moves by transform, not by rewriting the gradient. The first version built
 * a new `radial-gradient(... at X% Y% ...)` string every frame, which repaints a
 * card-sized area 60 times a second and is enough to starve other animations on
 * the same page — the odometer on the profile card would visibly stall while the
 * pointer was moving. Translating a fixed gradient stays on the compositor.
 *
 * `size` is the diameter of the glow. The host card needs `position: relative`
 * and `overflow: hidden`.
 */
export function useSpotlight(size = 560) {
  const reduce = useReducedMotion() ?? false

  // Offsets from the resting position, not absolute coordinates, so 0,0 is the
  // spot the glow sits at before the pointer ever arrives.
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 60, damping: 20 })
  const sy = useSpring(y, { stiffness: 60, damping: 20 })

  function onMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    x.set(e.clientX - r.left - r.width * 0.5)
    y.set(e.clientY - r.top - r.height * 0.3)
  }

  return { onMouseMove, spotlight: { x: sx, y: sy, size } }
}

/** Sits first inside the card, under everything else. */
export function Spotlight({ x, y, size }: SpotlightLayer) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        left: "50%",
        top: "30%",
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        x,
        y,
        background: "radial-gradient(circle closest-side, var(--bg-spotlight), transparent)",
      }}
    />
  )
}
