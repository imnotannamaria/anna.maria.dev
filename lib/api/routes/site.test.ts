import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/log/queries", () => ({ getPublishedEntries: vi.fn() }))

import { getPublishedEntries } from "@/lib/log/queries"
import { site } from "./site"

const entries = vi.mocked(getPublishedEntries)

beforeEach(() => entries.mockReset())

describe("GET /site/log", () => {
  it("returns only what the terminal and the chat print, with the type as its label", async () => {
    entries.mockResolvedValue([
      {
        id: "1",
        type: "film",
        title: "Midnight Mass",
        creator: "Mike Flanagan",
        loggedAt: "2026-09-01",
        note: "private-ish note",
        rating: 5,
      },
    ] as never)
    const res = await site.request("/log", { headers: { "x-forwarded-for": "10.0.0.1" } })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.entries).toEqual([
      { type: "film", title: "Midnight Mass", creator: "Mike Flanagan", loggedAt: "2026-09-01" },
    ])
  })

  it("limits one caller without touching another", async () => {
    entries.mockResolvedValue([])
    const from = (ip: string) => site.request("/log", { headers: { "x-forwarded-for": ip } })
    for (let i = 0; i < 30; i++) expect((await from("10.0.0.2")).status).toBe(200)
    expect((await from("10.0.0.2")).status).toBe(429)
    expect((await from("10.0.0.3")).status).toBe(200)
  })
})

it("localizes the type as well as the title for the Portuguese sides", async () => {
  entries.mockResolvedValue([
    { type: "film", title: "A film", titlePt: "Um filme", creator: "Anna", loggedAt: "2026-10-16" },
  ] as never)
  const res = await site.request("/log?lang=pt", { headers: { "x-forwarded-for": "10.0.0.4" } })
  expect((await res.json()).entries[0]).toMatchObject({ type: "filme", title: "Um filme" })
})
