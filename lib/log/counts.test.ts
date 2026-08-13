import { describe, expect, it } from "vitest"
import { countByType, typeBreakdown } from "./counts"
import type { LogEntry } from "./validation"

function entry(type: LogEntry["type"]): LogEntry {
  return {
    id: type,
    slug: type,
    type,
    title: type,
    creator: null,
    year: null,
    rating: null,
    favorite: false,
    note: null,
    posterUrl: null,
    externalUrl: null,
    loggedAt: "2026-01-01",
    published: true,
  }
}

describe("countByType", () => {
  it("counts entries per type and omits types with none", () => {
    const counts = countByType([entry("film"), entry("film"), entry("book")])
    expect(counts).toEqual({ film: 2, book: 1 })
    expect(counts.music).toBeUndefined()
  })
})

describe("typeBreakdown", () => {
  it("orders by LOG_TYPES and drops zero-count types", () => {
    // LOG_TYPES = ["film", "series", "book", "music", "podcast", "game"]
    const breakdown = typeBreakdown([entry("game"), entry("film"), entry("film")])
    expect(breakdown).toEqual([
      { type: "film", count: 2 },
      { type: "game", count: 1 },
    ])
  })
})
