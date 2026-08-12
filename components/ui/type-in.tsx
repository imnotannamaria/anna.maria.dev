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
/** Serif italic in the brand colour — the same treatment the pages give `<Em>`. */
const EMPHASIS: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontStyle: "italic",
  color: "var(--fg-brand)",
}

export function TypeIn({
  text,
  emphasis,
  by = "char",
  delay = 0,
  speed,
  className,
  style,
  as: Tag = "span",
}: {
  text: string
  /**
   * A substring of `text` to render as `<Em>` does. It exists because the alternative was
   * taking JSX instead of a string, and `text` is what the `aria-label` is made of — the
   * moment children are arbitrary nodes, the one-sentence label has to be reconstructed by
   * walking them, and a heading is the worst place to get that wrong. Only the first
   * occurrence is matched; anything else is a sentence that wants two calls, not one prop.
   */
  emphasis?: string
  by?: "char" | "word"
  delay?: number
  speed?: number
  className?: string
  style?: React.CSSProperties
  as?: "span" | "h1" | "h2" | "h3" | "p"
}) {
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

  // Split on the separator but keep it, so spaces survive as their own piece.
  const split = (value: string) => (by === "char" ? Array.from(value) : value.split(/(\s+)/))

  return (
    <Tag className={className} style={style}>
      {/* An `sr-only` copy rather than `aria-label` on the Tag.
          `aria-label` is only honoured on elements that have a role, and the default Tag
          here is `span` — a generic with none — so on /, /about and /roadmap the label was
          silently dropped and the pieces stayed `aria-hidden`: a heading a screen reader
          could not read at all. It worked for `as="h1"` and not for `as="span"`, which is
          exactly the kind of difference that hides. This shape has no such split. */}
      <span className="sr-only">{text}</span>
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
        {segments.map((segment, s) =>
          split(segment.text).map((piece, i) => (
            <motion.span
              key={`${s}-${i}`}
              variants={{
                hidden: { opacity: 0, y: reduce ? 0 : "0.25em" },
                show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.28 } },
              }}
              style={{
                display: "inline-block",
                // A run of whitespace collapses to nothing once it's inline-block,
                // which would weld the words together.
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
