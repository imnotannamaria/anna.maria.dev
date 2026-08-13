import { describe, expect, it } from "vitest"
import { createEntry, deleteEntry, updateEntry } from "./mutations"
import { getEntryById } from "./queries"
import type { LogEntryInput } from "./validation"

function input(overrides: Partial<LogEntryInput> = {}): LogEntryInput {
  return {
    type: "film",
    title: "Test Entry",
    loggedAt: "2026-01-01",
    ...overrides,
  }
}

describe("createEntry", () => {
  it("stores blank optional fields as null, not empty strings", async () => {
    const created = await createEntry(
      input({ creator: "", note: "", posterUrl: "", externalUrl: "" }),
    )
    const entry = await getEntryById(created.id)

    expect(entry?.creator).toBeNull()
    expect(entry?.note).toBeNull()
    expect(entry?.posterUrl).toBeNull()
    expect(entry?.externalUrl).toBeNull()
  })

  it("derives the slug from title + year when none is given", async () => {
    const created = await createEntry(input({ title: "Dune: Part Two", year: 2024 }))
    expect(created.slug).toBe("dune-part-two-2024")
  })

  it("resolves a slug collision end to end", async () => {
    // uniqueSlug() alone only proves the algorithm; this proves the unique index it's
    // standing in front of is what a collision would otherwise hit.
    const first = await createEntry(input({ title: "Dune", year: 2024 }))
    const second = await createEntry(input({ title: "Dune", year: 2024 }))

    expect(first.slug).toBe("dune-2024")
    expect(second.slug).toBe("dune-2024-2")
  })

  it("defaults favorite to false and published to true when omitted", async () => {
    const created = await createEntry(input())
    const entry = await getEntryById(created.id)

    expect(entry?.favorite).toBe(false)
    expect(entry?.published).toBe(true)
  })
})

describe("updateEntry", () => {
  it("leaves fields untouched by the patch alone", async () => {
    const created = await createEntry(input({ creator: "Denis Villeneuve", year: 2024 }))

    await updateEntry(
      created.id,
      input({ title: "Dune: Part Two", creator: "Denis Villeneuve", year: 2024 }),
    )
    const entry = await getEntryById(created.id)

    expect(entry?.creator).toBe("Denis Villeneuve")
    expect(entry?.year).toBe(2024)
  })

  it("does not collide an entry's slug with itself when the title is unchanged", async () => {
    const created = await createEntry(input({ title: "Dune", year: 2024 }))
    const updated = await updateEntry(
      created.id,
      input({ title: "Dune", year: 2024, note: "rewatch" }),
    )

    expect(updated?.slug).toBe("dune-2024")
  })

  it("returns null for an id that doesn't exist", async () => {
    const result = await updateEntry("00000000-0000-0000-0000-000000000000", input())
    expect(result).toBeNull()
  })
})

describe("deleteEntry", () => {
  it("removes the row and returns its id", async () => {
    const created = await createEntry(input())
    const deleted = await deleteEntry(created.id)

    expect(deleted?.id).toBe(created.id)
    expect(await getEntryById(created.id)).toBeNull()
  })

  it("returns null for an id that doesn't exist rather than throwing", async () => {
    const result = await deleteEntry("00000000-0000-0000-0000-000000000000")
    expect(result).toBeNull()
  })
})
