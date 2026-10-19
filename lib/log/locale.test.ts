import { describe, expect, it } from "vitest"
import { entriesIn, inLocale } from "./locale"
import type { LogEntry } from "./validation"

const entry: LogEntry = {
  id: "1",
  slug: "the-haunting-of-hill-house",
  type: "series",
  title: "The Haunting of Hill House",
  titlePt: "A Maldição da Residência Hill",
  creator: "Mike Flanagan",
  year: 2018,
  rating: 5,
  favorite: true,
  note: "The one I rewatch.",
  notePt: "A que eu sempre revejo.",
  posterUrl: null,
  externalUrl: null,
  loggedAt: "2026-01-01",
  published: true,
}

describe("inLocale", () => {
  it("leaves the English as it is", () => {
    expect(inLocale(entry, "en")).toBe(entry)
  })

  it("puts the Portuguese title and note in place of the English", () => {
    const shown = inLocale(entry, "pt")
    expect(shown.title).toBe("A Maldição da Residência Hill")
    expect(shown.note).toBe("A que eu sempre revejo.")
    // the rest is one thing in every language
    expect(shown.creator).toBe("Mike Flanagan")
    expect(shown.slug).toBe(entry.slug)
  })

  it("keeps the English of whatever has no translation", () => {
    const album = { ...entry, title: "In Rainbows", titlePt: null, notePt: null }
    const shown = inLocale(album, "pt")
    expect(shown.title).toBe("In Rainbows")
    expect(shown.note).toBe("The one I rewatch.")
  })

  it("translates one without the other", () => {
    expect(inLocale({ ...entry, titlePt: null }, "pt")).toMatchObject({
      title: "The Haunting of Hill House",
      note: "A que eu sempre revejo.",
    })
  })
})

describe("entriesIn", () => {
  it("keeps null as null: the database did not answer, which is not an empty log", () => {
    expect(entriesIn(null, "pt")).toBeNull()
    expect(entriesIn([], "pt")).toEqual([])
  })

  it("translates every entry", () => {
    expect(entriesIn([entry, entry], "pt")?.map((e) => e.title)).toEqual([
      "A Maldição da Residência Hill",
      "A Maldição da Residência Hill",
    ])
  })
})
