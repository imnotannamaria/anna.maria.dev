"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
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

const NUMBER_WORDS: Record<number, string> = {
  14: "fourteen",
  15: "fifteen",
  16: "sixteen",
  17: "seventeen",
  18: "eighteen",
  19: "nineteen",
  20: "twenty",
  21: "twenty-one",
  22: "twenty-two",
  23: "twenty-three",
  24: "twenty-four",
  25: "twenty-five",
  26: "twenty-six",
  27: "twenty-seven",
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function RadioDot({ active }: { active: boolean }) {
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded-full transition-all duration-200"
      style={{
        width: 16,
        height: 16,
        border: `1.5px solid ${active ? "var(--fg-primary)" : "var(--border-strong)"}`,
      }}
    >
      <div
        className="rounded-full transition-all duration-200"
        style={{
          width: 7,
          height: 7,
          background: active ? "var(--fg-primary)" : "transparent",
          transform: active ? "scale(1)" : "scale(0)",
        }}
      />
    </div>
  )
}

function StackBadge({ tool }: { tool: Tool }) {
  return (
    <span
      className="inline-flex h-[26px] items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 font-mono text-[11px] font-medium"
      style={{
        background: "var(--bg-surface-brand)",
        color: "var(--fg-brand-hover)",
      }}
    >
      {tool.icon && (
        <svg
          viewBox="0 0 24 24"
          width={10}
          height={10}
          fill="currentColor"
          aria-hidden
          style={{ opacity: 0.8, flexShrink: 0 }}
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
  const [open, setOpen] = useState<Set<string>>(new Set(["front", "back"]))

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="bento-card">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div
          className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] uppercase"
          style={{ color: "var(--fg-secondary)" }}
        >
          <span style={{ color: "var(--fg-brand)", fontSize: 10 }}>◆</span>
          stack
        </div>

        <div
          className="flex items-center gap-2 font-mono text-[11px]"
          style={{ color: "var(--fg-muted)" }}
        >
          <div
            className="rounded-full"
            style={{ width: 6, height: 6, background: "var(--fg-secondary)", opacity: 0.4 }}
          />
          stack.json
        </div>

        <span
          className="ml-auto font-mono text-[11px] tracking-[0.04em]"
          style={{ color: "var(--fg-brand)" }}
        >
          {BRANCHES.length} · BRANCHES
        </span>
      </div>

      {/* Branches — 4 columns, border-r dividers, entire column is the hover target */}
      <div
        className="grid grid-cols-1 overflow-hidden sm:grid-cols-2 lg:grid-cols-4"
        style={{
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
        }}
      >
        {BRANCHES.map((branch, i) => {
          const isOpen = open.has(branch.id)
          const isLast = i === BRANCHES.length - 1

          return (
            <div
              key={branch.id}
              role="button"
              tabIndex={0}
              onClick={() => toggle(branch.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  toggle(branch.id)
                }
              }}
              className="group/branch flex cursor-pointer flex-col gap-3 p-4 transition-colors duration-150 outline-none hover:[background:var(--bg-hover-soft)] focus-visible:[background:var(--bg-hover-soft)]"
              style={{
                borderRight: !isLast ? "1px solid var(--border-subtle)" : undefined,
              }}
            >
              {/* Branch header */}
              <div className="flex w-full items-center gap-2">
                <RadioDot active={isOpen} />

                <span
                  className="font-mono text-sm font-semibold transition-colors duration-150 group-hover/branch:[color:var(--fg-brand)]"
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
                </span>

                <ChevronDown
                  size={12}
                  className="flex-shrink-0 transition-transform duration-200"
                  style={{
                    color: "var(--fg-secondary)",
                    transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                  }}
                />
              </div>

              {/* Badges */}
              <div
                className="flex flex-wrap gap-1.5 overflow-hidden transition-all duration-200"
                style={{
                  maxHeight: isOpen ? 200 : 0,
                  opacity: isOpen ? 1 : 0,
                  marginTop: isOpen ? 0 : -8,
                }}
              >
                {branch.tools.map((tool) => (
                  <StackBadge key={tool.name} tool={tool} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 font-mono text-[11px]" style={{ color: "var(--fg-muted)" }}>
        <span style={{ opacity: 0.6 }}>{"// "}</span>
        {NUMBER_WORDS[TOTAL_TOOLS] ?? TOTAL_TOOLS} tools · primary
      </div>
    </div>
  )
}
