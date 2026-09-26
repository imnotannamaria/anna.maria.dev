"use client"

import { type MotionValue, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react"
import type * as React from "react"

interface SpotlightLayerProps {
  x: MotionValue<number>
  y: MotionValue<number>
  /** Diameter of the glow in px. */
  size: number
}

/**
 * A glow that trails the cursor across a card.
 *
 * The spring is the point: without it the glow is welded to the pointer and
 * reads as a cursor effect; with it the light arrives a beat late and reads as
 * light. The color is `--bg-spotlight`, mixed from the brand per mode.
 *
 * It moves a fixed gradient by transform. Rebuilding the gradient string every
 * frame repaints the whole card 60 times a second, which starves any other
 * animation on the page.
 *
 * The host needs `position: relative` and `overflow: hidden`. With reduced
 * motion the glow stays at its resting spot.
 */
function useSpotlight(size = 560) {
  const reduce = useReducedMotion() ?? false

  // offsets from the resting spot, so 0,0 is where the glow sits before the pointer arrives
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

/** The glow layer. Put it first inside the card, under everything else. */
function Spotlight({ x, y, size }: SpotlightLayerProps) {
  return (
    <motion.div
      aria-hidden
      data-spotlight
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

export { Spotlight, useSpotlight }
export type { SpotlightLayerProps }
