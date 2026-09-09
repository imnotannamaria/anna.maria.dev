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
 * How many pills the row draws once it folds — not a hard cap on the row. See below.
 *
 * The `count > 1` rule is about which pills deserve to be there and bounds nothing on its own:
 * a blog with fifty posts can have forty tags used twice over. Twelve is what /projects
 * already had at the head of its list, and twelve plus `all` plus the toggle is two rows in
 * the 880px column.
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
 *
 * **The row at rest peaks at `MAX_VISIBLE + MIN_FOLD - 1` = 16 pills, not 12.** `MIN_FOLD` is
 * measured against the tail, not against the row the fold would leave behind, so between 13
 * and 16 tags that all group there is no tail worth folding and every one of them renders.
 * The 17th then folds the row back down to 12 — it gets *shorter* as the data grows, which is
 * a discontinuity no one would predict from reading the two constants.
 *
 * Left alone deliberately. Removing it means either folding a tail of one — a toggle that
 * hides a single pill, which is worse than the pill — or a third constant. It needs 13 to 16
 * tags that group with almost no single-use ones, and real content is the opposite shape:
 * /projects has 12 grouping tags against a tail of 26. `feed-filter.test.ts` pins the peak so
 * this stays a known shape rather than a surprise.
 */
export function splitPills(pills: FeedPill[]): { visible: FeedPill[]; folded: FeedPill[] } {
  const grouping = pills.filter((pill) => pill.count > 1).slice(0, MAX_VISIBLE)
  const shown = new Set(grouping.map((pill) => pill.key))
  const rest = pills.filter((pill) => !shown.has(pill.key))

  return rest.length >= MIN_FOLD
    ? { visible: grouping, folded: rest }
    : { visible: pills, folded: [] }
}
