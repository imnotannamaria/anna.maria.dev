import { existsSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { SHOWCASE, SHOWCASE_LIST } from "./registry"
import { CARD_STATE_KINDS, defaultState } from "./state"
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

  /**
   * The order is not cosmetic: it is what the picker lists, and a reader scanning a column of
   * states is reading a lifecycle. One entry listing `ok` first and the next listing it last is
   * the same fact told two ways — which is what the registry actually looked like before this
   * ran, and how `tree` got away with claiming two states while the home page rendered three.
   */
  it("lists every entry's states in lifecycle order", () => {
    const rank = (k: string) => CARD_STATE_KINDS.indexOf(k as (typeof CARD_STATE_KINDS)[number])
    const outOfOrder = SHOWCASE_LIST.filter((e) =>
      e.states.some((kind, i) => i > 0 && rank(kind) <= rank(e.states[i - 1])),
    )
    expect(outOfOrder.map((e) => `${e.slug}: ${e.states.join(", ")}`)).toEqual([])
  })

  /**
   * Whatever the list order is, a specimen opens on the working component. Four of the seven
   * used to open on a grey skeleton, on the page whose whole job is showing what the components
   * look like.
   */
  it("opens every entry on a state that isn't loading", () => {
    const opensGrey = SHOWCASE_LIST.filter((e) => defaultState(e.states) === "loading")
    expect(opensGrey.map((e) => e.slug)).toEqual([])
  })

  it("builds a source link on main, not on a SHA", () => {
    expect(sourceUrl("components/home/tree-card.tsx")).toBe(
      "https://github.com/imnotannamaria/anna.maria.dev/blob/main/components/home/tree-card.tsx",
    )
  })
})
