import { describe, expect, it } from "vitest"
import { formatLoggedAt } from "./date"

describe("formatLoggedAt", () => {
  it("formats an ISO date as 'Mon D, YYYY'", () => {
    expect(formatLoggedAt("2026-07-28")).toBe("Jul 28, 2026")
  })

  it("does not shift the day in a negative-offset timezone", () => {
    // The whole reason this function exists instead of `new Date(iso)`: the naive parse
    // is UTC midnight, which renders as the 27th anywhere west of UTC. Parsing the parts
    // by hand sidesteps that entirely — this assertion is the same regardless of TZ.
    const original = process.env.TZ
    process.env.TZ = "America/Los_Angeles"
    try {
      expect(formatLoggedAt("2026-07-28")).toBe("Jul 28, 2026")
    } finally {
      process.env.TZ = original
    }
  })

  it("returns the input unchanged if it doesn't parse", () => {
    expect(formatLoggedAt("not-a-date")).toBe("not-a-date")
  })

  it("pads nothing — single-digit days render without a leading zero", () => {
    expect(formatLoggedAt("2026-01-05")).toBe("Jan 5, 2026")
  })
})
