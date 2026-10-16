import { afterEach, describe, expect, it, vi } from "vitest"
import { MAX_EARLIER } from "@/lib/ai/limits"
import { chatSchema } from "@/lib/ai/validation"
import { askModel, bodyFor, endsTheDay, isAboutTheQuestion } from "./ask"

afterEach(() => vi.unstubAllGlobals())
const signal = () => new AbortController().signal

describe("bodyFor", () => {
  it("sends what the server accepts, however long the conversation got", () => {
    const asked = Array.from({ length: 12 }, (_, i) => `question ${i}`)
    const body = bodyFor(asked, "and her stack?")
    expect(body.earlier).toEqual(asked.slice(-MAX_EARLIER))
    expect(chatSchema.safeParse(body).success).toBe(true)
  })

  it("leaves out an earlier question the server would refuse", () => {
    expect(bodyFor(["a".repeat(500), "  ", "fine"], "hi there").earlier).toEqual(["fine"])
  })
})

describe("refusals", () => {
  it("stops asking the model once the day is over", () => {
    expect(endsTheDay("budget")).toBe(true)
    expect(endsTheDay("visitor")).toBe(true)
    expect(endsTheDay("slow")).toBe(false)
  })

  it("knows which ones the script has nothing to add to", () => {
    expect(isAboutTheQuestion("scope")).toBe(true)
    expect(isAboutTheQuestion("blocked")).toBe(true)
    expect(isAboutTheQuestion("budget")).toBe(false)
  })
})

describe("askModel", () => {
  it("returns the answer and the page it is about", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ text: "Anna builds things.", topic: "projects" })),
    )
    expect(await askModel([], "what?", signal())).toEqual({
      ok: true,
      text: "Anna builds things.",
      topic: "projects",
    })
  })

  it("shows no card for a page it does not know", async () => {
    for (const topic of ["none", "admin", 7, undefined]) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ text: "hello", topic })))
      expect(await askModel([], "what?", signal())).toEqual({
        ok: true,
        text: "hello",
        topic: null,
      })
    }
  })

  it("passes the server's reason on", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ reason: "scope" }, { status: 422 })),
    )
    expect(await askModel([], "what?", signal())).toEqual({ ok: false, reason: "scope" })
  })

  it("treats a reason it does not know, a dropped line and an empty answer as a failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ reason: "<b>x</b>" }, { status: 500 })),
    )
    expect(await askModel([], "q", signal())).toEqual({ ok: false, reason: "upstream" })
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("failed to fetch")))
    expect(await askModel([], "q", signal())).toEqual({ ok: false, reason: "upstream" })
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ text: "  " })))
    expect(await askModel([], "q", signal())).toEqual({ ok: false, reason: "upstream" })
  })
})
