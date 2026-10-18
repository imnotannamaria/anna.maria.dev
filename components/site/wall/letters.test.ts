import { expect, it } from "vitest"
import { monthLabel } from "./letters"

it("formats the same month in the language of the page", () => {
  expect(monthLabel("2026-10", "pt")).toMatch(/out/i)
  expect(monthLabel("2026-10", "en")).toMatch(/oct/i)
  expect(monthLabel("2026-01", "pt")).toContain("2026")
  expect(monthLabel("2026-13", "pt")).toBeUndefined()
})
