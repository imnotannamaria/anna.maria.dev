"use client"

import { useMemo, useSyncExternalStore } from "react"
import { LOG_TYPES, TYPE_PLURAL, type LogEntry, type LogType } from "@/lib/log/validation"
import { LogCard } from "./log-card"

type Counts = Record<string, number>

const FILTER_EVENT = "log:filter"

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange)
  window.addEventListener(FILTER_EVENT, onChange)
  return () => {
    window.removeEventListener("popstate", onChange)
    window.removeEventListener(FILTER_EVENT, onChange)
  }
}

function readFilter(): LogType | null {
  const value = new URLSearchParams(window.location.search).get("type")
  return value && (LOG_TYPES as readonly string[]).includes(value) ? (value as LogType) : null
}

/** Nothing is filtered during prerender, which is what puts every card in the HTML. */
function serverFilter(): LogType | null {
  return null
}

/**
 * The URL is the source of truth, read through useSyncExternalStore.
 *
 * `useSearchParams` would be the obvious hook, but in a statically rendered route it makes
 * the nearest Suspense boundary emit its fallback during prerender — every card would be
 * missing from the HTML, and the cards are the entire point of this page for a crawler.
 *
 * The server snapshot is null, so the first paint shows everything and the filter applies
 * right after hydration. Someone opening /log?type=film directly sees one frame of the
 * full list. That is a fair trade for server-rendered content.
 */
function useTypeFilter(): LogType | null {
  return useSyncExternalStore(subscribe, readFilter, serverFilter)
}

/** pushState rather than replaceState, so the back button undoes a filter. */
function writeFilter(type: LogType | null) {
  window.history.pushState(null, "", type ? `/log?type=${type}` : "/log")
  window.dispatchEvent(new Event(FILTER_EVENT))
}

/**
 * Filters in memory, the way the design mock does. A few hundred entries is nothing to
 * ship down.
 */
export function LogFeed({ entries, counts }: { entries: LogEntry[]; counts: Counts }) {
  const active = useTypeFilter()

  function select(type: LogType | null) {
    writeFilter(!type || active === type ? null : type)
  }

  const filtered = useMemo(
    () => (active ? entries.filter((e) => e.type === active) : entries),
    [entries, active],
  )

  // Types with nothing logged yet would be dead buttons.
  const visible = LOG_TYPES.filter((t) => (counts[t] ?? 0) > 0)

  return (
    <>
      <div role="group" aria-label="Filter by type" className="mb-6 flex flex-wrap gap-2">
        <Pill label="all" count={entries.length} active={!active} onClick={() => select(null)} />
        {visible.map((type) => (
          <Pill
            key={type}
            label={TYPE_PLURAL[type]}
            count={counts[type] ?? 0}
            active={active === type}
            onClick={() => select(type)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center font-mono text-[13px]" style={{ color: "var(--fg-muted)" }}>
          {entries.length === 0
            ? "// nothing logged yet. when I finish something, it shows up here."
            : "// nothing logged in this category yet."}
        </p>
      ) : (
        // min(320px, 100%) so a 375px viewport gets one column rather than a track wider
        // than the screen.
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-3.5">
          {filtered.map((entry) => (
            <LogCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </>
  )
}

function Pill({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-3 font-mono text-xs whitespace-nowrap transition-all duration-120 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
      style={
        active
          ? {
              borderColor: "var(--fg-brand)",
              color: "var(--fg-brand)",
              background: "var(--bg-surface-brand)",
            }
          : {
              borderColor: "var(--border-subtle)",
              color: "var(--fg-muted)",
              background: "transparent",
            }
      }
    >
      {label}
      <span style={{ opacity: 0.55 }}>{count}</span>
    </button>
  )
}
