import { Hono } from "hono"
import { beforeEach, describe, expect, it, vi } from "vitest"

/**
 * `buckets` lives in module scope, so every test needs a fresh module instance —
 * otherwise a request count from one test leaks into the next and either test could
 * pass or fail depending on run order. See docs/tests-plan.md, "state that outlives a
 * TRUNCATE".
 */
async function freshRateLimit() {
  vi.resetModules()
  const { rateLimit } = await import("./rate-limit")
  return rateLimit
}

beforeEach(() => {
  vi.useFakeTimers()
})

describe("rateLimit", () => {
  it("allows requests under the limit", async () => {
    const rateLimit = await freshRateLimit()
    const app = new Hono()
    app.get("/", rateLimit({ max: 3 }), (c) => c.json({ ok: true }))

    for (let i = 0; i < 3; i++) {
      const res = await app.request("/", { headers: { "x-forwarded-for": "1.2.3.4" } })
      expect(res.status).toBe(200)
    }
  })

  it("429s the request past the limit, with a retry-after header", async () => {
    const rateLimit = await freshRateLimit()
    const app = new Hono()
    app.get("/", rateLimit({ max: 2 }), (c) => c.json({ ok: true }))
    const opts = { headers: { "x-forwarded-for": "1.2.3.4" } }

    await app.request("/", opts)
    await app.request("/", opts)
    const res = await app.request("/", opts)

    expect(res.status).toBe(429)
    expect(res.headers.get("retry-after")).toBeTruthy()
  })

  it("buckets separately per custom key, not by IP", async () => {
    // This is the property poster.ts depends on: every request arrives from the same
    // loopback IP behind next/image, so an IP-keyed limiter would be one shared bucket
    // for every visitor. Keying on something else must give each key its own budget.
    const rateLimit = await freshRateLimit()
    const app = new Hono()
    app.get("/:token", rateLimit({ max: 1, key: (c) => `poster:${c.req.param("token")}` }), (c) =>
      c.json({ ok: true }),
    )
    const sameIp = { headers: { "x-forwarded-for": "9.9.9.9" } }

    const first = await app.request("/token-a", sameIp)
    const second = await app.request("/token-b", sameIp)

    expect(first.status).toBe(200)
    expect(second.status).toBe(200)
  })

  it("resets the bucket after the window elapses", async () => {
    const rateLimit = await freshRateLimit()
    const app = new Hono()
    app.get("/", rateLimit({ max: 1, windowMs: 1000 }), (c) => c.json({ ok: true }))
    const opts = { headers: { "x-forwarded-for": "1.2.3.4" } }

    const first = await app.request("/", opts)
    const blocked = await app.request("/", opts)
    vi.advanceTimersByTime(1001)
    const afterWindow = await app.request("/", opts)

    expect(first.status).toBe(200)
    expect(blocked.status).toBe(429)
    expect(afterWindow.status).toBe(200)
  })
})

describe("the bucket store", () => {
  it("forgets the oldest buckets past its ceiling, and keeps the recent ones", async () => {
    vi.resetModules()
    const { take } = await import("./rate-limit")
    const long = 60 * 60 * 1000
    // the first key is used up, then 10,500 other keys push it out of a 10,000-key store
    expect(take("first", 1, long).ok).toBe(true)
    expect(take("first", 1, long).ok).toBe(false)
    for (let i = 0; i < 10_500; i++) take(`other-${i}`, 1, long)
    expect(take("first", 1, long).ok).toBe(true)
    // a recent key is still counted: forgetting is only for the oldest
    expect(take("other-10499", 1, long).ok).toBe(false)
  })

  it("drops expired buckets first", async () => {
    vi.resetModules()
    const { take } = await import("./rate-limit")
    expect(take("stale", 1, 1000).ok).toBe(true)
    for (let i = 0; i < 9_999; i++) take(`filler-${i}`, 1, 60 * 60 * 1000)
    vi.advanceTimersByTime(2000)
    // at the ceiling, the expired one goes and the live ones stay
    take("one-more", 1, 60 * 60 * 1000)
    expect(take("filler-0", 1, 60 * 60 * 1000).ok).toBe(false)
  })
})

describe("byClient", () => {
  it("keys a route's bucket on the client, falling back to x-real-ip", async () => {
    vi.resetModules()
    const { byClient } = await import("./rate-limit")
    const key = byClient("bug")
    const ask = (headers: Record<string, string>) =>
      key({ req: { raw: new Request("http://x.test/", { headers }) } } as never)

    expect(ask({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" })).toBe("bug:1.2.3.4")
    expect(ask({ "x-real-ip": "5.6.7.8" })).toBe("bug:5.6.7.8")
    expect(ask({})).toBe("bug:unknown")
  })
})
