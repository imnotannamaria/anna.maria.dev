"use client"

/**
 * /log: the outline, the type pills and the feed — one component, because the three read one
 * piece of state.
 *
 * Filtering is in memory. A few hundred entries is nothing to ship down, and the filter lives
 * in the URL through `useUrlFilter` — read with `useSyncExternalStore` rather than
 * `useSearchParams` so every card is in the server HTML.
 *
 * Grouped by type, and unlike the year grouping on /blog it costs the ordering nothing.
 * `TYPE_ORDER` in `lib/log/queries.ts` is `["music"]` — albums first, then everything else,
 * then favourites, then newest. `groupInOrder` buckets in *arrival* order rather than by
 * `LOG_TYPES`, which keeps that exactly: the music section leads because the query already put
 * music first, and favourites still lead inside each section.
 *
 * The shell is `FeedShell`, shared with /blog and /projects.
 */

import { useMemo } from "react"
import { FeedShell, groupInOrder, type FeedGroup } from "@/components/chrome/feed-shell"
import { useUrlFilter } from "@/components/ui/url-filter"
import { LOG_TYPES, TYPE_PLURAL, type LogEntry, type LogType } from "@/lib/log/validation"
import { LogCard } from "./log-card"
import { LogRail } from "./log-rail"

type Counts = Record<string, number>

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

  const groups: FeedGroup<LogEntry>[] = useMemo(
    () =>
      groupInOrder(filtered, (entry) => entry.type).map(({ key, items }) => ({
        id: `type-${key}`,
        label: TYPE_PLURAL[key as LogType],
        items,
      })),
    [filtered],
  )

  // Types with nothing logged yet would be dead buttons.
  const visible = LOG_TYPES.filter((t) => (counts[t] ?? 0) > 0)

  return (
    <FeedShell
      file="log.tsx"
      root={{ id: "log", label: "log" }}
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
      filterLabel="Filter by type"
      pills={visible.map((type) => ({
        key: type,
        label: TYPE_PLURAL[type],
        count: counts[type] ?? 0,
      }))}
      totalCount={entries.length}
      active={active}
      onFilter={(next) => setFilter(next as LogType | null)}
      groups={groups}
      groupMeta={(group) => `${group.items.length} logged`}
      empty={{
        all: "// nothing logged yet. when I finish something, it shows up here.",
        filtered: "// nothing logged in this category yet.",
      }}
      /* A rail per type rather than a grid that grows downwards. A type with forty entries
         used to be forty cards tall and pushed every other type off the page; now the page's
         height follows how many *types* there are, and the rail reveals the rest of a type as
         you scroll towards its end. See components/log/log-rail.tsx. */
      list={{
        render: (items, renderItem, label) => (
          <LogRail items={items} label={label} renderItem={renderItem} />
        ),
      }}
      renderItem={(entry, index) => <LogCard key={entry.id} entry={entry} index={index} />}
    >
      {children}
    </FeedShell>
  )
}
