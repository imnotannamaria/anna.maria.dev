import { describe, expect, it } from "vitest"
import { logEntryInputSchema } from "./validation"

function base() {
  return {
    type: "film" as const,
    title: "Dune",
    loggedAt: "2026-01-01",
  }
}

describe("logEntryInputSchema — externalUrl", () => {
  it("rejects a javascript: URL", () => {
    // The card's stretched link uses this as an href verbatim. .url() alone accepts
    // javascript:, which becomes stored XSS the moment the card renders.
    const result = logEntryInputSchema.safeParse({ ...base(), externalUrl: "javascript:alert(1)" })
    expect(result.success).toBe(false)
  })

  it("rejects a plain http:// URL", () => {
    const result = logEntryInputSchema.safeParse({ ...base(), externalUrl: "http://example.com" })
    expect(result.success).toBe(false)
  })

  it("accepts an https:// URL", () => {
    const result = logEntryInputSchema.safeParse({ ...base(), externalUrl: "https://example.com" })
    expect(result.success).toBe(true)
  })

  it("accepts an empty string as 'not set'", () => {
    const result = logEntryInputSchema.safeParse({ ...base(), externalUrl: "" })
    expect(result.success).toBe(true)
  })
})

describe("logEntryInputSchema — posterUrl", () => {
  it("rejects a javascript: URL", () => {
    const result = logEntryInputSchema.safeParse({ ...base(), posterUrl: "javascript:alert(1)" })
    expect(result.success).toBe(false)
  })

  it("rejects http://", () => {
    const result = logEntryInputSchema.safeParse({
      ...base(),
      posterUrl: "http://example.com/x.jpg",
    })
    expect(result.success).toBe(false)
  })

  it("accepts https://", () => {
    const result = logEntryInputSchema.safeParse({
      ...base(),
      posterUrl: "https://example.com/x.jpg",
    })
    expect(result.success).toBe(true)
  })
})

describe("logEntryInputSchema — rating", () => {
  it("accepts half-star values", () => {
    expect(logEntryInputSchema.safeParse({ ...base(), rating: 4.5 }).success).toBe(true)
  })

  it("accepts whole-star values", () => {
    expect(logEntryInputSchema.safeParse({ ...base(), rating: 3 }).success).toBe(true)
  })

  it("rejects a rating that isn't a half-step", () => {
    expect(logEntryInputSchema.safeParse({ ...base(), rating: 4.3 }).success).toBe(false)
  })

  it("rejects below the half-star minimum", () => {
    expect(logEntryInputSchema.safeParse({ ...base(), rating: 0 }).success).toBe(false)
  })

  it("rejects above five", () => {
    expect(logEntryInputSchema.safeParse({ ...base(), rating: 5.5 }).success).toBe(false)
  })
})

describe("logEntryInputSchema — slug", () => {
  it("accepts an empty string as 'not set'", () => {
    expect(logEntryInputSchema.safeParse({ ...base(), slug: "" }).success).toBe(true)
  })

  it("accepts a well-formed slug", () => {
    expect(logEntryInputSchema.safeParse({ ...base(), slug: "dune-2024" }).success).toBe(true)
  })

  it("rejects uppercase or spaces", () => {
    expect(logEntryInputSchema.safeParse({ ...base(), slug: "Dune 2024" }).success).toBe(false)
  })
})

describe("logEntryInputSchema — required fields", () => {
  it("rejects an empty title", () => {
    expect(logEntryInputSchema.safeParse({ ...base(), title: "" }).success).toBe(false)
  })

  it("rejects a loggedAt that isn't YYYY-MM-DD", () => {
    expect(logEntryInputSchema.safeParse({ ...base(), loggedAt: "01/01/2026" }).success).toBe(false)
  })

  it("rejects an unknown type", () => {
    expect(logEntryInputSchema.safeParse({ ...base(), type: "painting" }).success).toBe(false)
  })
})
