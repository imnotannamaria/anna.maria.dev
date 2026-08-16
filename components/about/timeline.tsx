"use client"

/**
 * The career and education timeline, with the entrance it never had.
 *
 * Everything here is one variant tree per entry, not six independent `whileInView`s, and
 * that is the whole point: the connecting guide animates `scaleY` from 0, and an element
 * with no height has no area, so an observer aimed at it never fires. The trigger sits on
 * the entry — which has an honest box — and the guide is reached through variants. Same
 * mistake the rings and the oss bar made once; the rule is in CLAUDE.md.
 *
 * The order is deliberate: the diamond lands, the guide draws down from it, then the text
 * rises. It reads as the line being drawn between two jobs rather than six things fading in
 * together.
 */

import { motion, useReducedMotion, type Variants } from "motion/react"
import { EASE_OUT, revealViewport, STAGGER_LIMIT } from "@/components/ui/reveal"

export type TimelineEntry = {
  id: string
  org: string
  role: string
  from: string
  to: string
  present?: boolean
  body: React.ReactNode
  /**
   * Already-rendered badges, not tag strings. `TechBadge` reads `TECH_ICONS`, and this file
   * is `"use client"` — importing it here dragged all 41 icon paths (54 KB) into the eager
   * client chunk for /about, to render the seven this timeline actually uses. Elements cross
   * the server/client boundary; the lookup stays on the server.
   */
  tags?: React.ReactNode
}

function buildVariants(reduce: boolean, index: number) {
  const entry: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.07,
        // On the entrance and nowhere else. Left on a transition something re-triggers,
        // every later change sits out the delay before moving — which looks like a freeze.
        delayChildren: reduce ? 0 : Math.min(index, STAGGER_LIMIT) * 0.1,
      },
    },
  }

  const mark: Variants = {
    hidden: { opacity: 0, scale: reduce ? 1 : 0.3 },
    show: { opacity: 1, scale: 1, transition: { duration: reduce ? 0 : 0.35, ease: EASE_OUT } },
  }

  const guide: Variants = {
    hidden: { scaleY: reduce ? 1 : 0 },
    show: { scaleY: 1, transition: { duration: reduce ? 0 : 0.55, ease: EASE_OUT } },
  }

  const rise: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 10 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.45, ease: EASE_OUT } },
  }

  return { entry, mark, guide, rise }
}

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const reduce = useReducedMotion() ?? false

  return (
    <div className="flex flex-col">
      {entries.map((item, i) => {
        const v = buildVariants(reduce, i)
        return (
          <motion.div
            key={item.id}
            id={item.id}
            className="group relative pb-6 pl-6 last:pb-0"
            style={{ scrollMarginTop: 24 }}
            initial="hidden"
            whileInView="show"
            viewport={revealViewport}
            variants={v.entry}
          >
            {/* Diamond marker. Grows a touch when the entry is hovered — CSS, because the
              transform channel here already belongs to the entrance variant. */}
            <motion.span
              aria-hidden
              className="absolute top-0.5 left-0 origin-center transition-[color,filter] duration-200 group-hover:brightness-125"
              style={{ color: "var(--fg-brand)", fontSize: 12, lineHeight: 1 }}
              variants={v.mark}
            >
              ◆
            </motion.span>

            {i < entries.length - 1 && (
              <motion.span
                aria-hidden
                className="absolute"
                style={{
                  left: 5,
                  top: 22,
                  bottom: 0,
                  width: 1,
                  background: "var(--border-subtle)",
                  originY: 0,
                }}
                variants={v.guide}
              />
            )}

            <motion.div
              className="mb-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5"
              variants={v.rise}
            >
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 22,
                  lineHeight: 1.2,
                  color: "var(--fg-primary)",
                }}
              >
                {item.org}
              </span>
              <span className="text-mono-md font-mono" style={{ color: "var(--fg-secondary)" }}>
                <span aria-hidden style={{ opacity: 0.5, marginRight: 6 }}>
                  ·
                </span>
                {item.role}
              </span>
            </motion.div>

            <motion.div
              className="text-mono-sm mb-3 font-mono tracking-[0.04em]"
              style={{ color: "var(--fg-muted)" }}
              variants={v.rise}
            >
              <span style={{ color: item.present ? "var(--status-success-fg)" : undefined }}>
                {item.from}
              </span>
              <span style={{ opacity: 0.5, margin: "0 4px" }}>&rarr;</span>
              <span style={{ color: item.present ? "var(--status-success-fg)" : undefined }}>
                {item.to}
              </span>
            </motion.div>

            <motion.p
              className="m-0 text-sm leading-relaxed"
              style={{ fontFamily: "var(--font-sans)", color: "var(--fg-secondary)" }}
              variants={v.rise}
            >
              {item.body}
            </motion.p>

            {item.tags && (
              <motion.div className="mt-3 flex flex-wrap gap-1.5" variants={v.rise}>
                {item.tags}
              </motion.div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
