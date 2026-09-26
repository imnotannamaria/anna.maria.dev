/**
 * The roadmap's vocabulary, with no zod in it.
 *
 * Client components need these labels, and `validation.ts` imports zod at module scope, so
 * importing a value from there shipped zod to the browser on the home page and /roadmap.
 * The schema stays in `validation.ts`, which re-exports these.
 */

/**
 * Four statuses, three of them public.
 *
 * `raw` is what ROADMAP.md used to be: somewhere to put a thought without deciding
 * anything about it. It is the default, and every public query filters it out.
 */
export const ROADMAP_STATUSES = ["raw", "todo", "doing", "done"] as const
export type RoadmapStatus = (typeof ROADMAP_STATUSES)[number]

/** The three that render on the site, in board order. */
export const PUBLIC_STATUSES = ["todo", "doing", "done"] as const
export type PublicStatus = (typeof PUBLIC_STATUSES)[number]

/** Column heading, filter pill, and the one place a card says its status in words. */
export const STATUS_LABEL: Record<RoadmapStatus, string> = {
  raw: "raw",
  todo: "to do",
  doing: "in progress",
  done: "shipped",
}

/** The editor-ish mark on the card's badge. */
export const STATUS_MARK: Record<RoadmapStatus, string> = {
  raw: "[·]",
  todo: "[ ]",
  doing: "[~]",
  done: "[x]",
}
