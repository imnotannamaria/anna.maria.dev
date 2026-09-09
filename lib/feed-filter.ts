/**
 * Which filter pills a feed draws at rest, and which it folds away.
 *
 * /projects drew 38 tag pills over seven rows and grew a little with every project added.
 * The split is by what a pill *does*: 26 of those 38 selected exactly one project, and a
 * filter that returns one result is a link to that result wearing the costume of a filter.
 * So the row at rest holds the tags that group more than one item, and the rest is one
 * click away.
 *
 * Pure, and here rather than in the component, for the reason `lib/roadmap/widget.ts` gives
 * for its own caps: the numbers are why the row has a predictable height, and the edge cases
 * are worth a test rather than a look. Three of the four branches below only happen on data
 * this site does not have yet.
 */

export type FeedPill = { key: string; label: string; count: number }

/**
 * The most pills the row draws at rest, before `all` and the toggle.
 *
 * This is the number that actually bounds the row. The `count > 1` rule is about which pills
 * deserve to be there and bounds nothing on its own — a blog with fifty posts can have forty
 * tags used twice over. Twelve plus `all` plus the toggle is two rows in the 880px column,
 * which is what /projects already had at the head of its list.
 */
export const MAX_VISIBLE = 12

/**
 * Below this many hidden pills, the tail is drawn rather than folded.
 *
 * The toggle costs about the width of one pill, so folding two saves one — a control that
 * buys nothing and adds something to read. A fresh fork with three posts should get its three
 * tags, not a disclosure hiding them.
 */
export const MIN_FOLD = 5

/**
 * `pills` must arrive sorted by count descending — every caller sorts by `count` then name —
 * so the slice takes the most used rather than an arbitrary twelve.
 */
export function splitPills(pills: FeedPill[]): { visible: FeedPill[]; folded: FeedPill[] } {
  const grouping = pills.filter((pill) => pill.count > 1).slice(0, MAX_VISIBLE)
  const shown = new Set(grouping.map((pill) => pill.key))
  const rest = pills.filter((pill) => !shown.has(pill.key))

  return rest.length >= MIN_FOLD
    ? { visible: grouping, folded: rest }
    : { visible: pills, folded: [] }
}
