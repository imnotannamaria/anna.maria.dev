"use client"

import { useState } from "react"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { Skeleton } from "@/app/components/entrepta/skeleton"
import { CardFoot, CardHead } from "@/components/ui/card-parts"
import { EASE_OUT, revealViewport, STAGGER_LIMIT } from "@/components/ui/reveal"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import { cn } from "@/lib/utils"
import { defaultOpenPaths, type SiteTreeItem } from "@/lib/site-tree"
import { TreeNode } from "./tree-node"

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

  /*
   * Header, list and footer arrive in sequence after the card does, so this
   * matches the profile card beside it instead of revealing as one slab.
   *
   * Spelled as labels, not as a spread `useReveal()`. That hook hands Motion
   * value objects, and values reach the element they're on and stop — the
   * `staggerChildren` sitting beside them was orchestrating nothing, and the
   * three `piece` children below never heard a "show". Nothing looked broken,
   * which is exactly how this kind of mistake survives.
   */
  const container: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduce ? 0 : 0.5,
        ease: EASE_OUT,
        delay: reduce ? 0 : 0.08,
        staggerChildren: reduce ? 0 : 0.09,
        delayChildren: reduce ? 0 : 0.1,
      },
    },
  }
  const piece: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 8 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.4, ease: EASE_OUT } },
  }

  const variants = buildVariants(reduce)

  const isOpen = (path: string) => open.has(path)
  const toggle = (path: string) =>
    setOpen((current) => {
      const next = new Set(current)
      if (!next.delete(path)) next.add(path)
      return next
    })

  return (
    <motion.div
      className={cn("bento-card relative flex flex-col overflow-hidden", className)}
      onMouseMove={onMouseMove}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={revealViewport}
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

      <motion.div variants={piece}>
        <CardHead label="tree" as="h2" id="card-tree" meta={`${routeCount} routes`} />
      </motion.div>

      {/* min-h-0 is what makes this the part that scrolls: without it a flex child
          refuses to shrink below its content and the overflow never engages. */}
      <motion.nav
        aria-labelledby="card-tree"
        className="relative -mx-2 min-h-0 flex-1 overflow-y-auto pb-1"
        variants={piece}
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
      </motion.nav>

      <motion.div variants={piece}>
        <CardFoot
          comment="click a file to open it"
          className="border-t border-dashed border-(--border-subtle) pt-3"
        >
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
        </CardFoot>
      </motion.div>
    </motion.div>
  )
}

// ─── Loading ──────────────────────────────────────────────────────────────────

/**
 * The tree while the log count is still in Postgres.
 *
 * It traces the real card rather than standing in for it: the same `.bento-card`, the same
 * `CardHead` with the same meta — `routeCount` is arithmetic over a hand-written constant, so
 * it is known before any query — the same 32px rows at the same indents, and the same footer.
 * The only grey is where the words go.
 *
 * That is the point of the exercise. The generic two-bars-in-a-box skeleton this replaced could
 * have belonged to any card on the site, so it told you a card was coming and nothing about
 * which one; a skeleton earns its keep by being recognisable before it has any data.
 */
const SKELETON_ROWS: { depth: number; width: number; count?: number }[] = [
  { depth: 0, width: 58 },
  { depth: 1, width: 74, count: 22 },
  { depth: 1, width: 66, count: 30 },
  { depth: 0, width: 52 },
  { depth: 1, width: 88 },
  { depth: 1, width: 70 },
  { depth: 1, width: 61 },
  { depth: 0, width: 46 },
  { depth: 0, width: 64 },
]

export function TreeCardSkeleton({
  routeCount,
  className,
}: {
  routeCount: number
  className?: string
}) {
  return (
    <div className={cn("bento-card relative flex flex-col overflow-hidden", className)}>
      <CardHead label="tree" meta={`${routeCount} routes`} />

      <div className="-mx-2 min-h-0 flex-1 overflow-hidden pb-1" aria-hidden>
        {SKELETON_ROWS.map((row, i) => (
          <div
            key={i}
            className="flex items-center gap-2"
            // `.tree-row`'s own metrics: 32px tall, 8px of side padding, 8px between the
            // caret, the glyph and the name. A row that is 30px here and 32px there is the
            // shift the skeleton exists to prevent.
            style={{ minHeight: 32, paddingLeft: 8 + row.depth * 22, paddingRight: 8 }}
          >
            <Skeleton delay={i * 0.06} style={{ width: 10, height: 10, borderRadius: 2 }} />
            <Skeleton delay={i * 0.06} style={{ width: 14, height: 14, borderRadius: 3 }} />
            <Skeleton delay={i * 0.06} style={{ width: row.width, height: 9, borderRadius: 3 }} />
            {row.count != null && (
              <Skeleton
                delay={i * 0.06}
                className="ml-auto"
                style={{ width: 14, height: 9, borderRadius: 3 }}
              />
            )}
          </div>
        ))}
      </div>

      <CardFoot
        comment="reading the tree"
        className="border-t border-dashed border-(--border-subtle) pt-3"
      >
        <Skeleton style={{ width: 52, height: 9, borderRadius: 3 }} />
      </CardFoot>

      <span className="sr-only" role="status">
        Loading the tree
      </span>
    </div>
  )
}
