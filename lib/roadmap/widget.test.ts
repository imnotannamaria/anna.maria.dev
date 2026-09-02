import { describe, expect, it } from "vitest"
import { roadmapSlice, MOVING_ROWS, QUEUED_ROWS, SHIPPED_ROWS } from "./widget"
import type { RoadmapItem, RoadmapStatus } from "./validation"

function item(id: string, status: RoadmapStatus, extra: Partial<RoadmapItem> = {}): RoadmapItem {
  return {
    id,
    slug: id,
    title: id,
    blurb: null,
    status,
    position: 0,
    planUrl: null,
    shippedAt: null,
    ...extra,
  }
}

describe("roadmapSlice", () => {
  it("reads downwards in the order the work happened", () => {
    const slice = roadmapSlice([
      item("queued", "todo"),
      item("moving", "doing"),
      item("landed", "done", { shippedAt: "2026-08-29" }),
    ])

    expect(slice.rows.map((r) => r.id)).toEqual(["landed", "moving", "queued"])
  })

  it("takes the most recently shipped, oldest of those first", () => {
    const slice = roadmapSlice([
      item("jan", "done", { shippedAt: "2026-01-01" }),
      item("aug", "done", { shippedAt: "2026-08-01" }),
      item("sep", "done", { shippedAt: "2026-09-01" }),
    ])

    // The two newest, then reversed — so the card reads august, september, downwards.
    expect(slice.rows.map((r) => r.id)).toEqual(["aug", "sep"])
  })

  it("sorts undated shipped rows last, so months-old work never leads", () => {
    const slice = roadmapSlice([
      item("undated", "done"),
      item("recent", "done", { shippedAt: "2026-08-29" }),
      item("older", "done", { shippedAt: "2026-08-01" }),
    ])

    expect(slice.rows.map((r) => r.id)).toEqual(["older", "recent"])
  })

  it("caps every column, so the card's height does not follow the data", () => {
    const many = [
      ...Array.from({ length: 9 }, (_, i) =>
        item(`done-${i}`, "done", { shippedAt: `2026-0${(i % 9) + 1}-01` }),
      ),
      ...Array.from({ length: 8 }, (_, i) => item(`doing-${i}`, "doing")),
      ...Array.from({ length: 7 }, (_, i) => item(`todo-${i}`, "todo")),
    ]

    const slice = roadmapSlice(many)

    expect(slice.rows).toHaveLength(SHIPPED_ROWS + MOVING_ROWS + QUEUED_ROWS)
    expect(slice.total).toBe(24)
    expect(slice.hidden).toBe(24 - slice.rows.length)
  })

  it("never reports a negative remainder when everything fits", () => {
    const slice = roadmapSlice([item("only", "doing")])

    expect(slice.rows.map((r) => r.id)).toEqual(["only"])
    expect(slice.hidden).toBe(0)
  })

  it("drops raw, which is not a promise and so is not a total", () => {
    const slice = roadmapSlice([item("thought", "raw"), item("real", "todo")])

    expect(slice.rows.map((r) => r.id)).toEqual(["real"])
    expect(slice.total).toBe(1)
  })

  it("holds up with nothing on the board", () => {
    const slice = roadmapSlice([])

    expect(slice).toEqual({
      rows: [],
      counts: { todo: 0, doing: 0, done: 0 },
      total: 0,
      hidden: 0,
    })
  })
})
