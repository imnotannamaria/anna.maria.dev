import { Hono } from "hono"
import { afterEach, describe, expect, it } from "vitest"
import { apiKeyAuth } from "./api-key"

const ORIGINAL = process.env.TEST_API_KEY

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.TEST_API_KEY
  else process.env.TEST_API_KEY = ORIGINAL
})

function appWithKey() {
  const app = new Hono()
  app.get("/", apiKeyAuth("TEST_API_KEY"), (c) => c.json({ ok: true }))
  return app
}

describe("apiKeyAuth", () => {
  it("passes with the right key", async () => {
    process.env.TEST_API_KEY = "correct-horse-battery-staple"
    const res = await appWithKey().request("/", {
      headers: { "x-api-key": "correct-horse-battery-staple" },
    })
    expect(res.status).toBe(200)
  })

  it("rejects a wrong key of the same length", async () => {
    // The one most worth having: a naive rewrite to `===` would pass every other case
    // here and only regress the constant-time property. Same length forces the
    // comparison down the timingSafeEqual path instead of the early length check.
    process.env.TEST_API_KEY = "correct-horse-battery-staple"
    const res = await appWithKey().request("/", {
      headers: { "x-api-key": "wrong-horse-battery-staple!!" },
    })
    expect(res.status).toBe(401)
  })

  it("rejects a wrong key of a different length", async () => {
    process.env.TEST_API_KEY = "correct-horse-battery-staple"
    const res = await appWithKey().request("/", { headers: { "x-api-key": "short" } })
    expect(res.status).toBe(401)
  })

  it("rejects a missing header", async () => {
    process.env.TEST_API_KEY = "correct-horse-battery-staple"
    const res = await appWithKey().request("/")
    expect(res.status).toBe(401)
  })

  it("rejects everyone when the env var isn't set", async () => {
    delete process.env.TEST_API_KEY
    const res = await appWithKey().request("/", { headers: { "x-api-key": "" } })
    expect(res.status).toBe(401)
  })
})
