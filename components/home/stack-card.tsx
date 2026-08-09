"use client"

import { useState } from "react"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import { cn } from "@/lib/utils"
import { CaretRightIcon } from "@phosphor-icons/react"
import {
  siTypescript,
  siJavascript,
  siPython,
  siReact,
  siNextdotjs,
  siTailwindcss,
  siRedux,
  siJest,
  siNodedotjs,
  siDjango,
  siDotnet,
  siGraphql,
  siHono,
  siNestjs,
  siPostgresql,
  siSupabase,
  siMongodb,
  siMysql,
  siFirebase,
  siPrisma,
  siDrizzle,
  siLangchain,
  siPandas,
  siDocker,
  siVercel,
  siFastapi,
} from "simple-icons"

// ─── Data ──────────────────────────────────────────────────────────────────────

type Tool = { name: string; icon?: string }

const BRANCHES: { id: string; label: string; comment: string; tools: Tool[] }[] = [
  {
    id: "front",
    label: "front",
    comment: "client",
    tools: [
      { name: "typescript", icon: siTypescript.path },
      { name: "javascript", icon: siJavascript.path },
      { name: "react", icon: siReact.path },
      { name: "next.js", icon: siNextdotjs.path },
      { name: "tailwind", icon: siTailwindcss.path },
      { name: "redux", icon: siRedux.path },
      { name: "jest", icon: siJest.path },
    ],
  },
  {
    id: "back",
    label: "back",
    comment: "server",
    tools: [
      { name: "python", icon: siPython.path },
      { name: "django", icon: siDjango.path },
      { name: "fastapi", icon: siFastapi.path },
      { name: "node.js", icon: siNodedotjs.path },
      { name: "hono", icon: siHono.path },
      { name: "nestjs", icon: siNestjs.path },
      { name: ".net", icon: siDotnet.path },
      { name: "graphql", icon: siGraphql.path },
    ],
  },
  {
    id: "data",
    label: "data",
    comment: "storage",
    tools: [
      { name: "postgres", icon: siPostgresql.path },
      { name: "supabase", icon: siSupabase.path },
      { name: "mongodb", icon: siMongodb.path },
      { name: "mysql", icon: siMysql.path },
      { name: "drizzle", icon: siDrizzle.path },
      { name: "prisma", icon: siPrisma.path },
      { name: "firebase", icon: siFirebase.path },
    ],
  },
  {
    id: "ai",
    label: "ai",
    comment: "models + ops",
    tools: [
      { name: "langchain", icon: siLangchain.path },
      { name: "pandas", icon: siPandas.path },
      { name: "docker", icon: siDocker.path },
      { name: "vercel", icon: siVercel.path },
      { name: "azure openai" },
      { name: "rag" },
    ],
  },
]

const TOTAL_TOOLS = BRANCHES.reduce((sum, b) => sum + b.tools.length, 0)

/** The project's --ease-out token, as a Motion cubic-bezier array. */
const EASE_OUT = [0.2, 0.8, 0.2, 1] as const

// Divider borders per cell, adapting to the column count at each breakpoint:
// 1 col (mobile) → bottom between rows · 2 col (sm) → right on col 0, bottom on row 0
// 4 col (lg) → right between columns, no bottom
const CELL_BORDERS = [
  "border-b sm:border-r lg:border-b-0",
  "border-b lg:border-r lg:border-b-0",
  "border-b sm:border-r sm:border-b-0",
  "",
]

// ─── Sub-components ────────────────────────────────────────────────────────────

function RadioDot({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full transition-all duration-200"
      style={{
        width: 16,
        height: 16,
        border: `1.5px solid ${active ? "var(--fg-brand)" : "var(--border-strong)"}`,
      }}
    >
      <span
        className="rounded-full transition-transform duration-200"
        style={{
          width: 7,
          height: 7,
          background: active ? "var(--fg-brand)" : "transparent",
          transform: active ? "scale(1)" : "scale(0)",
        }}
      />
    </span>
  )
}

function StackBadge({ tool }: { tool: Tool }) {
  return (
    <span
      className={cn(
        "inline-flex h-[26px] cursor-default items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5",
        "border border-transparent font-mono text-[11px] font-medium",
        "transition-[transform,border-color,background-color] duration-150 ease-out",
        "hover:-translate-y-0.5 hover:border-(--border-brand-strong)",
      )}
      style={{ background: "var(--bg-surface-brand)", color: "var(--fg-brand-hover)" }}
    >
      {tool.icon && (
        <svg
          viewBox="0 0 24 24"
          width={10}
          height={10}
          fill="currentColor"
          aria-hidden
          className="shrink-0 opacity-80"
        >
          <path d={tool.icon} />
        </svg>
      )}
      {tool.name}
    </span>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function StackCard() {
  const reduce = useReducedMotion() ?? false
  const [open, setOpen] = useState<Set<string>>(() => new Set(["front", "back"]))
  const { onMouseMove, spotlight } = useSpotlight(700)

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (!next.delete(id)) next.add(id)
      return next
    })

  /*
   * The badges used to open on a `max-height: 200px` transition, which is a
   * guess: too small and a branch clips, too large and the easing runs against
   * empty space, so the panel appears to hesitate before anything moves. This
   * is the same height + stagger the tree uses — measured, not guessed.
   */
  const panel: Variants = {
    open: {
      height: "auto",
      transition: {
        duration: reduce ? 0 : 0.24,
        ease: EASE_OUT,
        staggerChildren: reduce ? 0 : 0.025,
        delayChildren: reduce ? 0 : 0.06,
      },
    },
    closed: {
      height: 0,
      /*
       * Closing had no animation to watch. Two things were hiding it: the panel
       * faded its own opacity, which covered whatever the badges were doing, and
       * the height hit 0 while they were still fully opaque, so the whole thing
       * read as a cut. Now the panel only animates height, the badges carry the
       * fade, and the collapse waits 80ms for them to go first. Still shorter
       * end to end than opening — a branch you just closed shouldn't make you
       * wait for it.
       */
      transition: { duration: reduce ? 0 : 0.16, ease: EASE_OUT, delay: reduce ? 0 : 0.08 },
    },
  }
  const badge: Variants = {
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: reduce ? 0 : 0.3, ease: EASE_OUT },
    },
    closed: {
      opacity: 0,
      y: reduce ? 0 : 6,
      scale: reduce ? 1 : 0.94,
      transition: { duration: reduce ? 0 : 0.12, ease: EASE_OUT },
    },
  }

  return (
    <div className="bento-card" onMouseMove={onMouseMove}>
      <Spotlight {...spotlight} />

      {/* Header — same shape as the tree card: mark + name left, count right. */}
      <div
        className="relative flex items-center justify-between gap-3 font-mono text-[11px] tracking-[0.08em] uppercase"
        style={{ color: "var(--fg-secondary)" }}
      >
        <h2
          id="card-stack"
          className="inline-flex items-center gap-1.5"
          style={{ margin: 0, fontSize: "inherit", fontWeight: "inherit" }}
        >
          <span aria-hidden="true" style={{ color: "var(--fg-brand)", fontSize: 10 }}>
            ◆
          </span>
          stack
        </h2>
        <span style={{ color: "var(--fg-muted)" }}>{BRANCHES.length} branches</span>
      </div>

      <div
        className="relative grid grid-cols-1 overflow-hidden sm:grid-cols-2 lg:grid-cols-4"
        style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}
      >
        {BRANCHES.map((branch, i) => {
          const isOpen = open.has(branch.id)
          const panelId = `stack-panel-${branch.id}`

          return (
            <div
              key={branch.id}
              className={cn(
                "group/branch flex flex-col border-(--border-subtle) transition-colors duration-150",
                "hover:bg-(--bg-hover-soft) has-[:focus-visible]:bg-(--bg-hover-soft)",
                CELL_BORDERS[i],
              )}
            >
              {/*
               * A real <button>, not a div with role="button" and a hand-rolled
               * keydown handler. Enter and Space come free, and only the header
               * toggles — clicking a badge no longer collapses the branch you
               * opened to read it.
               */}
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(branch.id)}
                className="flex w-full items-center gap-2 p-4 text-left outline-none"
              >
                <RadioDot active={isOpen} />

                <span
                  className="font-mono text-sm font-semibold transition-colors duration-150 group-hover/branch:text-(--fg-brand)"
                  style={{ color: "var(--fg-primary)" }}
                >
                  {branch.label}
                </span>

                <span className="font-mono text-[10px]" style={{ color: "var(--fg-muted)" }}>
                  {`// ${branch.comment}`}
                </span>

                <span
                  className="ml-auto font-mono text-[11px]"
                  style={{ color: "var(--fg-muted)" }}
                >
                  {branch.tools.length}
                  <span className="sr-only"> tools</span>
                </span>

                <CaretRightIcon
                  aria-hidden
                  size={11}
                  weight="bold"
                  className="shrink-0 transition-transform duration-200"
                  style={{
                    color: isOpen ? "var(--fg-brand)" : "var(--fg-secondary)",
                    transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              {/* Kept mounted behind `inert` so the tool names stay in the server
                  HTML and the height animation has something to measure. */}
              <motion.div
                id={panelId}
                className="overflow-hidden"
                initial={false}
                animate={isOpen ? "open" : "closed"}
                variants={panel}
                inert={!isOpen}
              >
                {/* The padding lives on this inner div, not the animated one.
                    With border-box, `height: 0` on a padded box still clamps to
                    padding-top + padding-bottom, so a closed branch would leave
                    a 16px ghost. This one is a motion.div with no `animate` of
                    its own, which keeps the stagger propagating to the badges. */}
                <motion.div className="flex flex-wrap gap-1.5 px-4 pb-4">
                  {branch.tools.map((tool) => (
                    <motion.span key={tool.name} variants={badge} className="inline-flex">
                      <StackBadge tool={tool} />
                    </motion.span>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          )
        })}
      </div>

      {/* Footer — mirrors the tree card's. */}
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
          click a branch to fold it away
        </span>
        <span style={{ color: "var(--fg-brand)" }}>{TOTAL_TOOLS} tools</span>
      </div>
    </div>
  )
}
