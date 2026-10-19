import { afterEach, beforeEach, expect, it, vi } from "vitest"
vi.mock("@/lib/db/client", () => ({ dbUrl: vi.fn(), createDb: vi.fn() }))
import { dbUrl, createDb } from "./client"
import { getPublishedEntries } from "@/lib/log/queries"
import { getApprovedTestimonials } from "@/lib/wall/queries"

beforeEach(() => vi.resetAllMocks())
afterEach(() => vi.restoreAllMocks())

for (const [name, read] of [
  ["log", getPublishedEntries],
  ["wall", getApprovedTestimonials],
] as const) {
  it(`${name}: missing config is unavailable, not an empty successful read`, async () => {
    vi.mocked(dbUrl).mockReturnValue(null)
    await expect(read()).rejects.toThrow("Database unavailable")
    expect(createDb).not.toHaveBeenCalled()
  })
  it(`${name}: a connection failure remains distinguishable from a valid empty result`, async () => {
    vi.mocked(dbUrl).mockReturnValue("test")
    const select = vi.fn(() => {
      throw new Error("connection failed")
    })
    vi.mocked(createDb).mockReturnValue({ db: { select } } as never)
    await expect(read()).rejects.toThrow("connection failed")
  })
  it(`${name}: an available database with no rows is empty`, async () => {
    vi.mocked(dbUrl).mockReturnValue("test")
    const query = { from: vi.fn(), where: vi.fn(), orderBy: vi.fn().mockResolvedValue([]) }
    query.from.mockReturnValue(query)
    query.where.mockReturnValue(query)
    vi.mocked(createDb).mockReturnValue({ db: { select: () => query } } as never)
    await expect(read()).resolves.toEqual([])
  })
}
