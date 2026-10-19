import { beforeAll, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

/**
 * Everything the route checks before it reads the database or the body. No database here:
 * the unit project runs without one, which is also what a link to nowhere looks like.
 */
beforeAll(() => {
  delete process.env.DATABASE_URL
  delete process.env.WRISTKIT_DATABASE_URL
})

const TOKEN = "a".repeat(43)

async function loadRoute() {
  const { wallInvite } = await import("./wall-invite")
  return wallInvite
}

function form(fields: Record<string, string>) {
  const body = new FormData()
  for (const [key, value] of Object.entries(fields)) body.set(key, value)
  return body
}

describe("POST /invite/:token", () => {
  it("404s anything that is not shaped like a token, before any query", async () => {
    const route = await loadRoute()
    const res = await route.request("/not-a-token", { method: "POST", body: form({}) })
    expect(res.status).toBe(404)
  })

  it("refuses a body that is not a form", async () => {
    const route = await loadRoute()
    const res = await route.request(`/${TOKEN}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    })
    expect(res.status).toBe(415)
  })

  it("refuses a declared size past the cap without reading it", async () => {
    const route = await loadRoute()
    const res = await route.request(`/${TOKEN}`, {
      method: "POST",
      headers: {
        "content-type": "multipart/form-data; boundary=x",
        "content-length": String(3 * 1024 * 1024),
      },
      body: "--x--",
    })
    expect(res.status).toBe(413)
  })

  it("404s a well-formed token that opens nothing", async () => {
    const route = await loadRoute()
    const res = await route.request(`/${TOKEN}`, { method: "POST", body: form({ name: "x" }) })
    expect(res.status).toBe(404)
  })
})
