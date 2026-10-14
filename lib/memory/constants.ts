/**
 * The memory game's shared values. No zod in here, so a client component can import them
 * without the validation library (see lib/client-bundle.test.ts).
 */

export const MEMORY_STATUSES = ["playing", "finished", "submitted", "approved", "rejected"] as const
export type MemoryStatus = (typeof MEMORY_STATUSES)[number]

/** How many names the board shows, and so how good a time has to be to get a form. */
export const BOARD_SIZE = 10

/** A name on the board. Long enough for a first and a last name, short enough for the row. */
export const NAME_MAX = 24

/** Eight pairs: a round cannot take fewer moves than this. */
export const MIN_MOVES = 8

/**
 * The fastest a person can finish, with every pair found on the first try: sixteen clicks and the
 * pauses between them. A round reported faster than this was not played by hand.
 */
export const MIN_MS = 5_000

/** A round left open longer than this is abandoned; it cannot be finished any more. */
export const ROUND_TTL_MS = 60 * 60 * 1000

/** After the last pair, how long the name form stays good for. */
export const CLAIM_TTL_MS = 30 * 60 * 1000

/** A round's time as the board shows it: 0:42.3 */
export function formatMs(ms: number): string {
  const tenths = Math.floor(ms / 100)
  const minutes = Math.floor(tenths / 600)
  const seconds = Math.floor((tenths % 600) / 10)
  return `${minutes}:${String(seconds).padStart(2, "0")}.${tenths % 10}`
}
