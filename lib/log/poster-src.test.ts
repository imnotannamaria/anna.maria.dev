import { describe, expect, it } from "vitest"
import { encodePosterToken, posterSrc } from "./poster-src"
import { decodePosterToken } from "@/lib/api/routes/poster"

describe("encodePosterToken / decodePosterToken round trip", () => {
  it("round-trips a plain https URL", () => {
    const url = "https://example.com/poster.jpg"
    expect(decodePosterToken(encodePosterToken(url))).toBe(url)
  })

  it("round-trips a URL whose base64 would contain + and /", () => {
    // Chosen so the un-substituted base64 alphabet actually needs both characters —
    // that's the whole reason for the -/_ substitution existing at all.
    const url = "https://example.com/poster.jpg?id=" + "a".repeat(40)
    const token = encodePosterToken(url)
    expect(token).not.toMatch(/[+/=]/)
    expect(decodePosterToken(token)).toBe(url)
  })

  it("round-trips a non-ASCII URL", () => {
    const url = "https://example.com/pôster-título.jpg"
    expect(decodePosterToken(encodePosterToken(url))).toBe(url)
  })

  it("decodePosterToken returns null for invalid base64url", () => {
    expect(decodePosterToken("not valid base64!!")).toBeNull()
  })
})

describe("posterSrc", () => {
  it("builds a local path under /api/v1/poster/", () => {
    expect(posterSrc("https://example.com/x.jpg")).toMatch(/^\/api\/v1\/poster\/[A-Za-z0-9_-]+$/)
  })
})
