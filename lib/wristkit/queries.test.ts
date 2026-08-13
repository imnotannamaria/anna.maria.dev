import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { startOfToday } from "./queries"

describe("startOfToday", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("returns local midnight in a negative-offset timezone", () => {
    // 2026-03-15T10:00:00-03:00 (Sao Paulo) is still the 15th locally.
    vi.setSystemTime(new Date("2026-03-15T13:00:00Z"))
    const midnight = startOfToday("America/Sao_Paulo")
    const local = midnight.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    expect(local.startsWith("3/15/2026")).toBe(true)
    expect(local.includes("12:00:00 AM")).toBe(true)
  })

  it("returns local midnight in UTC", () => {
    vi.setSystemTime(new Date("2026-03-15T13:00:00Z"))
    const midnight = startOfToday("UTC")
    expect(midnight.toISOString()).toBe("2026-03-15T00:00:00.000Z")
  })

  it("returns local midnight in a positive-offset timezone", () => {
    // 2026-03-16T01:00:00+09:00 (Tokyo) is already the 16th locally, one hour past
    // midnight — this is the case that would come back wrong if UTC midnight were used
    // instead of the timezone's own midnight.
    vi.setSystemTime(new Date("2026-03-15T16:00:00Z"))
    const midnight = startOfToday("Asia/Tokyo")
    const local = midnight.toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
    expect(local.startsWith("3/16/2026")).toBe(true)
    expect(local.includes("12:00:00 AM")).toBe(true)
  })

  it("stays on the same local day just before local midnight", () => {
    // 2026-03-15T23:59:00-03:00 — one minute before Sao Paulo rolls to the 16th.
    vi.setSystemTime(new Date("2026-03-16T02:59:00Z"))
    const midnight = startOfToday("America/Sao_Paulo")
    const local = midnight.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    expect(local.startsWith("3/15/2026")).toBe(true)
  })
})
