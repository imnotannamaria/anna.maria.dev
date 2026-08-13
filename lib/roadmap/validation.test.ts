import { describe, expect, it } from "vitest"
import { roadmapItemInputSchema } from "./validation"

function base() {
  return { title: "Add tests", status: "raw" as const }
}

describe("roadmapItemInputSchema — status", () => {
  it("accepts each of the four statuses", () => {
    for (const status of ["raw", "todo", "doing", "done"] as const) {
      expect(roadmapItemInputSchema.safeParse({ ...base(), status }).success).toBe(true)
    }
  })

  it("rejects an unknown status", () => {
    expect(roadmapItemInputSchema.safeParse({ ...base(), status: "shipped" }).success).toBe(false)
  })
})

describe("roadmapItemInputSchema — planUrl", () => {
  it("accepts a repo-relative path, not just a URL", () => {
    // planUrl renders as text in the card's foot, never as an href — see the comment in
    // lib/roadmap/validation.ts. It validates shape only, deliberately not https-only like
    // the log's externalUrl. If that ever changes, this test is meant to catch the diff.
    const result = roadmapItemInputSchema.safeParse({ ...base(), planUrl: "docs/tests-plan.md" })
    expect(result.success).toBe(true)
  })

  it("accepts an empty string as 'not set'", () => {
    expect(roadmapItemInputSchema.safeParse({ ...base(), planUrl: "" }).success).toBe(true)
  })
})

describe("roadmapItemInputSchema — slug", () => {
  it("accepts an empty string as 'not set'", () => {
    expect(roadmapItemInputSchema.safeParse({ ...base(), slug: "" }).success).toBe(true)
  })

  it("rejects uppercase or spaces", () => {
    expect(roadmapItemInputSchema.safeParse({ ...base(), slug: "Add Tests" }).success).toBe(false)
  })
})

describe("roadmapItemInputSchema — position", () => {
  it("rejects a fractional position", () => {
    expect(roadmapItemInputSchema.safeParse({ ...base(), position: 1.5 }).success).toBe(false)
  })

  it("is optional", () => {
    expect(roadmapItemInputSchema.safeParse(base()).success).toBe(true)
  })
})

describe("roadmapItemInputSchema — required fields", () => {
  it("rejects an empty title", () => {
    expect(roadmapItemInputSchema.safeParse({ ...base(), title: "" }).success).toBe(false)
  })
})
