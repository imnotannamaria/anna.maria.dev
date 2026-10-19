import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("@/lib/memory/scores", () => ({
  startRound: vi.fn(),
  finishRound: vi.fn(),
  claimRound: vi.fn(),
  getBoard: vi.fn(),
}))
vi.mock("@/lib/memory/notify", () => ({ notifyRecord: vi.fn() }))

import { notifyRecord } from "@/lib/memory/notify"
import { claimRound, finishRound, getBoard, startRound } from "@/lib/memory/scores"
import { memory } from "./memory"

const ID = "3f0c1f0e-7a55-4c1d-9b55-0d7b1a3d2e11"
const URL_BEFORE = process.env.DATABASE_URL

let ip = 0
const post = (path: string, body: unknown) =>
  memory.request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": `203.0.113.${(ip += 1)}` },
    body: typeof body === "string" ? body : JSON.stringify(body),
  })

beforeEach(() => {
  process.env.DATABASE_URL = "postgres://test"
  vi.mocked(startRound).mockReset().mockResolvedValue(ID)
  vi.mocked(finishRound).mockReset().mockResolvedValue({ ms: 30_000, rank: 2, qualifies: true })
  vi.mocked(claimRound)
    .mockReset()
    .mockResolvedValue({ id: ID, name: "Anna", ms: 30_000, moves: 14, rank: 2 })
  vi.mocked(notifyRecord).mockReset()
  vi.mocked(getBoard).mockReset().mockResolvedValue([])
})
afterEach(() => {
  if (URL_BEFORE === undefined) delete process.env.DATABASE_URL
  else process.env.DATABASE_URL = URL_BEFORE
})

describe("the memory board's routes", () => {
  it("starts a round", async () => {
    const res = await post("/start", "")
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ id: ID })
  })

  it("finishes one with the server's time and says if it makes the board", async () => {
    const res = await post("/finish", { id: ID, moves: 14 })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ms: 30_000, rank: 2, qualifies: true })
    expect(finishRound).toHaveBeenCalledWith(ID, 14)
  })

  it("404s a round that is not open", async () => {
    vi.mocked(finishRound).mockResolvedValue(null)
    expect((await post("/finish", { id: ID, moves: 14 })).status).toBe(404)
  })

  it.each([
    ["a time from the page", { id: ID, moves: 14, ms: 900 }],
    ["too few moves", { id: ID, moves: 3 }],
    ["something that is not JSON", "{nope"],
  ])("refuses %s before touching the database", async (_label, body) => {
    expect((await post("/finish", body)).status).toBe(400)
    expect(finishRound).not.toHaveBeenCalled()
  })

  it("takes a name, and says what was wrong with a bad one", async () => {
    expect((await post("/claim", { id: ID, name: "Anna" })).status).toBe(201)
    expect(claimRound).toHaveBeenCalledWith(ID, "Anna")
    // Anna hears about it, with a link to where she approves it
    expect(notifyRecord).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Anna", rank: 2, ms: 30_000 }),
    )

    const res = await post("/claim", { id: ID, name: "visite meusite.com" })
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: "invalid", issue: "link" })
  })

  it("answers 503 with no database, and leaks nothing when it fails", async () => {
    delete process.env.DATABASE_URL
    delete process.env.WRISTKIT_DATABASE_URL
    expect((await post("/start", "")).status).toBe(503)

    process.env.DATABASE_URL = "postgres://test"
    vi.mocked(getBoard).mockRejectedValue(new Error("secret connection string"))
    const res = await memory.request("/board")
    expect(res.status).toBe(503)
    expect(await res.text()).not.toContain("secret")
  })

  it("limits names per address", async () => {
    const same = () =>
      memory.request("/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "198.51.100.77" },
        body: JSON.stringify({ id: ID, name: "Anna" }),
      })
    const codes = []
    for (let i = 0; i < 6; i++) codes.push((await same()).status)
    expect(codes.slice(0, 5).every((code) => code === 201)).toBe(true)
    expect(codes[5]).toBe(429)
  })
})
