"use client"

import { motion, useReducedMotion } from "motion/react"
import type * as React from "react"
import { EASE_OUT, STAGGER_LIMIT, revealViewport } from "@/lib/motion"

/**
 * The entrance every card shares: it rises 14px and fades in once it is on
 * screen. Spread it onto any motion element: `<motion.div {...useReveal(0.1)}>`.
 *
 * Always `whileInView`, never `animate`, even above the fold. Something already
 * in view plays on the first frame anyway, and one trigger everywhere leaves no
 * rule about the fold to get wrong.
 *
 * Motion hands these over as values, which do not propagate to children with
 * their own `variants`. A card that sequences its own contents needs variant
 * labels instead.
 */
function useReveal(delay = 0) {
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

interface RevealProps {
  children: React.ReactNode
  /** Position in a list. Staggers the entrance, capped at STAGGER_LIMIT. */
  index?: number
  /** Seconds before the entrance, on top of the stagger. */
  delay?: number
  /** Seconds between list items. */
  step?: number
  className?: string
  /** Merged with the opacity and transform Motion owns. */
  style?: React.CSSProperties
}

/**
 * The same entrance as a wrapper, for lists and for server components that
 * should not become client components just to animate their children.
 */
function Reveal({ children, index = 0, delay = 0, step = 0.06, className, style }: RevealProps) {
  const reveal = useReveal(delay + Math.min(index, STAGGER_LIMIT) * step)
  return (
    <motion.div className={className} style={style} {...reveal}>
      {children}
    </motion.div>
  )
}

export { Reveal, useReveal }
export type { RevealProps }
