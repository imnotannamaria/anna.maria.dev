"use client"

import { type Variants, motion, useReducedMotion } from "motion/react"
import * as React from "react"
import { Diamond } from "./diamond"
import { EASE_OUT, revealViewport } from "@/lib/motion"
import { cn } from "@/lib/utils"

export interface OutlineItem {
  /** The id of the section on the page. */
  id: string
  label: string
  level: 1 | 2 | 3
  /** A tally on the right, such as posts per year. */
  count?: number
}

const PREFIX: Record<1 | 2 | 3, string> = { 1: "#", 2: "##", 3: "###" }

export interface PageOutlineProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  items: readonly OutlineItem[]
  /** The name in the chip at the top: `about.md`. */
  file: string
  /** A few lines under the list. */
  footer?: React.ReactNode
  /**
   * The element that scrolls, when it is not the window, such as a `<main>`
   * with `overflow-y: auto` in an editor layout.
   */
  scrollContainer?: () => HTMLElement | null
  /** Space left above a heading after a jump, in px. */
  offset?: number
}

/**
 * The editor's outline view: a sticky list of the page's sections, shown from
 * 1100px up, that follows the scroll.
 *
 * The scrollspy keeps the visibility of every section, not just the ones that
 * changed in a callback, and picks the innermost visible section, then the
 * topmost of those. Picking the topmost outright would never light a nested
 * section, because its parent is always higher.
 */
const PageOutline = React.forwardRef<HTMLElement, PageOutlineProps>(
  ({ className, items, file, footer, scrollContainer, offset = 24, ...props }, ref) => {
    const [clicked, setClicked] = React.useState<string | undefined>(undefined)
    const reduce = useReducedMotion() ?? false

    // callers build `items` inline, so key the effect on the ids, not the array identity
    const key = items.map((i) => i.id).join("|")

    // derived, so a new set of items never points at an id that is gone
    const active = items.some((i) => i.id === clicked) ? clicked : items[0]?.id

    // biome-ignore lint/correctness/useExhaustiveDependencies: `key` stands in for `items`
    React.useEffect(() => {
      const sections = items
        .map((i) => document.getElementById(i.id))
        .filter((el): el is HTMLElement => el !== null)
      const onScreen = new Set<Element>()
      const atBottom = () => {
        const root = scrollContainer?.()
        if (root) return root.scrollTop + root.clientHeight >= root.scrollHeight - 2
        const doc = document.documentElement
        return (
          window.scrollY + window.innerHeight >= doc.scrollHeight - 2 &&
          doc.scrollHeight > window.innerHeight
        )
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) onScreen.add(entry.target)
            else onScreen.delete(entry.target)
          }
          const visible = sections.filter((s) => onScreen.has(s))
          if (visible.length === 0) return
          if (atBottom()) return
          const innermost = visible.filter(
            (s) => !visible.some((other) => other !== s && s.contains(other)),
          )
          const topmost = innermost.reduce((a, b) =>
            a.getBoundingClientRect().top <= b.getBoundingClientRect().top ? a : b,
          )
          setClicked(topmost.id)
        },
        { rootMargin: "-12% 0px -70% 0px", threshold: 0 },
      )

      // At the end of the page a short last section never reaches the band, so it could
      // never be current. Once the scroll bottoms out, the last section in view is.
      const root = scrollContainer?.() ?? window
      const onScroll = () => {
        if (!atBottom()) return
        const last = [...sections]
          .reverse()
          .find((s) => s.getBoundingClientRect().top < window.innerHeight)
        if (last) setClicked(last.id)
      }
      root.addEventListener("scroll", onScroll, { passive: true })

      for (const s of sections) observer.observe(s)
      return () => {
        observer.disconnect()
        root.removeEventListener("scroll", onScroll)
      }
    }, [key])

    const jump = (e: React.MouseEvent, id: string) => {
      e.preventDefault()
      const el = document.getElementById(id)
      if (!el) return
      const behavior: ScrollBehavior = reduce ? "auto" : "smooth"
      const container = scrollContainer?.()
      if (container) {
        const top =
          el.getBoundingClientRect().top -
          container.getBoundingClientRect().top +
          container.scrollTop -
          offset
        container.scrollTo({ top, behavior })
      } else {
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.scrollY - offset,
          behavior,
        })
      }
      setClicked(id)
      history.replaceState(null, "", `#${id}`)
    }

    // the stagger lives on the entrance only; on a row it would replay with every scrollspy update
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
        // a new set of rows remounts, so they get an entrance instead of staying hidden
        key={key}
        ref={ref}
        aria-label="Page outline"
        className={cn(
          "sticky top-0 hidden self-start px-4 py-12 min-[1100px]:block",
          "border-r border-[var(--border-subtle)]",
          className,
        )}
        initial="hidden"
        whileInView="show"
        viewport={revealViewport}
        variants={panel}
        {...(props as React.ComponentProps<typeof motion.nav>)}
      >
        <motion.h2
          variants={piece}
          className="text-mono-xs mt-0 mb-3 font-mono font-medium tracking-[0.08em] text-[var(--fg-muted)] uppercase"
        >
          outline
        </motion.h2>

        <motion.div
          variants={piece}
          className="text-mono-sm mb-4 flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--bg-surface-brand)] px-2 py-1.5 font-mono text-[var(--fg-primary)]"
        >
          <Diamond />
          {file}
        </motion.div>

        <ul className="m-0 flex list-none flex-col p-0">
          {items.map((item) => {
            const isActive = active === item.id
            return (
              <motion.li key={item.id} variants={piece}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => jump(e, item.id)}
                  aria-current={isActive ? "location" : undefined}
                  className={cn(
                    "text-mono-sm flex items-baseline gap-1.5 py-1 font-mono transition-colors",
                    item.level === 3 && "pl-3",
                    isActive
                      ? "text-[var(--fg-primary)]"
                      : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "shrink-0",
                      isActive ? "text-[var(--fg-brand)]" : "text-[var(--fg-muted)]",
                    )}
                  >
                    {PREFIX[item.level]}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.count != null && (
                    <span className="shrink-0 text-[var(--fg-muted)]">{item.count}</span>
                  )}
                </a>
              </motion.li>
            )
          })}
        </ul>

        {footer && (
          <motion.div
            variants={piece}
            className="text-mono-xs mt-8 flex flex-col gap-1 border-t border-dashed border-[var(--border-subtle)] pt-3 font-mono leading-[1.7] text-[var(--fg-muted)]"
          >
            {footer}
          </motion.div>
        )}
      </motion.nav>
    )
  },
)
PageOutline.displayName = "PageOutline"

export { PageOutline }
