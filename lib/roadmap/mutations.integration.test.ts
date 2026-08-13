import { describe, expect, it } from "vitest"
import { createItem, deleteItem, updateItem } from "./mutations"
import { getItemById } from "./queries"
import type { RoadmapItemInput } from "./validation"

function input(overrides: Partial<RoadmapItemInput> = {}): RoadmapItemInput {
  return { title: "Test Item", status: "raw", ...overrides }
}

describe("createItem", () => {
  it("stores a blank blurb/planUrl as null, not an empty string", async () => {
    const created = await createItem(input({ blurb: "", planUrl: "" }))
    const item = await getItemById(created.id)

    expect(item?.blurb).toBeNull()
    expect(item?.planUrl).toBeNull()
  })

  it("stamps shippedAt only when created directly as done", async () => {
    const raw = await createItem(input({ status: "raw" }))
    const done = await createItem(input({ status: "done" }))

    expect((await getItemById(raw.id))?.shippedAt).toBeNull()
    expect((await getItemById(done.id))?.shippedAt).not.toBeNull()
  })

  it("resolves a slug collision end to end", async () => {
    const first = await createItem(input({ title: "Add tests" }))
    const second = await createItem(input({ title: "Add tests" }))

    expect(first.slug).toBe("add-tests")
    expect(second.slug).toBe("add-tests-2")
  })
})

describe("updateItem — partial updates don't clobber untouched fields", () => {
  it("leaves the blurb and planUrl alone when a patch only moves status", async () => {
    const created = await createItem(input({ blurb: "A real blurb", planUrl: "docs/x-plan.md" }))

    // Every field in roadmapItemInputSchema is optional, so this patch — title/status only
    // — validates. toUpdate() must still leave blurb/planUrl exactly as they were.
    await updateItem(created.id, { title: "Test Item", status: "todo" })
    const item = await getItemById(created.id)

    expect(item?.blurb).toBe("A real blurb")
    expect(item?.planUrl).toBe("docs/x-plan.md")
    expect(item?.status).toBe("todo")
  })

  it("keeps the item's own slug when the payload doesn't mention one", async () => {
    const created = await createItem(input({ title: "Add tests" }))
    const updated = await updateItem(created.id, { title: "Add tests", status: "todo" })

    expect(updated?.slug).toBe("add-tests")
  })
})

describe("updateItem — shippedAt derivation", () => {
  it("stamps today's date the moment status moves to done", async () => {
    const created = await createItem(input({ status: "todo" }))
    const updated = await updateItem(created.id, { title: "Test Item", status: "done" })
    const item = await getItemById(updated!.id)

    expect(item?.shippedAt).not.toBeNull()
  })

  it("clears shippedAt when status moves out of done", async () => {
    const created = await createItem(input({ status: "done" }))
    const updated = await updateItem(created.id, { title: "Test Item", status: "todo" })
    const item = await getItemById(updated!.id)

    expect(item?.shippedAt).toBeNull()
  })

  it("does not re-stamp shippedAt on an unrelated edit to an already-done item", async () => {
    const created = await createItem(input({ status: "done" }))
    const firstShippedAt = (await getItemById(created.id))?.shippedAt

    await updateItem(created.id, { title: "Test Item", status: "done", blurb: "later edit" })
    const secondShippedAt = (await getItemById(created.id))?.shippedAt

    expect(secondShippedAt).toBe(firstShippedAt)
  })

  it("returns null for a non-uuid id instead of raising", async () => {
    const result = await updateItem("not-a-uuid", input())
    expect(result).toBeNull()
  })
})

describe("deleteItem", () => {
  it("removes the row and returns its id", async () => {
    const created = await createItem(input())
    const deleted = await deleteItem(created.id)

    expect(deleted?.id).toBe(created.id)
    expect(await getItemById(created.id)).toBeNull()
  })

  it("returns null for a non-uuid id instead of raising", async () => {
    const result = await deleteItem("not-a-uuid")
    expect(result).toBeNull()
  })
})
