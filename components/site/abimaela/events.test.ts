import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import en from "../../../messages/en.json"
import pt from "../../../messages/pt.json"
import {
  EVENTS,
  EVENT_NAMES,
  TYPING_MS,
  gestureOf,
  isPageEvent,
  pageEvent,
  shouldSpeak,
  waitToSpeak,
} from "./events"

const doc = readFileSync(join(process.cwd(), "docs", "abimaela.md"), "utf8")

/**
 * The rows of the doc's table: event, when, first line, gesture, urgency. Read cell by cell, so
 * the padding a formatter adds to line the columns up does not matter.
 */
const rows = new Map(
  doc
    .split("\n")
    .filter((line) => /^\|\s*`\w+`\s*\|/.test(line))
    .map((line) =>
      line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim()),
    )
    .filter((cells) => cells.length === 5)
    .map(([event, when, line, gesture, urgency]) => [
      event.replaceAll("`", ""),
      { when, line, gesture, urgency },
    ]),
)

describe("docs/abimaela.md and the code", () => {
  it("list the same events", () => {
    expect([...rows.keys()].sort()).toEqual([...EVENT_NAMES].sort())
  })

  // The doc is the English one, so every cell is compared: when it happens, the gesture, the
  // urgency, and the first line, which has to be the real one.
  it.each(EVENT_NAMES)("agree on %s", (event) => {
    const row = rows.get(event)
    const strip = (cell: string | undefined) => (cell ?? "").replaceAll("`", "")
    expect(strip(row?.urgency)).toBe(EVENTS[event].urgency)
    expect(strip(row?.gesture)).toBe(gestureOf(event) ?? "")
    const first = (file: typeof en) =>
      (file.cat.lines as Record<string, Record<string, string>>)[event]["0"]
    expect(row?.when).toBe(EVENTS[event].when)
    expect(row?.line).toBe(first(en))
  })
})

describe("her lines", () => {
  it.each(["en", "pt"] as const)("exist for every event, in %s", (locale) => {
    const lines = (locale === "en" ? en : pt).cat.lines as Record<string, Record<string, string>>
    expect(Object.keys(lines).sort()).toEqual([...EVENT_NAMES].sort())
    for (const event of EVENT_NAMES) {
      // numbered from "0" with no gap, since she walks them by index
      expect(Object.keys(lines[event])).toEqual(
        Object.keys(lines[event]).map((_, index) => String(index)),
      )
      expect(Object.keys(lines[event]).length).toBeGreaterThan(0)
    }
  })

  it("come in the same number in both languages", () => {
    for (const event of EVENT_NAMES) {
      const count = (file: typeof en) =>
        Object.keys((file.cat.lines as Record<string, object>)[event]).length
      expect(count(pt as typeof en), event).toBe(count(en))
    }
  })
})

describe("pageEvent", () => {
  it.each([
    ["home", "home"],
    ["person", "person"],
    ["wall-of-love", "wall"],
    ["post:my-post", "post"],
    ["project:entrepta", "project"],
    ["log", "log"],
    ["admin", "page"],
    [null, "page"],
  ] as const)("%s opens as %s", (screen, event) => {
    expect(pageEvent(screen)).toBe(event)
  })
})

describe("shouldSpeak", () => {
  const quiet = { spokeAt: 0, typedAt: 0 }
  const now = 100_000

  it("always answers a direct event", () => {
    expect(shouldSpeak("click", now, { spokeAt: now - 1, typedAt: now - 1 })).toBe(true)
    expect(shouldSpeak("unknown", now, { spokeAt: now, typedAt: now })).toBe(true)
  })

  it("comments on the page when it has been quiet", () => {
    expect(shouldSpeak("pin", now, quiet)).toBe(true)
  })

  it("does not wait for her last line: a new one takes over", () => {
    expect(shouldSpeak("pin", now, { spokeAt: now - 1, typedAt: 0 })).toBe(true)
    expect(shouldSpeak("contact", now, { spokeAt: now, typedAt: 0 })).toBe(true)
  })

  it("says how long until she may speak", () => {
    expect(waitToSpeak("contact", now, { spokeAt: now - 1000, typedAt: now - 500 })).toBe(
      TYPING_MS - 500,
    )
    expect(waitToSpeak("pin", now, { spokeAt: now, typedAt: 0 })).toBe(0)
    expect(waitToSpeak("sent", now, { spokeAt: now, typedAt: now })).toBe(0)
  })

  it("knows a page opening from the rest", () => {
    for (const event of EVENT_NAMES) {
      expect(isPageEvent(event), event).toBe(/ opening$/.test(EVENTS[event].when))
    }
  })

  it("does not talk while someone is typing", () => {
    expect(shouldSpeak("notes", now, { spokeAt: 0, typedAt: now - TYPING_MS + 1 })).toBe(false)
    expect(shouldSpeak("notes", now, { spokeAt: 0, typedAt: now - TYPING_MS })).toBe(true)
  })
})
