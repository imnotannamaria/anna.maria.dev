import { describe, expect, it } from "vitest"
import { CAREER_START_YEAR, calcYearsOfExp, yearsWord } from "./experience"

describe("calcYearsOfExp", () => {
  it("counts from the day the career started, not from the calendar year", () => {
    expect(calcYearsOfExp(new Date(2026, 2, 14))).toBe(4)
    expect(calcYearsOfExp(new Date(2026, 2, 15))).toBe(5)
    expect(calcYearsOfExp(new Date(2026, 9, 11))).toBe(5)
    expect(calcYearsOfExp(new Date(2027, 2, 15))).toBe(6)
  })

  it("never goes below zero", () => {
    expect(calcYearsOfExp(new Date(2020, 0, 1))).toBe(0)
  })
})

describe("yearsWord", () => {
  it("spells the count out, and falls back to digits past ten", () => {
    expect(yearsWord(5)).toBe("Five")
    expect(yearsWord(14)).toBe("14")
  })
})

describe("CAREER_START_YEAR", () => {
  it("is the year the home's sum subtracts", () => {
    expect(CAREER_START_YEAR).toBe(2021)
  })
})
