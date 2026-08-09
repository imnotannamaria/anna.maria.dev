"use client"

import { motion, useReducedMotion } from "motion/react"
import { revealViewport } from "./reveal"

/**
 * Text that assembles itself, a piece at a time, when it comes on screen.
 *
 * Every piece is in the DOM from the first render — this fades them in, it does
 * not slice the string in state. A typewriter that grows `text.slice(0, n)`
 * ships an empty heading to the crawler and to anyone whose JS hasn't run, and
 * headings are the one thing on a page that can least afford that.
 *
 * The pieces are `aria-hidden` and the whole thing carries an `aria-label`, so a
 * screen reader gets one sentence instead of a stream of letters.
 *
 * `by="char"` suits a short title. `by="word"` is for anything that wraps —
 * inline-block characters can't break a line the way real text does, so a long
 * sentence split by character wraps in the wrong places.
 */
export function TypeIn({
  text,
  by = "char",
  delay = 0,
  speed,
  className,
  style,
  as: Tag = "span",
}: {
  text: string
  by?: "char" | "word"
  delay?: number
  speed?: number
  className?: string
  style?: React.CSSProperties
  as?: "span" | "h1" | "h2" | "h3" | "p"
}) {
  const reduce = useReducedMotion() ?? false
  const step = speed ?? (by === "char" ? 0.03 : 0.05)

  // Split on the separator but keep it, so spaces survive as their own piece.
  const pieces = by === "char" ? Array.from(text) : text.split(/(\s+)/)

  return (
    <Tag className={className} style={style} aria-label={text}>
      <motion.span
        aria-hidden
        initial="hidden"
        whileInView="show"
        viewport={revealViewport}
        variants={{
          hidden: {},
          show: {
            transition: { staggerChildren: reduce ? 0 : step, delayChildren: reduce ? 0 : delay },
          },
        }}
      >
        {pieces.map((piece, i) => (
          <motion.span
            key={i}
            variants={{
              hidden: { opacity: 0, y: reduce ? 0 : "0.25em" },
              show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.28 } },
            }}
            style={{
              display: "inline-block",
              // A run of whitespace collapses to nothing once it's inline-block,
              // which would weld the words together.
              whiteSpace: "pre",
            }}
          >
            {piece}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  )
}
