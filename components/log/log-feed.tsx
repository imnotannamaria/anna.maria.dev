"use client"

/**
 * /log: the outline, the type pills and the feed — one component, because the three read one
 * piece of state. Same shape as `blog-feed` and `project-feed`, which is the point: four
 * index pages that each invented their own arrangement is the divergence the Standardization
 * check in CLAUDE.md is about.
 *
 * Filtering is in memory. A few hundred entries is nothing to ship down, and the filter lives
 * in the URL through `useUrlFilter` — read with `useSyncExternalStore` rather than
 * `useSearchParams` so every card is in the server HTML.
 *
 * Grouped by type, and unlike the year grouping on /blog it costs the ordering nothing.
 * `TYPE_ORDER` in `lib/log/queries.ts` is `["music"]` — albums first, then everything else,
 * then favourites, then newest. Grouping in *arrival* order rather than by `LOG_TYPES` keeps
 * that exactly: the music section leads because the query already put music first, and
 * favourites still lead inside each section.
 */

import { useMemo } from "react"
import { PageOutline, type OutlineItem } from "@/components/chrome/page-outline"
import { FilterPill, useUrlFilter } from "@/components/ui/url-filter"
import { LOG_TYPES, TYPE_PLURAL, type LogEntry, type LogType } from "@/lib/log/validation"
import { LogCard } from "./log-card"

type Counts = Record<string, number>

/** First-appearance order, so the query's `TYPE_ORDER` survives the grouping. */
function groupByType(entries: LogEntry[]) {
  const groups = new Map<LogType, LogEntry[]>()
  for (const entry of entries) {
    const bucket = groups.get(entry.type)
    if (bucket) bucket.push(entry)
    else groups.set(entry.type, [entry])
  }
  return Array.from(groups, ([type, items]) => ({ type, items }))
}

export function LogFeed({
  entries,
  counts,
  children,
}: {
  entries: LogEntry[]
  counts: Counts
  /** The server-rendered page header. */
  children: React.ReactNode
}) {
  const [active, setFilter] = useUrlFilter<LogType>("type", LOG_TYPES, "/log")

  const filtered = useMemo(
    () => (active ? entries.filter((e) => e.type === active) : entries),
    [entries, active],
  )

  const groups = useMemo(() => groupByType(filtered), [filtered])

  // Types with nothing logged yet would be dead buttons.
  const visible = LOG_TYPES.filter((t) => (counts[t] ?? 0) > 0)

  const outline: OutlineItem[] = [
    { id: "log", label: "log", level: 1 },
    ...groups.map((g) => ({
      id: `type-${g.type}`,
      label: TYPE_PLURAL[g.type],
      level: 2 as const,
      count: g.items.length,
    })),
  ]

  return (
    <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 min-[1100px]:grid-cols-[200px_minmax(0,1fr)]">
      <PageOutline
        items={outline}
        file="log.tsx"
        footer={
          <>
            <div className="flex justify-between">
              <span>{"// logged"}</span>
              <span style={{ color: "var(--fg-brand)" }}>{filtered.length}</span>
            </div>
            <div className="flex justify-between">
              <span>{"// types"}</span>
              <span>{visible.length}</span>
            </div>
            <div>{"// live"}</div>
          </>
        }
      />

      <div className="min-w-0">
        <div className="mx-auto max-w-[880px] px-5 py-12 sm:px-8 lg:px-12">
          {children}

          <div role="group" aria-label="Filter by type" className="mt-8 flex flex-wrap gap-2">
            <FilterPill
              label="all"
              count={entries.length}
              active={!active}
              onClick={() => setFilter(null)}
            />
            {visible.map((type) => (
              <FilterPill
                key={type}
                label={TYPE_PLURAL[type]}
                count={counts[type] ?? 0}
                active={active === type}
                onClick={() => setFilter(active === type ? null : type)}
              />
            ))}
          </div>

          {groups.length === 0 ? (
            <p className="mt-12 font-mono text-[13px]" style={{ color: "var(--fg-muted)" }}>
              {entries.length === 0
                ? "// nothing logged yet. when I finish something, it shows up here."
                : "// nothing logged in this category yet."}
            </p>
          ) : (
            groups.map((group, gi) => (
              <section
                key={group.type}
                id={`type-${group.type}`}
                className="mt-10 border-t pt-8"
                style={{ borderColor: "var(--border-subtle)", scrollMarginTop: 24 }}
              >
                <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2
                    className="m-0"
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontWeight: 400,
                      fontSize: "clamp(24px, 3vw, 32px)",
                      lineHeight: 1.1,
                      letterSpacing: "-0.02em",
                      color: "var(--fg-primary)",
                    }}
                  >
                    {TYPE_PLURAL[group.type]}
                  </h2>
                  <span
                    className="font-mono text-[11px] tracking-[0.08em] uppercase"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {group.items.length} logged
                  </span>
                </div>

                {/* min(300px, 100%) so a 375px viewport gets one column rather than a track
                    wider than the screen. */}
                <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-3.5">
                  {group.items.map((entry, i) => (
                    <LogCard key={entry.id} entry={entry} index={gi === 0 ? i : 0} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
