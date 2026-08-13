import { describe, expect, it } from "vitest"
import { createEntry } from "./mutations"
import { getAllEntries, getPublishedEntries } from "./queries"
import type { LogEntryInput } from "./validation"

function input(overrides: Partial<LogEntryInput> = {}): LogEntryInput {
  return {
    type: "film",
    title: "Test Entry",
    loggedAt: "2026-01-01",
    ...overrides,
  }
}

describe("getPublishedEntries — the draft-leak invariant", () => {
  it("excludes a published:false entry from the public feed but not from the admin list", async () => {
    await createEntry(input({ title: "Draft", published: false }))
    await createEntry(input({ title: "Live", published: true }))

    const published = await getPublishedEntries()
    const all = await getAllEntries()

    expect(published.map((e) => e.title)).toEqual(["Live"])
    expect(all.map((e) => e.title).sort()).toEqual(["Draft", "Live"])
  })
})

describe("getPublishedEntries — ordering", () => {
  it("puts music ahead of every other type regardless of date", async () => {
    await createEntry(input({ type: "film", title: "Older Film", loggedAt: "2026-01-01" }))
    await createEntry(input({ type: "music", title: "Newer Album", loggedAt: "2026-01-02" }))

    const entries = await getPublishedEntries()
    expect(entries[0]?.title).toBe("Newer Album")
  })

  it("within a type, favourites lead and date breaks the tie", async () => {
    await createEntry(input({ type: "book", title: "Plain, later", loggedAt: "2026-01-05" }))
    await createEntry(
      input({ type: "book", title: "Favourite, earlier", loggedAt: "2026-01-01", favorite: true }),
    )

    const entries = await getPublishedEntries()
    expect(entries.map((e) => e.title)).toEqual(["Favourite, earlier", "Plain, later"])
  })
})

describe("getPublishedEntries — numeric conversion", () => {
  it("returns rating as a number, not the raw numeric string Postgres hands back", async () => {
    await createEntry(input({ rating: 4.5 }))

    const [entry] = await getPublishedEntries()
    expect(typeof entry?.rating).toBe("number")
    expect(entry?.rating).toBe(4.5)
  })

  it("returns a null rating as null, not '0' or NaN", async () => {
    await createEntry(input({ rating: undefined }))

    const [entry] = await getPublishedEntries()
    expect(entry?.rating).toBeNull()
  })
})
