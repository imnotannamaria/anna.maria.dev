"use client"

/**
 * The markdown-style outline panel — the editor's "outline" view, as page chrome.
 *
 * Sticky on ≥1100px, hidden below. An IntersectionObserver drives the scrollspy; clicking
 * scrolls the `<main>` container with a small top offset so headings don't sit flush under
 * the titlebar.
 *
 * This lived three times — `about-outline.tsx`, `contact-outline.tsx`, `piano-outline.tsx` —
 * and the diff between them was the doc comment, the function name, the string in the chip
 * and the footer. Nothing else. They were folded into one the moment they needed the same
 * entrance, because three copies of an animation is three chances for it to drift.
 *
 * Two dead differences were dropped in the fold: the heading's `mb-3`, which lost to the inline
 * `margin` sitting right beside it, and `flex flex-col gap-1` on the footer, which about was
 * missing and which changes nothing for two block divs.
 */

import { useEffect, useState } from "react"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { EASE_OUT, revealViewport } from "@/components/ui/reveal"

export type OutlineItem = {
  id: string
  label: string
  level: 1 | 2 | 3
  /** Right-aligned tally. /blog counts posts per year; the prose pages have nothing to count. */
  count?: number
}

const PREFIX: Record<1 | 2 | 3, string> = { 1: "#", 2: "##", 3: "###" }

/**
 * The rail's own box, shared with `OutlineSkeleton` below. Constants rather than two copies
 * of the class string: a `loading.tsx` that traces these by hand is a rail that drifts from
 * the real one the first time either is touched, and the drift shows up as the layout moving
 * the moment the data lands — which is the one thing the skeleton exists to prevent.
 */
const RAIL = "sticky top-0 hidden self-start px-4 py-12 min-[1100px]:block"
const RAIL_BORDER = { borderRight: "1px solid var(--border-subtle)" } as const
const RAIL_HEADING = "font-mono text-mono-xs font-medium tracking-[0.08em] uppercase"
const RAIL_HEADING_STYLE = { color: "var(--fg-muted)", margin: "0 0 12px" } as const
const FILE_CHIP =
  "mb-4 flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1.5 font-mono text-mono-sm"
const FILE_CHIP_STYLE = {
  background: "var(--bg-surface-brand)",
  color: "var(--fg-primary)",
} as const

export function PageOutline({
  items,
  file,
  footer,
}: {
  items: OutlineItem[]
  /** The name in the chip at the top: `about.md`, `contact.tsx`, `piano.tsx`. */
  file: string
  /** The two-or-three line block under the rule. The one part that is genuinely per page. */
  footer?: React.ReactNode
}) {
  const [active, setActive] = useState(items[0]?.id)
  const reduce = useReducedMotion() ?? false

  /**
   * The scrollspy. Two things it has to get right, and the old version got neither.
   *
   * **Deepest, then topmost.** Picking the topmost visible section outright means a nested id
   * can never win: its ancestor starts higher and is on screen whenever it is. That silently
   * killed five of /about's ten rows — `cesar`, `avanade`, `education`, `fiap` and
   * `descomplica` all live inside `<Section id="career">` — and /contact's `channels`, which
   * sits inside `#message`. Dropping every entry that contains another visible one leaves the
   * innermost sections in view, and the topmost of *those* is the one the reader is actually in.
   *
   * **The whole set, not the callback's batch.** An IntersectionObserver reports what
   * *changed*, so reducing over `entries` compares whichever sections happened to cross the
   * band in that tick. Visibility is kept in a map and the answer is computed from all of it.
   */
  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null)

    const onScreen = new Set<Element>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onScreen.add(entry.target)
          else onScreen.delete(entry.target)
        }

        const visible = sections.filter((s) => onScreen.has(s))
        if (visible.length === 0) return

        const innermost = visible.filter(
          (s) => !visible.some((other) => other !== s && s.contains(other)),
        )
        const topmost = innermost.reduce((a, b) =>
          a.getBoundingClientRect().top < b.getBoundingClientRect().top ? a : b,
        )
        setActive(topmost.id)
      },
      { rootMargin: "-12% 0px -70% 0px", threshold: 0 },
    )

    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [items])

  const jump = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    const main = document.querySelector("main")
    if (!el || !main) return
    const top =
      el.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop - 24
    main.scrollTo({ top, behavior: "smooth" })
    setActive(id)
  }

  /**
   * The panel arrives top to bottom, each piece dropping in from a little above — the chip,
   * then the rows in order, then the footer. `whileInView` with `once` like every other
   * entrance here, even though at ≥1100px this is on screen immediately: an element already
   * in view satisfies the observer on the first frame, and one trigger everywhere means
   * there's no "is this above the fold" judgement left to get wrong.
   *
   * The stagger lives on the container's entrance and nowhere else. On the row's own
   * transition it would be re-applied every time the scrollspy repaints one, and an
   * interrupted spring that sits out a delay before moving looks exactly like a freeze.
   */
  const panel: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.045 } },
  }

  const piece: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : -6 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.32, ease: EASE_OUT } },
  }

  return (
    <motion.nav
      aria-label="Page outline"
      className={RAIL}
      style={RAIL_BORDER}
      initial="hidden"
      whileInView="show"
      viewport={revealViewport}
      variants={panel}
    >
      <motion.h2 className={RAIL_HEADING} style={RAIL_HEADING_STYLE} variants={piece}>
        outline
      </motion.h2>

      <motion.div className={FILE_CHIP} style={FILE_CHIP_STYLE} variants={piece}>
        <span aria-hidden style={{ color: "var(--fg-brand)", fontSize: 9 }}>
          ◆
        </span>
        {file}
      </motion.div>

      <ul className="flex flex-col" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {items.map((item) => {
          const isActive = active === item.id
          return (
            /* `motion.li`, not a `Reveal` wrapper: a div between the ul and its li is not
               something a list is allowed to have. */
            <motion.li key={item.id} variants={piece}>
              <a
                href={`#${item.id}`}
                onClick={(e) => jump(e, item.id)}
                /* Which row is current was colour and nothing else, so it existed for
                   sighted readers only. `location` rather than `page`: every row points
                   inside the page already open, not at a different one. */
                aria-current={isActive ? "location" : undefined}
                className="text-mono-sm flex items-baseline gap-1.5 py-1 font-mono transition-colors"
                style={{
                  color: isActive ? "var(--fg-primary)" : "var(--fg-secondary)",
                  paddingLeft: item.level === 3 ? 12 : 0,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    color: isActive ? "var(--fg-brand)" : "var(--fg-muted)",
                    flexShrink: 0,
                  }}
                >
                  {PREFIX[item.level]}
                </span>
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.count != null && (
                  <span style={{ color: "var(--fg-muted)", flexShrink: 0 }}>{item.count}</span>
                )}
              </a>
            </motion.li>
          )
        })}
      </ul>

      {footer && (
        <motion.div
          className="text-mono-xs mt-8 flex flex-col gap-1 pt-3 font-mono leading-[1.7]"
          style={{ borderTop: "1px dashed var(--border-subtle)", color: "var(--fg-muted)" }}
          variants={piece}
        >
          {footer}
        </motion.div>
      )}
    </motion.nav>
  )
}

/**
 * The rail as it looks before the data arrives, for a `loading.tsx` beside a page that reads
 * Postgres.
 *
 * It lives in this file, not in the route it serves, so it takes the box, the heading and the
 * file chip from the same constants the real panel does. `app/log/loading.tsx` used to spell
 * all of that out again, which meant a change to the rail was two edits with nothing to fail
 * if only one of them happened.
 *
 * No rows to spy on and nothing to navigate, so it is `aria-hidden` and not a `<nav>` — the
 * page's real status message does the announcing.
 */
export function OutlineSkeleton({ file, rows = 3 }: { file: string; rows?: number }) {
  return (
    <div aria-hidden className={RAIL} style={RAIL_BORDER}>
      <div className={RAIL_HEADING} style={RAIL_HEADING_STYLE}>
        outline
      </div>

      <div className={FILE_CHIP} style={FILE_CHIP_STYLE}>
        <span style={{ color: "var(--fg-brand)", fontSize: 9 }}>◆</span>
        {file}
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: rows }, (_, i) => (
          <span key={i} className="h-3 w-24 rounded bg-(--bg-surface-elevated)" />
        ))}
      </div>
    </div>
  )
}
