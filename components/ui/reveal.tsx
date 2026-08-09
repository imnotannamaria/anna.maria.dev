"use client"

import { motion, useReducedMotion } from "motion/react"

/** The project's --ease-out token, as a Motion cubic-bezier array. */
export const EASE_OUT = [0.2, 0.8, 0.2, 1] as const

/** One rule for the whole page, so nothing has to remember which it is. */
export const revealViewport = { once: true, amount: 0.25 } as const

/**
 * Past this many items a per-item stagger stops reading as flow and starts as
 * lag. Everything after it arrives together.
 *
 * Lists here are short today — four posts, four projects — so an uncapped
 * `index * step` is invisible. At twenty posts the last row waits a full second
 * after being scrolled to, which is a bug that arrives with the content rather
 * than with the code.
 */
export const STAGGER_LIMIT = 6

/**
 * The entrance every card shares: rises and fades once it's on screen.
 *
 * `whileInView` rather than `animate`, even for the cards sitting above the
 * fold. Something already in view satisfies the observer on the first frame, so
 * those play immediately anyway — and using one trigger everywhere means there
 * is no rule about which cards are "above the fold" to get wrong later, which is
 * exactly how the rings and the oss bar ended up animating to an empty room.
 *
 * Spread onto any motion element: `<motion.div {...useReveal(0.1)}>`.
 *
 * For a leaf, or a card that enters as one piece. What it hands Motion are
 * value objects, and values don't propagate — a child with `variants` of its
 * own never hears about them, so `staggerChildren` bolted onto this transition
 * orchestrates nothing. A card that has to sequence its own contents spells the
 * entrance as variant labels instead; see `ProfileCard` or `TreeCard`.
 */
export function useReveal(delay = 0) {
  const reduce = useReducedMotion() ?? false

  return {
    initial: { opacity: 0, y: reduce ? 0 : 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: revealViewport,
    transition: {
      duration: reduce ? 0 : 0.5,
      ease: EASE_OUT,
      delay: reduce ? 0 : delay,
    },
  } as const
}

/**
 * The same entrance as a wrapper, for lists and for server components that
 * shouldn't become client components just to animate their children.
 *
 * `index` staggers a list without the parent needing to orchestrate anything.
 */
export function Reveal({
  children,
  index = 0,
  delay = 0,
  step = 0.06,
  className,
}: {
  children: React.ReactNode
  index?: number
  delay?: number
  step?: number
  className?: string
}) {
  const reveal = useReveal(delay + Math.min(index, STAGGER_LIMIT) * step)
  return (
    <motion.div className={className} {...reveal}>
      {children}
    </motion.div>
  )
}
