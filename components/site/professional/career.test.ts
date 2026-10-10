import { describe, expect, it } from "vitest"
import { axis, period, type Entry } from "./career"

const entry = (from: Entry["from"], until: Entry["until"]): Entry => ({
  id: "x",
  org: "org",
  role: "role",
  type: "work",
  from,
  until,
  text: "",
  tags: [],
  stats: [],
})

describe("axis", () => {
  const entries = [entry([2021, 3], [2024, 6]), entry([2024, 7], null)]
  const ruler = axis(entries, [2026, 10, 10])

  it("runs from the first year to this one, in whole years", () => {
    expect(ruler.start).toBe(2021)
    expect(ruler.years).toEqual([2021, 2022, 2023, 2024, 2025, 2026])
    expect(ruler.months).toBe(72)
  })

  it("places a finished period by its months, end month included", () => {
    const { left, width } = ruler.range(entries[0])
    expect(left).toBeCloseTo((2 / 72) * 100)
    expect(width).toBeCloseTo((40 / 72) * 100)
  })

  it("runs an ongoing period up to today, not to the end of the axis", () => {
    const { left, width } = ruler.range(entries[1])
    expect(left + width).toBeCloseTo((ruler.now / 72) * 100)
    expect(left + width).toBeLessThan(100)
  })
})

describe("period", () => {
  it("names the open end", () => {
    expect(period(entry([2024, 7], null))).toBe("2024 – now")
    expect(period(entry([2024, 7], null), "present")).toBe("2024 – present")
    expect(period(entry([2021, 3], [2024, 6]))).toBe("2021 – 2024")
  })
})
