/**
 * The log's vocabulary, with no zod in it.
 *
 * Client components need these labels, and `validation.ts` imports zod at module scope. Importing
 * a value from there pulled all of zod (about 60 KB gzipped) into every page that shows a log
 * card, the home page included. The schema stays in `validation.ts`, which re-exports these.
 */

export const LOG_TYPES = ["film", "series", "book", "music", "podcast", "game"] as const
export type LogType = (typeof LOG_TYPES)[number]
/** Badge text on a card. "podcast" shows as "pod", per the design. */
export const TYPE_LABEL: Record<LogType, string> = {
  film: "film",
  series: "series",
  book: "book",
  music: "album",
  podcast: "pod",
  game: "game",
}

/** Filter pill text. */
export const TYPE_PLURAL: Record<LogType, string> = {
  film: "films",
  series: "series",
  book: "books",
  music: "music",
  podcast: "podcasts",
  game: "games",
}
