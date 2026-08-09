import { PUBLIC_STATUSES, type PublicStatus, type RoadmapItem } from "./validation"

/**
 * The board's columns, sliced from a list already in memory.
 *
 * No `GROUP BY` beside the query that returns the same rows: every caller that wants the
 * columns already has the items. The log made the same call with countByType.
 */
export function groupByStatus(items: RoadmapItem[]): Record<PublicStatus, RoadmapItem[]> {
  const groups = { todo: [], doing: [], done: [] } as Record<PublicStatus, RoadmapItem[]>

  for (const item of items) {
    // `raw` never reaches here through getPublicItems, but the admin passes lists that do
    // contain it, and a card with nowhere to go should be dropped rather than crash.
    if (item.status === "raw") continue
    groups[item.status].push(item)
  }

  return groups
}

export function countByStatus(items: RoadmapItem[]): Record<PublicStatus, number> {
  const groups = groupByStatus(items)
  return { todo: groups.todo.length, doing: groups.doing.length, done: groups.done.length }
}

/** Shipped over total, 0–1. Total is public items only — `raw` is not a promise. */
export function shippedFraction(items: RoadmapItem[]): number {
  const publicItems = items.filter((i) => i.status !== "raw")
  if (publicItems.length === 0) return 0
  return publicItems.filter((i) => i.status === "done").length / publicItems.length
}

/** The same statuses as an ordered list, for the places that render one row per column. */
export function statusBreakdown(items: RoadmapItem[]): { status: PublicStatus; count: number }[] {
  const counts = countByStatus(items)
  return PUBLIC_STATUSES.map((status) => ({ status, count: counts[status] }))
}
