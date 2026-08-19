import { describe, expect, it } from "vitest"
import { composite, contrastRatio, flatten, parseRgb, wcagGrade } from "./color-contrast"

const rgb = (r: number, g: number, b: number, a = 1) => ({ r, g, b, a })

describe("parseRgb", () => {
  it("reads both forms getComputedStyle returns", () => {
    expect(parseRgb("rgb(255, 255, 255)")).toEqual(rgb(255, 255, 255))
    expect(parseRgb("rgb(169 139 245 / 0.35)")).toEqual(rgb(169, 139, 245, 0.35))
    expect(parseRgb("rgba(0, 0, 0, 0.6)")).toEqual(rgb(0, 0, 0, 0.6))
  })

  it("returns null for something that is not a colour", () => {
    // What a custom property hands back when it is never read through a probe element: the
    // token text, substituted but unevaluated. If this ever parses, the probe was skipped.
    expect(parseRgb("color-mix(in srgb, #7c6bff 35%, transparent)")).toBeNull()
  })
})

describe("contrastRatio", () => {
  it("puts black on white at the top of the scale", () => {
    expect(contrastRatio(rgb(0, 0, 0), rgb(255, 255, 255))).toBeCloseTo(21, 5)
  })

  it("puts a colour against itself at the bottom", () => {
    expect(contrastRatio(rgb(124, 107, 255), rgb(124, 107, 255))).toBeCloseTo(1, 5)
  })

  it("does not care which way round the arguments go", () => {
    const a = rgb(250, 250, 250)
    const b = rgb(9, 9, 11)
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 10)
  })
})

describe("compositing", () => {
  it("leaves an opaque colour alone", () => {
    expect(composite(rgb(10, 20, 30), rgb(255, 255, 255))).toEqual(rgb(10, 20, 30))
  })

  it("returns the backdrop when the top layer is fully transparent", () => {
    expect(composite(rgb(255, 0, 0, 0), rgb(9, 9, 11))).toEqual(rgb(9, 9, 11))
  })

  /**
   * The case the whole helper exists for. `--fg-brand-on-tint` sits on `--bg-surface-brand`,
   * which is the brand at 15% over `--bg-canvas` — a third colour that is neither. Measured
   * against the raw canvas the ink reads 4.44 and fails; against the composited tint it reads
   * the 6.33 the table in globals.css records.
   */
  it("matches the measured entrepta-dark row once the tint is flattened", () => {
    const canvas = rgb(9, 9, 11) // --bg-canvas
    const tint = rgb(124, 107, 255, 0.15) // --bg-surface-brand
    const ink = rgb(155, 142, 255) // --fg-brand-on-tint

    const pill = flatten([tint, canvas])
    const onTint = contrastRatio(ink, pill)
    const onCanvas = contrastRatio(ink, canvas)

    expect(onTint).toBeGreaterThan(6)
    expect(onTint).toBeLessThan(6.7)
    // Measuring against the canvas instead would report a different, wrong number.
    expect(Math.abs(onCanvas - onTint)).toBeGreaterThan(0.2)
  })
})

describe("wcagGrade", () => {
  it("grades against the right threshold for the text size", () => {
    expect(wcagGrade(7.1)).toBe("AAA")
    expect(wcagGrade(4.6)).toBe("AA")
    expect(wcagGrade(3.2)).toBe("fail")
    expect(wcagGrade(3.2, true)).toBe("AA")
  })
})
