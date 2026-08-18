"use client"

/**
 * One octave's worth of key mapping.
 *
 * The four groups used to share a single hand-written box — `rounded-[var(--radius-lg)]
 * border p-6`, painted `--bg-surface`, which by convention is the token for what sits *above*
 * a card (dropdowns, dialogs, code blocks), not for a card itself. Four `.bento-card` instead,
 * with the head naming the octave and the foot saying which physical row it is.
 *
 * The instrument above it stays exactly as it is. The wooden cabinet is skeuomorphic on
 * purpose and is the best thing on the page; wrapping it in a card would be a frame inside a
 * frame.
 */

import { motion } from "motion/react"
import { CardFoot, CardHead } from "@/components/ui/card-parts"
import { useReveal } from "@/components/ui/reveal"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"

export type KeyLine = { kbd: string; note: string; hint?: string }

export function KeymapCard({
  title,
  lines,
  foot,
  index = 0,
}: {
  title: string
  lines: KeyLine[]
  foot: string
  index?: number
}) {
  const { onMouseMove, spotlight } = useSpotlight(260)
  const reveal = useReveal(Math.min(index, 6) * 0.06)

  return (
    <motion.div className="bento-card" onMouseMove={onMouseMove} {...reveal}>
      <Spotlight {...spotlight} />
      <CardHead label={title} meta={`${lines.length} keys`} />

      <div className="relative flex flex-col">
        {lines.map((line, i) => (
          <div
            key={line.kbd}
            className="grid grid-cols-[40px_1fr] items-baseline gap-3 py-1"
            style={{ borderTop: i === 0 ? "none" : "1px dashed var(--border-subtle)" }}
          >
            <span
              className="text-mono-sm rounded-[3px] border px-1.5 py-0.5 text-center font-mono uppercase"
              style={{
                color: "var(--fg-primary)",
                background: "var(--bg-canvas)",
                borderColor: "var(--border-strong)",
              }}
            >
              {line.kbd}
            </span>
            <span className="text-mono-sm font-mono" style={{ color: "var(--fg-secondary)" }}>
              <em
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  color: "var(--fg-brand)",
                }}
              >
                {line.note}
              </em>
              {line.hint ? ` · ${line.hint}` : ""}
            </span>
          </div>
        ))}
      </div>

      <CardFoot comment={foot} />
    </motion.div>
  )
}
