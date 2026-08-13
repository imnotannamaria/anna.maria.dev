import { describe, expect, it } from "vitest"
import { createItem } from "./mutations"
import { getAllItems, getItemById, getPublicItems } from "./queries"
import type { RoadmapItemInput } from "./validation"

function input(overrides: Partial<RoadmapItemInput> = {}): RoadmapItemInput {
  return { title: "Test Item", status: "raw", ...overrides }
}

describe("getPublicItems — the raw-leak invariant", () => {
  it("excludes raw items from the public board but includes them in the admin list", async () => {
    await createItem(input({ title: "Private thought", status: "raw" }))
    await createItem(input({ title: "Promoted", status: "todo" }))

    const publicItems = await getPublicItems()
    const allItems = await getAllItems()

    expect(publicItems.map((i) => i.title)).toEqual(["Promoted"])
    expect(allItems.map((i) => i.title).sort()).toEqual(["Private thought", "Promoted"])
  })

  it("includes doing and done alongside todo", async () => {
    await createItem(input({ title: "A", status: "todo" }))
    await createItem(input({ title: "B", status: "doing" }))
    await createItem(input({ title: "C", status: "done" }))

    const publicItems = await getPublicItems()
    expect(publicItems.map((i) => i.title).sort()).toEqual(["A", "B", "C"])
  })
})

describe("getItemById", () => {
  it("returns null for a non-uuid id instead of raising", async () => {
    // `where id = 'garbage'` against a uuid column throws at the database level — isUuid()
    // is what turns a wrong URL into a 404 instead of an error page.
    const result = await getItemById("not-a-uuid")
    expect(result).toBeNull()
  })

  it("returns null for a well-formed uuid that doesn't exist", async () => {
    const result = await getItemById("00000000-0000-0000-0000-000000000000")
    expect(result).toBeNull()
  })
})
