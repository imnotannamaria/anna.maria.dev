import { LOG_TYPES, type LogEntry, type LogType } from "./validation"

/**
 * How many entries of each type, counted from a list already in memory.
 *
 * This used to be a `GROUP BY` of its own, running beside the query that fetches the same
 * rows — every caller that wanted counts already had the entries. Types with nothing in
 * them are left out rather than set to zero, since both callers filter those anyway.
 */
export function countByType(entries: LogEntry[]): Record<LogType, number> {
  const counts = {} as Record<LogType, number>

  for (const entry of entries) {
    counts[entry.type] = (counts[entry.type] ?? 0) + 1
  }

  return counts
}

/** The same counts as an ordered list, for the places that render one row per type. */
export function typeBreakdown(entries: LogEntry[]): { type: LogType; count: number }[] {
  const counts = countByType(entries)
  return LOG_TYPES.filter((t) => (counts[t] ?? 0) > 0).map((type) => ({
    type,
    count: counts[type] ?? 0,
  }))
}
