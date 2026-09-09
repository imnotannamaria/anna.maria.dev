import { describe, expect, it } from "vitest"
import { MAX_VISIBLE, MIN_FOLD, splitPills, type FeedPill } from "./feed-filter"

/** Sorted the way every caller sorts: count descending, then name. */
const pills = (spec: Record<string, number>): FeedPill[] =>
  Object.entries(spec)
    .map(([key, count]) => ({ key, label: key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))

const ones = (n: number, prefix = "tail") =>
  Object.fromEntries(Array.from({ length: n }, (_, i) => [`${prefix}${i}`, 1]))

describe("splitPills", () => {
  it("folds the tags that select exactly one item", () => {
    const { visible, folded } = splitPills(pills({ nextjs: 7, react: 4, ...ones(26) }))

    expect(visible.map((p) => p.key)).toEqual(["nextjs", "react"])
    expect(folded).toHaveLength(26)
  })

  it("draws everything when the tail is too short to be worth a toggle", () => {
    // Four one-offs, one under the threshold: folding them would save a single pill's width
    // and cost a control to read.
    const all = pills({ nextjs: 3, ...ones(MIN_FOLD - 1) })
    const { visible, folded } = splitPills(all)

    expect(visible).toEqual(all)
    expect(folded).toEqual([])
  })

  it("folds as soon as the tail reaches the threshold", () => {
    const { visible, folded } = splitPills(pills({ nextjs: 3, ...ones(MIN_FOLD) }))

    expect(visible.map((p) => p.key)).toEqual(["nextjs"])
    expect(folded).toHaveLength(MIN_FOLD)
  })

  /**
   * The case `count > 1` does not cover on its own, and the reason MAX_VISIBLE exists: a
   * mature blog where forty tags are used twice each has no tail to fold, and an unbounded
   * head is the same seven rows the fold was supposed to remove.
   */
  it("caps the visible row even when every tag groups", () => {
    const everyTagUsedTwice = Object.fromEntries(
      Array.from({ length: 40 }, (_, i) => [`pair${String(i).padStart(2, "0")}`, 2]),
    )
    const { visible, folded } = splitPills(pills(everyTagUsedTwice))

    expect(visible).toHaveLength(MAX_VISIBLE)
    expect(folded).toHaveLength(40 - MAX_VISIBLE)
  })

  it("keeps the most used pills when it caps, since the input is sorted", () => {
    const spec: Record<string, number> = {}
    for (let i = 0; i < 20; i++) spec[`tag${String(i).padStart(2, "0")}`] = 40 - i
    const { visible } = splitPills(pills(spec))

    expect(visible[0].count).toBe(40)
    expect(visible.at(-1)!.count).toBe(40 - (MAX_VISIBLE - 1))
  })

  /**
   * The peak the comment on `splitPills` describes, pinned so the claim cannot drift from the
   * code again — it already did once, in a commit message that said the row never passed 14.
   * `MIN_FOLD` is measured against the tail, so a run of tags that all group and leave no tail
   * renders in full, and the row is at its longest one tag before the fold kicks in.
   */
  it("peaks at MAX_VISIBLE + MIN_FOLD - 1 before the fold takes over", () => {
    const allGrouping = (n: number) =>
      pills(
        Object.fromEntries(
          Array.from({ length: n }, (_, i) => [`t${String(i).padStart(2, "0")}`, 2]),
        ),
      )

    const peak = MAX_VISIBLE + MIN_FOLD - 1
    expect(splitPills(allGrouping(peak)).visible).toHaveLength(peak)
    expect(splitPills(allGrouping(peak)).folded).toHaveLength(0)

    // One more, and the row drops back to the capped twelve rather than growing.
    expect(splitPills(allGrouping(peak + 1)).visible).toHaveLength(MAX_VISIBLE)
    expect(splitPills(allGrouping(peak + 1)).folded).toHaveLength(MIN_FOLD)
  })

  it("folds nothing when there is nothing to filter by", () => {
    expect(splitPills([])).toEqual({ visible: [], folded: [] })
  })

  /**
   * /log's shape: one type, used by everything. One pill, no tail, and a toggle would be
   * absurd beside it.
   */
  it("leaves a single grouping pill alone", () => {
    const all = pills({ music: 12 })
    expect(splitPills(all)).toEqual({ visible: all, folded: [] })
  })

  it("never loses or duplicates a pill", () => {
    const all = pills({ nextjs: 7, react: 4, zod: 2, ...ones(30) })
    const { visible, folded } = splitPills(all)

    const keys = [...visible, ...folded].map((p) => p.key)
    expect(new Set(keys).size).toBe(keys.length)
    expect(keys.sort()).toEqual(all.map((p) => p.key).sort())
  })
})
