"use client"

import { useState } from "react"
import { useReducedMotion, type Variants } from "motion/react"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import { cn } from "@/lib/utils"
import { defaultOpenPaths, type SiteTreeItem } from "@/lib/site-tree"
import { TreeNode } from "./tree-node"

/** The project's own easing token, as a Motion cubic-bezier array. */
const EASE_OUT = [0.2, 0.8, 0.2, 1] as const

/** Past this, a per-row stagger stops reading as flow and starts as lag. */
const STAGGER_LIMIT = 6

function buildVariants(reduce: boolean): { list: Variants; row: Variants } {
  if (reduce) {
    // The global prefers-reduced-motion block in globals.css only zeroes CSS.
    // Motion animates through JS and walks straight past it, so it gets told
    // here: same state changes, no transition.
    return {
      list: {
        open: { height: "auto", opacity: 1, transition: { duration: 0 } },
        closed: { height: 0, opacity: 0, transition: { duration: 0 } },
      },
      row: { open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: 0 } },
    }
  }

  return {
    list: {
      open: (childCount: number) => ({
        height: "auto",
        opacity: 1,
        transition: {
          duration: 0.22,
          ease: EASE_OUT,
          staggerChildren: childCount > STAGGER_LIMIT ? 0 : 0.02,
          delayChildren: 0.04,
        },
      }),
      // Shorter on the way out. A folder you just closed shouldn't make you wait.
      closed: {
        height: 0,
        opacity: 0,
        transition: { duration: 0.16, ease: EASE_OUT },
      },
    },
    row: {
      open: { opacity: 1, x: 0 },
      closed: { opacity: 0, x: -4 },
    },
  }
}

/**
 * The site as a file tree, in the slot the experience card used to hold.
 *
 * It takes an already-resolved tree rather than reading content itself, so
 * velite and the database client stay out of this bundle — the home page builds
 * it from data it has fetched for other cards anyway.
 */
export function TreeCard({
  items,
  routeCount,
  className,
}: {
  items: SiteTreeItem[]
  routeCount: number
  className?: string
}) {
  const reduce = useReducedMotion() ?? false
  const [open, setOpen] = useState<Set<string>>(() => new Set(defaultOpenPaths(items)))
  const { onMouseMove, spotlight } = useSpotlight()

  const variants = buildVariants(reduce)

  const isOpen = (path: string) => open.has(path)
  const toggle = (path: string) =>
    setOpen((current) => {
      const next = new Set(current)
      if (!next.delete(path)) next.add(path)
      return next
    })

  return (
    <div
      className={cn("bento-card relative flex flex-col overflow-hidden", className)}
      onMouseMove={onMouseMove}
    >
      <Spotlight {...spotlight} />
      {/* Dot pattern, same treatment the experience card had */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: "-20%",
          bottom: "-10%",
          width: "70%",
          aspectRatio: "1",
          opacity: 0.16,
          pointerEvents: "none",
          backgroundImage: "radial-gradient(var(--fg-brand) 1px, transparent 1.4px)",
          backgroundSize: "18px 18px",
          maskImage: "radial-gradient(circle, #000 0%, transparent 65%)",
          WebkitMaskImage: "radial-gradient(circle, #000 0%, transparent 65%)",
        }}
      />

      <div
        className="relative flex items-center justify-between gap-3 font-mono text-[11px] tracking-[0.08em] uppercase"
        style={{ color: "var(--fg-secondary)" }}
      >
        <h2
          id="card-tree"
          className="inline-flex items-center gap-1.5"
          style={{ margin: 0, fontSize: "inherit", fontWeight: "inherit" }}
        >
          <span aria-hidden="true" style={{ color: "var(--fg-brand)", fontSize: 10 }}>
            ◆
          </span>
          tree
        </h2>
        <span style={{ color: "var(--fg-muted)" }}>{routeCount} routes</span>
      </div>

      {/* min-h-0 is what makes this the part that scrolls: without it a flex child
          refuses to shrink below its content and the overflow never engages. */}
      <nav
        aria-labelledby="card-tree"
        className="relative -mx-2 min-h-0 flex-1 overflow-y-auto pb-1"
      >
        <ul className="tree-root">
          {items.map((item) => (
            <li key={item.path}>
              <TreeNode
                item={item}
                isOpen={isOpen}
                onToggle={toggle}
                listVariants={variants.list}
                rowVariants={variants.row}
              />
            </li>
          ))}
        </ul>
      </nav>

      <div
        className="relative flex items-center justify-between font-mono text-[11px]"
        style={{
          color: "var(--fg-muted)",
          borderTop: "1px dashed var(--border-subtle)",
          paddingTop: 12,
        }}
      >
        <span>
          <span style={{ opacity: 0.6 }}>{"// "}</span>
          click a file to open it
        </span>
        <span className="inline-flex items-center gap-1.5" style={{ color: "var(--fg-brand)" }}>
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{
              background: "var(--fg-brand)",
              animation: "live-pulse 2s ease-in-out infinite",
            }}
          />
          live
        </span>
      </div>
    </div>
  )
}
