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

export type OutlineItem = { id: string; label: string; level: 1 | 2 | 3 }

const PREFIX: Record<1 | 2 | 3, string> = { 1: "#", 2: "##", 3: "###" }

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

  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length === 0) return
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
        )
        setActive(topmost.target.id)
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
      className="sticky top-0 hidden self-start px-4 py-12 min-[1100px]:block"
      style={{ borderRight: "1px solid var(--border-subtle)" }}
      initial="hidden"
      whileInView="show"
      viewport={revealViewport}
      variants={panel}
    >
      <motion.h2
        className="font-mono text-[10px] font-medium tracking-[0.08em] uppercase"
        style={{ color: "var(--fg-muted)", margin: "0 0 12px" }}
        variants={piece}
      >
        outline
      </motion.h2>

      <motion.div
        className="mb-4 flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1.5 font-mono text-xs"
        style={{ background: "var(--bg-surface-brand)", color: "var(--fg-primary)" }}
        variants={piece}
      >
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
                className="flex items-baseline gap-1.5 py-1 font-mono text-xs transition-colors"
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
                {item.label}
              </a>
            </motion.li>
          )
        })}
      </ul>

      {footer && (
        <motion.div
          className="mt-8 flex flex-col gap-1 pt-3 font-mono text-[10px] leading-[1.7]"
          style={{ borderTop: "1px dashed var(--border-subtle)", color: "var(--fg-muted)" }}
          variants={piece}
        >
          {footer}
        </motion.div>
      )}
    </motion.nav>
  )
}
