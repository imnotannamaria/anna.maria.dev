"use client"

/**
 * The editor tab row, as one component.
 *
 * It was the titlebar's alone, and then `/components` grew a second strip that traced the same
 * idea badly — muted labels on a hairline with a 1px rule, no icons, no ×, and the accent on the
 * wrong edge. Two tab rows in one product that do not match is exactly the divergence the
 * Standardization check is about, so there is one now and both use it.
 *
 * What it owns: the scroller with fade edges that only appear when there is actually something
 * off-screen, the per-tab shell with its hover and its right-hand divider, the travelling brand
 * underline along the **bottom** edge, the icon that fills and takes the brand colour when
 * active, and the × that shows on the active tab when closing it leads somewhere.
 *
 * What it does not own is what a tab *is*. The titlebar's tabs are routes, so they render as
 * `<Link>` with `aria-current="page"`; the showcase's tabs switch a panel in place, so they
 * render as `<button role="tab">`. That is the one real difference between the two and it stays
 * at the call site.
 *
 * Two things it has to carry itself, both learned by putting it somewhere that is not the
 * titlebar. It needs **its own height**: the tabs are `h-full`, and in the titlebar that is
 * filled by the layout's `grid-rows-[40px_…]`. Anywhere else there is no such parent, so the row
 * collapsed to the height of its own text and the underline hugged the labels. And whatever is
 * **pinned to the right sits outside the scroller** — inside it, it scrolls away with the tabs
 * and gets eaten by the fade mask, which is how a trailing label ended up reading "DO'S AND DON'".
 */

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import type { Icon } from "@phosphor-icons/react"
import { EASE_OUT } from "@/components/ui/reveal"
import { cn } from "@/lib/utils"

export type StripTab = {
  /** Stable identity for the list and for `aria-controls`. */
  key: string
  /** The filename shown on the tab. */
  name: string
  icon: Icon
  active: boolean
  /** A route tab. Omit for a tab that switches something in place. */
  href?: string
  /** For an in-place tab. Ignored when `href` is set. */
  onSelect?: () => void
  /** Renders the ×, on the active tab only. Omit where closing means nothing. */
  onClose?: () => void
  /** `aria-controls` for a tablist. */
  controls?: string
  /** Used as the button id so a tablist's panel can point back at it. */
  id?: string
}

export function TabStrip({
  tabs,
  label,
  layoutId,
  role,
  className,
  onKeyDown,
  activeSurface = "var(--bg-surface)",
  after,
  children,
}: {
  tabs: StripTab[]
  /** Names the row: "Pages", "Components view". */
  label: string
  /** Must be unique per strip on the page, or two rows share one underline. */
  layoutId: string
  /** `"tablist"` for in-place switching; omit for a nav of routes. */
  role?: "tablist"
  className?: string
  onKeyDown?: (e: React.KeyboardEvent) => void
  /**
   * What the active tab is filled with.
   *
   * The titlebar's default is `--bg-surface`, and there the tab sits above a canvas-coloured
   * page, so the two never touch. `/components` has the tab resting directly on its panel, and
   * a join only reads if both are the same surface — with the panel on `--bg-card`, because
   * `globals.css` is explicit that zinc-900 across a large area reads as a field of grey.
   */
  activeSurface?: string
  /**
   * Sits immediately after the last tab, outside the scroller — the titlebar's `+`.
   *
   * Outside, because inside it scrolls away with the tabs and gets eaten by the fade mask,
   * which is how a trailing label once read "DO'S AND DON'". Immediately after, because it
   * belongs to the row of tabs: `+` means "another tab", and pushed to the far edge it would
   * read as a second, unrelated control.
   */
  after?: React.ReactNode
  /**
   * Pushed to the far end of the row — `/components`' count. `ml-auto` rather than a growing
   * scroller, so the tabs stay content-width and whatever `after` holds stays beside them.
   */
  children?: React.ReactNode
}) {
  const reduce = useReducedMotion() ?? false
  const scrollerRef = useRef<HTMLDivElement>(null)
  const Scroller = role ? "div" : "nav"
  const [edges, setEdges] = useState({ start: false, end: false })

  // Fade the scroll edges only when the tabs actually overflow that side — on a wide screen
  // everything fits, so no fade; on a phone it is the signal that the row scrolls.
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const update = () => {
      setEdges({
        start: el.scrollLeft > 1,
        end: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
      })
    }
    update()
    el.addEventListener("scroll", update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", update)
      ro.disconnect()
    }
  }, [tabs.length])

  const fadeLeft = edges.start ? "28px" : "0px"
  const fadeRight = edges.end ? "28px" : "0px"
  const fadeMask = `linear-gradient(to right, transparent 0, #000 ${fadeLeft}, #000 calc(100% - ${fadeRight}), transparent 100%)`

  return (
    /*
     * `flex-1` on the row, and deliberately NOT on the scroller inside it.
     *
     * The row grows to fill whatever its parent gives it, which is what puts the titlebar's
     * `main` badge back on the right edge — it is a `shrink-0` sibling, so the row taking the
     * slack is the only thing pushing it there. The scroller stays content-width so `after`
     * lands next to the last tab rather than at the far end; `min-w-0` is what still lets it
     * shrink and scroll when the tabs outgrow the row.
     */
    <div className={cn("flex min-h-10 min-w-0 flex-1 items-stretch", className)}>
      {/*
       * `<nav>` for a row of routes, a `<div role="tablist">` for a row of panels.
       *
       * The titlebar's tabs were a `<nav aria-label="Pages">` before this component existed,
       * and extracting it quietly turned them into a roleless `<div>` carrying an `aria-label`
       * — which assistive tech ignores, so the site's primary navigation stopped being a
       * landmark. A label needs a role to hang off; `role="tablist"` gave `/components` one and
       * the titlebar had nothing.
       */}
      <Scroller
        ref={scrollerRef}
        role={role}
        aria-label={label}
        onKeyDown={onKeyDown}
        className={cn(
          "flex min-w-0 items-stretch overflow-x-auto",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
        style={{ maskImage: fadeMask, WebkitMaskImage: fadeMask }}
      >
        {tabs.map((tab) => {
          const { active } = tab
          const TabIcon = tab.icon
          const closable = active && Boolean(tab.onClose)

          const inner = (
            <>
              <TabIcon
                size={15}
                weight={active ? "fill" : "regular"}
                style={{ color: active ? "var(--fg-brand)" : "currentColor" }}
                className="shrink-0 transition-transform duration-200 ease-out group-hover:scale-115"
              />
              {/* The filename is always on for the active tab and only from sm up for the rest,
                so a phone shows icons plus the one name that matters. */}
              <span className={cn(active ? "inline" : "hidden sm:inline")}>{tab.name}</span>
            </>
          )

          const innerClass = cn(
            "inline-flex h-full items-center gap-2 pl-3 sm:pl-4",
            closable ? "pr-1.5" : "pr-3 sm:pr-4",
            "text-mono-sm font-mono transition-colors duration-[120ms]",
            active
              ? "text-[var(--fg-primary)]"
              : "text-[var(--fg-muted)] hover:text-[var(--fg-secondary)]",
          )

          return (
            <div
              key={tab.key}
              className={cn(
                "group relative inline-flex h-full shrink-0 items-center border-r border-[var(--border-subtle)]",
                "transition-colors duration-150",
                !active && "hover:bg-[var(--bg-hover-soft)]",
              )}
              style={active ? { background: activeSurface } : undefined}
            >
              {/* One underline for the whole row, travelling to whichever tab is active. The
                same `layoutId` trick as the sidebar's diamond. */}
              {active && (
                <motion.span
                  layoutId={layoutId}
                  transition={reduce ? { duration: 0 } : { duration: 0.32, ease: EASE_OUT }}
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
                  style={{ background: "var(--fg-brand)" }}
                />
              )}

              {tab.href ? (
                <Link
                  href={tab.href}
                  title={tab.name}
                  aria-label={tab.name}
                  aria-current={active ? "page" : undefined}
                  className={innerClass}
                >
                  {inner}
                </Link>
              ) : (
                <button
                  type="button"
                  id={tab.id}
                  role={role === "tablist" ? "tab" : undefined}
                  aria-selected={role === "tablist" ? active : undefined}
                  aria-controls={tab.controls}
                  // Roving tabindex: one stop for the whole row, arrows move within it.
                  tabIndex={role === "tablist" ? (active ? 0 : -1) : undefined}
                  title={tab.name}
                  onClick={tab.onSelect}
                  className={cn(innerClass, "cursor-pointer")}
                >
                  {inner}
                </button>
              )}

              {closable && (
                <button
                  type="button"
                  onClick={tab.onClose}
                  aria-label={`Close ${tab.name}`}
                  className={cn(
                    "focus-ring text-mono-sm mr-1.5 inline-grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-sm",
                    "text-[var(--fg-muted)] opacity-60 transition-[opacity,background-color]",
                    "hover:bg-[var(--bg-hover-strong)] hover:opacity-100",
                  )}
                >
                  ×
                </button>
              )}
            </div>
          )
        })}
      </Scroller>

      {/* Both outside the scroller: neither may scroll away with the tabs or be clipped by the
          fade mask. `after` stays beside them; `children` goes to the far edge. */}
      {after}
      {children && <div className="ml-auto flex shrink-0 items-stretch">{children}</div>}
    </div>
  )
}
