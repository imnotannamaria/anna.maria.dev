import { existsSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { SHOWCASE, SHOWCASE_LIST } from "./registry"
import { sourceUrl } from "./source"

/**
 * The registry points at files and at MDX. Neither pointer can be checked by the type system,
 * so they are checked here.
 *
 * What is *not* here is the demo map — that every entry has a renderer for every state it
 * declares. That one is enforced by the `DemoMap` mapped type in `components/showcase/demos.tsx`
 * and caught by `tsc --noEmit`, which is stronger than a test and needs no DOM. The unit
 * project runs in node with an `include` of `*.test.ts`, so importing a `"use client"` module
 * of JSX here would not work anyway.
 */
describe("the showcase registry", () => {
  it("points every entry at a file that exists", () => {
    const missing = SHOWCASE_LIST.filter((e) => !existsSync(join(process.cwd(), e.source)))
    expect(missing.map((e) => `${e.slug} → ${e.source}`)).toEqual([])
  })

  it("gives every entry at least one state to show", () => {
    const stateless = SHOWCASE_LIST.filter((e) => e.states.length === 0)
    expect(stateless.map((e) => e.slug)).toEqual([])
  })

  it("keys the record by each entry's own slug", () => {
    const mismatched = Object.entries(SHOWCASE)
      .filter(([key, entry]) => key !== entry.slug)
      .map(([key, entry]) => `${key} !== ${entry.slug}`)
    expect(mismatched).toEqual([])
  })

  /**
   * Velite catches an MDX file naming a registry key that does not exist. It cannot catch the
   * reverse, because it never sees an absence — and an entry with no doc renders an index card
   * whose link 404s.
   */
  it("has an MDX doc for every entry that isn't documented elsewhere", () => {
    const undocumented = SHOWCASE_LIST.filter(
      (e) => !e.external && !existsSync(join(process.cwd(), "content/components", `${e.slug}.mdx`)),
    )
    expect(undocumented.map((e) => e.slug)).toEqual([])
  })

  it("builds a source link on main, not on a SHA", () => {
    expect(sourceUrl("components/home/tree-card.tsx")).toBe(
      "https://github.com/imnotannamaria/anna.maria.dev/blob/main/components/home/tree-card.tsx",
    )
  })
})
