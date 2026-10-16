import { describe, expect, it } from "vitest"
import { getPublishedPosts } from "@/lib/velite"
import { GET } from "./route"

const card = (title?: string) =>
  GET(
    new Request(
      `http://localhost/api/og${title === undefined ? "" : `?title=${encodeURIComponent(title)}`}`,
    ) as never,
  )

describe("GET /api/og", () => {
  it("makes no card for a title that is not a note or a project: each one would be a render and a cache entry", async () => {
    expect((await card("Anything a caller types")).status).toBe(404)
    expect((await card("x".repeat(500))).status).toBe(404)
  })

  it("makes the card of a real title, and the cover with none", async () => {
    const real = getPublishedPosts("en")[0].title
    expect((await card(real)).status).toBe(200)
    expect((await card()).status).toBe(200)
  })
})
