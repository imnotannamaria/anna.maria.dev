import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * A post or a case study is one English file and one Portuguese file beside it, in `pt/`. The
 * translation only replaces the words, so what it must agree on with the original is small: it
 * has to exist, and it must not change the date.
 */
const COLLECTIONS = ["blog", "projects"]
const mdx = (dir: string) =>
  existsSync(dir) ? readdirSync(dir).filter((name) => name.endsWith(".mdx")) : []
const field = (file: string, name: string) =>
  new RegExp(`^${name}:\\s*(.+)$`, "m").exec(readFileSync(file, "utf8"))?.[1]?.trim()

describe.each(COLLECTIONS)("content/%s in two languages", (collection) => {
  const dir = join(process.cwd(), "content", collection)
  const originals = mdx(dir)
  const translations = mdx(join(dir, "pt"))

  it("has a translation for every document", () => {
    expect(translations.sort()).toEqual(originals.sort())
  })

  it.each(translations)("%s keeps the original's date and has no em dash", (name) => {
    expect(field(join(dir, "pt", name), "date")).toBe(field(join(dir, name), "date"))
    for (const file of [join(dir, name), join(dir, "pt", name)]) {
      expect(readFileSync(file, "utf8"), file).not.toMatch(/—/)
    }
  })
})
