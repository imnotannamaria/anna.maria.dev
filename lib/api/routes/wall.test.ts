import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("@/lib/wall/mutations", () => ({ react: vi.fn() }))

import { react } from "@/lib/wall/mutations"
import { wall } from "./wall"

const reacted = vi.mocked(react)
const ID = "3f0c1f0e-7a55-4c1d-9b55-0d7b1a3d2e11"
const counts = { heart: 2, clap: 0, party: 0, up: 1 }

let ip = 0
const post = (id: string, body: unknown) =>
  wall.request(`/${id}/react`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": `198.51.100.${(ip += 1)}` },
    body: typeof body === "string" ? body : JSON.stringify(body),
  })

// braces on purpose: a function returned from beforeEach is run as its cleanup
beforeEach(() => {
  reacted.mockReset().mockResolvedValue(counts)
})

describe("POST /wall/:id/react", () => {
  it("counts a reaction and answers with the new counts", async () => {
    const res = await post(ID, { reaction: "heart", on: true })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ reactions: counts })
    expect(reacted).toHaveBeenCalledWith(ID, "heart", true)
  })

  it.each([
    ["an emoji that is not one of the four", { reaction: "poop", on: true }],
    ["a count instead of a switch", { reaction: "heart", on: 500 }],
    ["an extra field", { reaction: "heart", on: true, count: 99 }],
    ["something that is not JSON", "{nope"],
  ])("refuses %s before touching the database", async (_name, body) => {
    expect((await post(ID, body)).status).toBe(400)
    expect(reacted).not.toHaveBeenCalled()
  })

  it("404s a letter that is not on the wall", async () => {
    reacted.mockResolvedValue(null)
    expect((await post(ID, { reaction: "up", on: true })).status).toBe(404)
  })

  it("says so when the database does not answer, and leaks nothing", async () => {
    reacted.mockRejectedValue(new Error("secret connection string"))
    const res = await post(ID, { reaction: "up", on: true })
    expect(res.status).toBe(503)
    expect(await res.text()).not.toContain("secret")
  })

  it("stops an address that keeps clicking", async () => {
    const same = () =>
      wall.request(`/${ID}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.200" },
        body: JSON.stringify({ reaction: "heart", on: true }),
      })
    let last = 200
    for (let click = 0; click < 41; click++) last = (await same()).status
    expect(last).toBe(429)
  })
})
