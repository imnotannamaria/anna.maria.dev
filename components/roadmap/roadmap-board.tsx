"use client"

import { useMemo } from "react"
import { STAGGER_LIMIT } from "@/components/ui/reveal"
import { FilterPill, useUrlFilter } from "@/components/ui/url-filter"
import { countByStatus, groupByStatus } from "@/lib/roadmap/counts"
import {
  PUBLIC_STATUSES,
  STATUS_LABEL,
  type PublicStatus,
  type RoadmapItem,
} from "@/lib/roadmap/validation"
import { RoadmapItemCard } from "./roadmap-card"
import { RoadmapProgressCard } from "./roadmap-progress"

/**
 * The board: progress card, filter pills, then either three columns or one filtered grid.
 *
 * The filter lives in the URL, read the same way /log reads its own — see `useUrlFilter`.
 * The pills are also what keeps the card's layout animation alive. Nobody can move an item
 * from the public site — the checkbox is read-only — so without them the `layoutId` travel
 * would only ever fire for an audience of one, logged into /admin.
 */
export function RoadmapBoard({ items }: { items: RoadmapItem[] }) {
  const [active, setFilter] = useUrlFilter<PublicStatus>("status", PUBLIC_STATUSES, "/roadmap")

  // Grouped once. The progress card is handed the counts rather than grouping again.
  const groups = useMemo(() => groupByStatus(items), [items])
  const counts = useMemo(() => countByStatus(groups), [groups])
  const columns = active ? [active] : PUBLIC_STATUSES
  const total = counts.todo + counts.doing + counts.done

  return (
    <>
      <div className="mb-6">
        <RoadmapProgressCard counts={counts} />
      </div>

      <div role="group" aria-label="Filter by status" className="mb-6 flex flex-wrap gap-2">
        <FilterPill label="all" count={total} active={!active} onClick={() => setFilter(null)} />
        {PUBLIC_STATUSES.map((status) => (
          <FilterPill
            key={status}
            label={STATUS_LABEL[status]}
            count={counts[status]}
            active={active === status}
            onClick={() => setFilter(active === status ? null : status)}
          />
        ))}
      </div>

      <div className={active ? "" : "grid gap-5 md:grid-cols-3"}>
        {columns.map((status, col) => {
          const list = groups[status]

          return (
            <section key={status} className="flex min-w-0 flex-col gap-4">
              <div
                className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.08em] uppercase"
                style={{ color: "var(--fg-secondary)" }}
              >
                <span
                  className="rm-dot"
                  aria-hidden
                  data-live={status === "doing"}
                  data-muted={status === "done"}
                />
                <h2 className="m-0 text-[11px] font-normal tracking-[0.08em] uppercase">
                  {STATUS_LABEL[status]}
                </h2>
                <span
                  className="h-px flex-1"
                  style={{ background: "var(--border-subtle)" }}
                  aria-hidden
                />
                <span
                  className="inline-flex h-5 min-w-5 items-center justify-center rounded-sm px-1.5 text-[11px]"
                  style={{ background: "rgba(255,255,255,0.06)", color: "var(--fg-muted)" }}
                >
                  {list.length}
                </span>
              </div>

              {/* An empty column is still information: it says nothing is sitting there. */}
              {list.length === 0 && (
                <p
                  className="m-0 rounded-md border border-dashed px-4 py-8 text-center font-mono text-[11px]"
                  style={{ borderColor: "var(--border-subtle)", color: "var(--fg-muted)" }}
                >
                  nothing here
                </p>
              )}

              {/* py-1 so the hover shadow has somewhere to fall.
                  min(320px, 100%) so a 375px viewport gets one column rather than a track
                  wider than the screen. */}
              <ul
                className={
                  active
                    ? "m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-4 p-0 py-1"
                    : "m-0 flex list-none flex-col gap-4 p-0 py-1"
                }
              >
                {/* The stagger is capped: past STAGGER_LIMIT the delay stops reading as flow
                    and starts as a card that sat still after being scrolled to. The todo
                    column is already long enough to hit it. */}
                {list.map((item, i) => (
                  <RoadmapItemCard
                    key={item.id}
                    item={item}
                    index={i}
                    delay={col * 0.06 + Math.min(i, STAGGER_LIMIT) * 0.05}
                  />
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </>
  )
}
