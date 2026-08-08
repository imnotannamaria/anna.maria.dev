"use client"

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react"
import type { MotionValue } from "motion/react"

/**
 * A glow that trails the cursor across a card.
 *
 * The spring is the point: without it the gradient is welded to the pointer and
 * reads as a cheap cursor effect, and with it the light arrives a beat late and
 * reads as light. Colour comes from `--bg-spotlight`, which is mixed from
 * `--fg-brand` at a different strength per mode — a wash that shows up on
 * `#18181b` disappears on `#ffffff`.
 *
 * The card that uses this needs `position: relative` and `overflow: hidden`.
 */
export function useSpotlight(radius = 420) {
  const reduce = useReducedMotion() ?? false

  const mx = useMotionValue(50)
  const my = useMotionValue(30)
  const sx = useSpring(mx, { stiffness: 60, damping: 20 })
  const sy = useSpring(my, { stiffness: 60, damping: 20 })

  const background = useMotionTemplate`radial-gradient(${radius}px circle at ${sx}% ${sy}%, var(--bg-spotlight), transparent 65%)`

  function onMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width) * 100)
    my.set(((e.clientY - r.top) / r.height) * 100)
  }

  return { onMouseMove, background }
}

/** Sits first inside the card, under everything else. */
export function Spotlight({ background }: { background: MotionValue<string> }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ background }}
    />
  )
}
