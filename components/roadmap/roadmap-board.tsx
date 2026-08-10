"use client"

import { useMemo, useSyncExternalStore } from "react"
import { groupByStatus } from "@/lib/roadmap/counts"
import {
  PUBLIC_STATUSES,
  STATUS_LABEL,
  type PublicStatus,
  type RoadmapItem,
} from "@/lib/roadmap/validation"
import { RoadmapItemCard } from "./roadmap-card"
import { RoadmapProgressCard } from "./roadmap-progress"

const FILTER_EVENT = "roadmap:filter"

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange)
  window.addEventListener(FILTER_EVENT, onChange)
  return () => {
    window.removeEventListener("popstate", onChange)
    window.removeEventListener(FILTER_EVENT, onChange)
  }
}

function readFilter(): PublicStatus | null {
  const value = new URLSearchParams(window.location.search).get("status")
  return value && (PUBLIC_STATUSES as readonly string[]).includes(value)
    ? (value as PublicStatus)
    : null
}

/** Nothing is filtered during the server render, which is what puts every card in the HTML. */
function serverFilter(): PublicStatus | null {
  return null
}

/**
 * The URL is the source of truth, read through useSyncExternalStore — the same call /log
 * made, for the same reason. `useSearchParams` makes a prerendered route emit its Suspense
 * fallback instead of the content, and the cards are the entire page for a crawler.
 */
function useStatusFilter(): PublicStatus | null {
  return useSyncExternalStore(subscribe, readFilter, serverFilter)
}

/** pushState rather than replaceState, so the back button undoes a filter. */
function writeFilter(status: PublicStatus | null) {
  window.history.pushState(null, "", status ? `/roadmap?status=${status}` : "/roadmap")
  window.dispatchEvent(new Event(FILTER_EVENT))
}

/**
 * The board: progress card, filter pills, then either three columns or one filtered grid.
 *
 * The pills are also what keeps the card's layout animation alive. Nobody can move an item
 * from the public site — the checkbox is read-only — so without them the `layoutId` travel
 * would only ever fire for an audience of one, logged into /admin.
 */
export function RoadmapBoard({ items }: { items: RoadmapItem[] }) {
  const active = useStatusFilter()
  const groups = useMemo(() => groupByStatus(items), [items])
  const columns = active ? [active] : PUBLIC_STATUSES

  return (
    <>
      <div className="mb-6">
        <RoadmapProgressCard items={items} />
      </div>

      <div role="group" aria-label="Filter by status" className="mb-6 flex flex-wrap gap-2">
        <Pill label="all" count={items.length} active={!active} onClick={() => writeFilter(null)} />
        {PUBLIC_STATUSES.map((status) => (
          <Pill
            key={status}
            label={STATUS_LABEL[status]}
            count={groups[status].length}
            active={active === status}
            onClick={() => writeFilter(active === status ? null : status)}
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

              {/* py-1: the cards lift 2px and cast a shadow on hover. Without the
                  clearance the list clips the top border of the first one.
                  min(320px, 100%) so a 375px viewport gets one column rather than a track
                  wider than the screen. */}
              <ul
                className={
                  active
                    ? "m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-4 p-0 py-1"
                    : "m-0 flex list-none flex-col gap-4 p-0 py-1"
                }
              >
                {list.map((item, i) => (
                  <RoadmapItemCard
                    key={item.id}
                    item={item}
                    index={i}
                    delay={col * 0.06 + i * 0.05}
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
