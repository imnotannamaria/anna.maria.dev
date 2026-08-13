import { describe, expect, it } from "vitest"
import { starLabel, starString } from "./stars"

describe("starString", () => {
  it("draws a half star for a .5 rating", () => {
    expect(starString(4.5)).toBe("★★★★½")
  })

  it("draws whole stars only for an integer rating", () => {
    expect(starString(3)).toBe("★★★")
  })

  it("returns an empty string for null", () => {
    expect(starString(null)).toBe("")
  })

  it("returns an empty string for 0", () => {
    expect(starString(0)).toBe("")
  })
})

describe("starLabel", () => {
  it("never returns a bare glyph — always words a screen reader can say", () => {
    expect(starLabel(4.5)).toBe("4.5 out of 5")
    expect(starLabel(null)).toBe("not rated")
  })
})
