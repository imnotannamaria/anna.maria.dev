"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { Skeleton } from "@/app/components/entrepta/skeleton"

const GithubCalendarInner = dynamic(
  () => import("@/components/about/github-calendar").then((m) => m.GithubCalendar),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[112px] w-full rounded-lg" />,
  },
)

export function GithubCard({ username }: { username: string }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        position: "relative",
        background: hovered ? "var(--bg-surface-elevated)" : "var(--bg-surface)",
        border: `1px solid ${hovered ? "var(--border-strong)" : "var(--border-subtle)"}`,
        borderRadius: "var(--radius-lg)",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        overflow: "hidden",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "var(--shadow-card-hover)" : "none",
        transition:
          "transform 200ms var(--ease-out), box-shadow 200ms var(--ease-out), background 200ms var(--ease-out), border-color 200ms var(--ease-out)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between gap-3 font-mono text-[11px] tracking-[0.08em] uppercase"
        style={{ color: "var(--fg-secondary)" }}
      >
        <h3 className="inline-flex items-center gap-1.5 font-normal" style={{ margin: 0 }}>
          <span aria-hidden="true" style={{ color: "var(--fg-brand)", fontSize: 10 }}>
            ◆
          </span>
          contributions
        </h3>
        <span style={{ color: "var(--fg-muted)" }}>{username}</span>
      </div>

      {/* Calendar */}
      <div className="overflow-x-auto">
        <GithubCalendarInner username={username} />
      </div>

      {/* Footer */}
      <div
        className="mt-auto flex items-center justify-between gap-3 font-mono text-[11px]"
        style={{
          color: "var(--fg-muted)",
          paddingTop: 12,
          borderTop: "1px dashed var(--border-subtle)",
        }}
      >
        <span>
          <span style={{ opacity: 0.6 }}>{"// "}</span>
          public activity · last 12 months
        </span>
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-all duration-150 hover:tracking-[0.08em]"
          style={{ color: "var(--fg-brand)" }}
          onClick={(e) => e.stopPropagation()}
        >
          github ↗
        </a>
      </div>
    </div>
  )
}
