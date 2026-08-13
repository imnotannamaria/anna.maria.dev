import { describe, expect, it } from "vitest"
import { slugify, uniqueSlug } from "./slug"

describe("slugify", () => {
  it("strips accents instead of dropping the letter", () => {
    expect(slugify("Amélie")).toBe("amelie")
  })

  it("appends the year when given one", () => {
    expect(slugify("Dune: Part Two", 2024)).toBe("dune-part-two-2024")
  })

  it("collapses non-alphanumerics into single dashes", () => {
    expect(slugify("Everything Everywhere All at Once")).toBe("everything-everywhere-all-at-once")
  })

  it("returns an empty string for a title that is only punctuation", () => {
    expect(slugify("!!!")).toBe("")
  })

  it("truncates to 120 chars without leaving a trailing dash", () => {
    const long = "word ".repeat(40) // 200 chars, well past the limit
    const result = slugify(long)
    expect(result.length).toBeLessThanOrEqual(120)
    expect(result.endsWith("-")).toBe(false)
  })
})

describe("uniqueSlug", () => {
  it("returns the candidate unchanged when it's free", () => {
    expect(uniqueSlug("dune", [])).toBe("dune")
  })

  it("bumps to -2 on a single collision", () => {
    expect(uniqueSlug("dune", ["dune"])).toBe("dune-2")
  })

  it("bumps to -3 when -2 is also taken", () => {
    expect(uniqueSlug("dune", ["dune", "dune-2"])).toBe("dune-3")
  })

  it("falls back to a timestamp suffix after 1000 collisions", () => {
    const taken = ["dune", ...Array.from({ length: 999 }, (_, i) => `dune-${i + 2}`)]
    const result = uniqueSlug("dune", taken)
    expect(result.startsWith("dune-")).toBe(true)
    expect(taken.includes(result)).toBe(false)
  })
})
