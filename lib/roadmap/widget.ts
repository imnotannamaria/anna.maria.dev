import { groupByStatus } from "./counts"
import type { PublicStatus, RoadmapItem } from "./validation"

/**
 * What a card-sized roadmap should say.
 *
 * Not "the newest N". A board's news is what just landed and what is moving, so the slice is
 * the last shipped things, everything in progress, and the next few queued — in that order,
 * which is the order time runs in. Everything the card cannot hold becomes one count in the
 * footer rather than being silently dropped.
 *
 * The caps are here and not in the component because they are the reason the card has a
 * predictable height. `doing` is capped like the other two: it is three items today and
 * nothing stops it being eight, at which point an uncapped card is taller than the grid row
 * it lives in and drags the card beside it with it.
 */

/** How many of each end of the board the card carries. Seven rows, whatever the data does. */
export const SHIPPED_ROWS = 2
export const MOVING_ROWS = 3
export const QUEUED_ROWS = 2

export type RoadmapSlice = {
  /** The rows to draw, oldest-shipped first through to last-queued. */
  rows: RoadmapItem[]
  counts: Record<PublicStatus, number>
  /** todo + doing + done. `raw` is not a promise, so it is not a total. */
  total: number
  /** Everything the card could not hold. Never negative. */
  hidden: number
}

export function roadmapSlice(items: RoadmapItem[]): RoadmapSlice {
  const groups = groupByStatus(items)
  const counts = {
    todo: groups.todo.length,
    doing: groups.doing.length,
    done: groups.done.length,
  }
  const total = counts.todo + counts.doing + counts.done

  // Most recently shipped first, then reversed, so the rows read downwards in the order the
  // work happened. `localeCompare` on "YYYY-MM-DD" is a correct date sort and needs no Date:
  // `new Date("2026-08-09")` parses as UTC midnight and would shift a day for anyone west of
  // Greenwich, which is the timezone trap this codebase has paid for once already.
  //
  // Undated `done` rows sort last rather than first: a shipped row with no date predates the
  // column, and guessing a position for it would put months-old work at the top of "just
  // landed". `""` compares below every real date, so they fall out of the slice first.
  const shipped = [...groups.done]
    .sort((a, b) => (b.shippedAt ?? "").localeCompare(a.shippedAt ?? ""))
    .slice(0, SHIPPED_ROWS)
    .reverse()

  const rows = [
    ...shipped,
    ...groups.doing.slice(0, MOVING_ROWS),
    ...groups.todo.slice(0, QUEUED_ROWS),
  ]

  return { rows, counts, total, hidden: Math.max(0, total - rows.length) }
}
