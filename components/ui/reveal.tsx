"use client"

import { useReducedMotion } from "motion/react"

const EASE_OUT = [0.2, 0.8, 0.2, 1] as const

/** One rule for the whole page, so nothing has to remember which it is. */
export const revealViewport = { once: true, amount: 0.25 } as const

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
