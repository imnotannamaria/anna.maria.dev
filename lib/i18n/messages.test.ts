import { describe, expect, it } from "vitest"
import en from "../../messages/en.json"
import pt from "../../messages/pt.json"

const leaves = (node: unknown, path = ""): [string, string][] =>
  typeof node === "string"
    ? [[path, node]]
    : Object.entries(node as object).flatMap(([key, value]) =>
        leaves(value, path ? `${path}.${key}` : key),
      )

/**
 * A message of four words or more is a sentence. A label can be the same in both languages
 * ("stack", "apps", "Wall of love", a brand's name); a sentence that is the same in both is one
 * nobody translated.
 */
const isSentence = (text: string) => text.trim().split(/\s+/).length >= 4

/** The tags of a sentence, `<b>` and `<link>`: the page gives each one a component. */
const tags = (text: string) => [...text.matchAll(/<(\w+)>/g)].map((match) => match[1]).sort()

describe("the two message files", () => {
  const english = new Map(leaves(en))
  const portuguese = new Map(leaves(pt))

  it("have the same keys", () => {
    expect([...portuguese.keys()].sort()).toEqual([...english.keys()].sort())
  })

  it("leave no English sentence in the Portuguese one", () => {
    const untranslated = [...english]
      .filter(([key, text]) => isSentence(text) && portuguese.get(key) === text)
      .map(([key]) => key)
    expect(untranslated).toEqual([])
  })

  it("keep the same tags in every sentence", () => {
    for (const [key, text] of english) {
      expect(tags(portuguese.get(key) ?? ""), key).toEqual(tags(text))
    }
  })

  it("have no em dash, which is not how Anna writes", () => {
    for (const [key, text] of [...english, ...portuguese]) expect(text, key).not.toMatch(/—/)
  })
})
