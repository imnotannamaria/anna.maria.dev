import type { PublicStatus, RoadmapItem } from "./validation"

/**
 * The board's columns, sliced from a list already in memory.
 *
 * No `GROUP BY` beside the query that returns the same rows: every caller that wants the
 * columns already has the items. The log made the same call with countByType.
 *
 * This runs once per board render and the counts are read off the result — the progress
 * card is handed those numbers rather than grouping the same array a second time.
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

/** How many in each column. `raw` is already gone: it is not a promise, so it is not a total. */
export function countByStatus(
  groups: Record<PublicStatus, RoadmapItem[]>,
): Record<PublicStatus, number> {
  return { todo: groups.todo.length, doing: groups.doing.length, done: groups.done.length }
}
