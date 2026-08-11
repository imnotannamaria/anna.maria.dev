"use client"

import { motion, useReducedMotion } from "motion/react"
import { EASE_OUT, revealViewport } from "@/components/ui/reveal"
import type { PublicStatus } from "@/lib/roadmap/validation"

/**
 * The checkbox on a roadmap card — state, not a control.
 *
 * It looks like a checkbox because a checklist is what a roadmap is, but nobody visiting
 * the site can move an item, so this is deliberately not a `<button role="checkbox">`. An
 * affordance that does nothing when clicked is worse than a glyph: no cursor change, no
 * hover, no focus ring, nothing to press. Status changes live in /admin.
 *
 * Decoration for the eye only: the card's own head already says the status in words, and a
 * second copy here made a screen reader announce "shipped" twice per card.
 *
 * The check is drawn rather than faded in — `pathLength` 0→1 on the card's entrance. That
 * is an entrance like any other, so it is `whileInView` with `once`, and it asks
 * `useReducedMotion` because the global CSS reset does not reach Motion.
 */
export function RoadmapMark({ status, size = 20 }: { status: PublicStatus; size?: number }) {
  const reduce = useReducedMotion() ?? false
  const done = status === "done"

  return (
    // The observer sits on this span, not on the path inside the svg. An
    // IntersectionObserver aimed at an SVG child is unreliable — the rings on the home page
    // proved it, one of three firing — so the HTML ancestor watches and the path hears
    // about it through a variant.
    <motion.span
      className="rm-mark"
      data-status={status}
      style={{ width: size, height: size }}
      aria-hidden
      initial="hidden"
      whileInView="show"
      viewport={revealViewport}
    >
      {done && <span className="rm-mark-fill" />}

      <svg viewBox="0 0 20 20" width={size} height={size} className="rm-mark-svg">
        {status === "doing" ? (
          // In progress: a dash that breathes, so the live column reads as live without a
          // second colour or a second glyph.
          <motion.line
            x1="6"
            y1="10"
            x2="14"
            y2="10"
            stroke="var(--fg-brand)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={false}
            animate={reduce ? undefined : { opacity: [0.45, 1, 0.45] }}
            transition={reduce ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : done ? (
          <motion.path
            d="M5.5 10.5 L8.6 13.6 L14.6 6.6"
            fill="none"
            stroke="var(--fg-on-brand)"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={{ hidden: { pathLength: reduce ? 1 : 0 }, show: { pathLength: 1 } }}
            transition={{ duration: reduce ? 0 : 0.34, ease: EASE_OUT, delay: reduce ? 0 : 0.12 }}
          />
        ) : null}
      </svg>
    </motion.span>
  )
}
