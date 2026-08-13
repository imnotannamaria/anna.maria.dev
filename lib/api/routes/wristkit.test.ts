import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { wristkit } from "./wristkit"

const ORIGINAL_KEY = process.env.WRISTKIT_API_KEY
beforeAll(() => {
  process.env.WRISTKIT_API_KEY = "test-wristkit-key"
})
afterAll(() => {
  if (ORIGINAL_KEY === undefined) delete process.env.WRISTKIT_API_KEY
  else process.env.WRISTKIT_API_KEY = ORIGINAL_KEY
})

const validPayload = { steps: 100, moveKcal: 50, exerciseMin: 10 }

describe("wristkit — the ordering comment: rate limit, headers, key, then parse", () => {
  it("401s a missing/wrong API key before the payload is validated", async () => {
    const res = await wristkit.request("/sync", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ garbage: true }), // would fail zod too — key check wins first
    })
    expect(res.status).toBe(401)
  })

  it("415s a missing content-type even with the right key — jsonBody runs before apiKeyAuth", async () => {
    const res = await wristkit.request("/sync", {
      method: "POST",
      headers: { "x-api-key": "test-wristkit-key" },
      body: JSON.stringify(validPayload),
    })
    expect(res.status).toBe(415)
  })

  it("400s an authenticated request with a payload zod rejects", async () => {
    const res = await wristkit.request("/sync", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": "test-wristkit-key" },
      body: JSON.stringify({ steps: -1, moveKcal: 50, exerciseMin: 10 }),
    })
    expect(res.status).toBe(400)
  })

  it("rejects a payload with an extra field — the schema is .strict()", async () => {
    const res = await wristkit.request("/sync", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": "test-wristkit-key" },
      body: JSON.stringify({ ...validPayload, extra: 1 }),
    })
    expect(res.status).toBe(400)
  })
})
