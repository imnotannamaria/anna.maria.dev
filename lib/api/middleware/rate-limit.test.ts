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
