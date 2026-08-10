"use client"

import { useMemo } from "react"
import { FilterPill, useUrlFilter } from "@/components/ui/url-filter"
import { LOG_TYPES, TYPE_PLURAL, type LogEntry, type LogType } from "@/lib/log/validation"
import { LogCard } from "./log-card"

type Counts = Record<string, number>

/**
 * Filters in memory, the way the design mock does. A few hundred entries is nothing to
 * ship down.
 *
 * The filter itself lives in the URL — see `useUrlFilter` for why it is read through
 * `useSyncExternalStore` and not `useSearchParams`.
 */
export function LogFeed({ entries, counts }: { entries: LogEntry[]; counts: Counts }) {
  const [active, setFilter] = useUrlFilter<LogType>("type", LOG_TYPES, "/log")

  function select(type: LogType | null) {
    setFilter(!type || active === type ? null : type)
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
        <FilterPill
          label="all"
          count={entries.length}
          active={!active}
          onClick={() => select(null)}
        />
        {visible.map((type) => (
          <FilterPill
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
