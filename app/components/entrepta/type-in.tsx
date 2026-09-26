"use client"

import { motion, useReducedMotion } from "motion/react"
import type * as React from "react"
import { revealViewport } from "@/lib/motion"

interface TypeInProps {
  text: string
  /**
   * A substring of `text` set in serif italic in the brand ink. A string and not
   * JSX, so the sentence a screen reader hears stays exactly `text`. Only the
   * first occurrence is matched.
   */
  emphasis?: string
  /** `char` for a short title. `word` for anything that wraps. */
  by?: "char" | "word"
  /** Seconds before the first piece. */
  delay?: number
  /** Seconds between pieces. Defaults to 0.03 per char, 0.05 per word. */
  speed?: number
  className?: string
  style?: React.CSSProperties
  as?: "span" | "h1" | "h2" | "h3" | "p"
}

const EMPHASIS: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontStyle: "italic",
  color: "var(--fg-brand-text)",
}

/**
 * Text that assembles itself a piece at a time when it comes on screen.
 *
 * Every piece is in the DOM from the first render; this only fades them in. A
 * typewriter that grows `text.slice(0, n)` ships an empty heading to crawlers
 * and to anyone whose JS has not run.
 *
 * The pieces are `aria-hidden` and an `sr-only` copy carries the sentence.
 * Not `aria-label`: a `span` has no role, so the label would be ignored.
 *
 * Characters become inline blocks, which cannot break a line the way text
 * does, so use `by="word"` for anything long enough to wrap.
 */
function TypeIn({
  text,
  emphasis,
  by = "char",
  delay = 0,
  speed,
  className,
  style,
  as: Tag = "span",
}: TypeInProps) {
  const reduce = useReducedMotion() ?? false
  const step = speed ?? (by === "char" ? 0.03 : 0.05)

  const at = emphasis ? text.indexOf(emphasis) : -1
  const segments =
    emphasis && at >= 0
      ? [
          { text: text.slice(0, at), em: false },
          { text: emphasis, em: true },
          { text: text.slice(at + emphasis.length), em: false },
        ].filter((s) => s.text.length > 0)
      : [{ text, em: false }]

  // split on the separator but keep it, so spaces survive as pieces of their own
  const split = (value: string) => (by === "char" ? Array.from(value) : value.split(/(\s+)/))

  return (
    <Tag className={className} style={style}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        data-type-in
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
        {segments.map((segment, s) =>
          split(segment.text).map((piece, i) => (
            <motion.span
              // biome-ignore lint/suspicious/noArrayIndexKey: pieces never reorder
              key={`${s}-${i}`}
              variants={{
                hidden: { opacity: 0, y: reduce ? 0 : "0.25em" },
                show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.28 } },
              }}
              style={{
                display: "inline-block",
                // an inline-block run of spaces collapses to nothing and welds words together
                whiteSpace: "pre",
                ...(segment.em ? EMPHASIS : null),
              }}
            >
              {piece}
            </motion.span>
          )),
        )}
      </motion.span>
    </Tag>
  )
}

export { TypeIn }
export type { TypeInProps }
