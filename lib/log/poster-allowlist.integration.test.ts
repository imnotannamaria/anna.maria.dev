import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createEntry } from "./mutations"
import type { LogEntryInput } from "./validation"

/**
 * poster-allowlist.ts caches known URLs in module scope (TTL_MS = 60s) and rate-limits its
 * own re-reads (MIN_REFRESH_MS = 5s) in a second module-scope variable. Neither survives a
 * `TRUNCATE`, and neither should leak between tests here — every test gets an isolated
 * module instance. See docs/tests-plan.md, "state that outlives a TRUNCATE".
 */
async function freshAllowlist() {
  vi.resetModules()
  const { isKnownPosterUrl } = await import("./poster-allowlist")
  return isKnownPosterUrl
}

function input(overrides: Partial<LogEntryInput> = {}): LogEntryInput {
  return { type: "film", title: "Test Entry", loggedAt: "2026-01-01", ...overrides }
}

// Faking only Date (not setTimeout/setInterval) is deliberate: postgres.js relies on real
// timers internally for its connection handling, and a full vi.useFakeTimers() freezes
// those too, which hangs every query against the real container until the test times out.
beforeEach(() => vi.useFakeTimers({ toFake: ["Date"] }))
afterEach(() => vi.useRealTimers())

describe("isKnownPosterUrl — the poster proxy's entire authorization check", () => {
  it("is true for a URL saved on a real entry", async () => {
    await createEntry(input({ posterUrl: "https://example.com/saved.jpg" }))
    const isKnownPosterUrl = await freshAllowlist()

    expect(await isKnownPosterUrl("https://example.com/saved.jpg")).toBe(true)
  })

  it("is false for a URL nobody saved, even a plausible-looking one", async () => {
    await createEntry(input({ posterUrl: "https://example.com/saved.jpg" }))
    const isKnownPosterUrl = await freshAllowlist()

    expect(await isKnownPosterUrl("https://example.com/unsaved.jpg")).toBe(false)
  })

  it("matches the exact string, not just the host", async () => {
    await createEntry(input({ posterUrl: "https://example.com/saved.jpg" }))
    const isKnownPosterUrl = await freshAllowlist()

    expect(await isKnownPosterUrl("https://example.com/other-path.jpg")).toBe(false)
  })
})

describe("isKnownPosterUrl — cache timing", () => {
  it("sees a poster saved a few seconds ago, via the miss re-read", async () => {
    const isKnownPosterUrl = await freshAllowlist()

    // First call: lastRefresh starts at 0, so this miss re-reads immediately (an empty
    // allowlist, since the entry doesn't exist yet) and sets lastRefresh to now — which
    // means a *second* miss inside the next MIN_REFRESH_MS is guarded, not re-read. See
    // the next test for that half. This test moves past the guard first, the way a
    // poster saved "a few seconds ago" (the docstring's own phrase) actually would.
    expect(await isKnownPosterUrl("https://example.com/new.jpg")).toBe(false)

    await createEntry(input({ posterUrl: "https://example.com/new.jpg" }))
    vi.advanceTimersByTime(5_001)

    expect(await isKnownPosterUrl("https://example.com/new.jpg")).toBe(true)
  })

  it("does not re-read on a second miss inside MIN_REFRESH_MS", async () => {
    const isKnownPosterUrl = await freshAllowlist()

    expect(await isKnownPosterUrl("https://example.com/a.jpg")).toBe(false) // populates + misses + re-reads
    await createEntry(input({ posterUrl: "https://example.com/a.jpg" }))

    // Same token, immediately after the row now exists: if the guard didn't hold, this
    // would re-read and see it (true). MIN_REFRESH_MS hasn't elapsed since the first
    // miss's re-read, so it must still answer false without touching the database —
    // this is the check that stops a loop of random tokens from being one query each.
    expect(await isKnownPosterUrl("https://example.com/a.jpg")).toBe(false)

    vi.advanceTimersByTime(5_001)

    // Now MIN_REFRESH_MS has elapsed: a miss re-reads and finds it.
    expect(await isKnownPosterUrl("https://example.com/a.jpg")).toBe(true)
  })
})
