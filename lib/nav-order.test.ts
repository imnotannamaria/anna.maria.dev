import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * Four hand-written lists answer "where does this page sit": the titlebar's tabs, the
 * sidebar's icons, the ⌘K palette, and the tree card's picture of the site. They have to
 * agree, or the site has four opinions about its own shape — and a visitor who learns the
 * order in one place carries it to the next.
 *
 * They drifted the moment one of them was reordered by hand. The comment in each file said
 * to change all four; a comment is not enforcement, so this is.
 *
 * Read as source rather than imported, for the same reason `lib/showcase/registry.test.ts`
 * checks its pointers this way: three of the four are `"use client"` modules full of JSX and
 * icon imports, and the unit project runs in node against `*.test.ts`. A grep over the source
 * reads the file the way the person reordering it would.
 */

const ROOT = process.cwd()

/** Every `href: "…"` between a list's opening line and the `]` that closes it, in order. */
function hrefsIn(file: string, opensWith: string): string[] {
  const source = readFileSync(join(ROOT, file), "utf8")
  const start = source.indexOf(opensWith)
  if (start === -1) throw new Error(`${file} no longer contains \`${opensWith}\``)

  // The first line that is exactly `]` — every one of these arrays is prettier-formatted, so
  // its closing bracket is in column zero and no nested array's is.
  const end = source.indexOf("\n]", start)
  const body = source.slice(start, end === -1 ? undefined : end)

  const hrefs = Array.from(body.matchAll(/href:\s*"([^"]+)"/g), (m) => m[1])
  if (hrefs.length === 0) throw new Error(`${file}: \`${opensWith}\` matched no hrefs`)
  return hrefs
}

const TITLEBAR = () => hrefsIn("components/chrome/titlebar.tsx", "const NAV_TABS: Tab[] = [")
const SIDEBAR = () => hrefsIn("components/chrome/sidebar.tsx", "const NAV_ITEMS = [")
const PALETTE = () => hrefsIn("components/chrome/command-menu.tsx", "const PAGES: Page[] = [")
const TREE = () => hrefsIn("lib/site-tree.ts", "const SITE_TREE: TreeNode[] = [")

describe("the site agrees with itself about where pages are", () => {
  it("orders the sidebar exactly like the titlebar", () => {
    expect(SIDEBAR()).toEqual(TITLEBAR())
  })

  it("orders the command palette exactly like the titlebar", () => {
    expect(PALETTE()).toEqual(TITLEBAR())
  })

  /**
   * The tree is the nav minus the home page, which is the root of the tree rather than a row
   * in it. Its child rows are otherwise the same pages in the same order.
   */
  it("orders the tree like the nav, minus the home page it is rooted at", () => {
    expect(TREE()).toEqual(TITLEBAR().filter((href) => href !== "/"))
  })

  /** A page reachable from one of them and not the others is the other way this drifts. */
  it("lists the same pages in all four", () => {
    const nav = new Set(TITLEBAR())
    expect(new Set(SIDEBAR())).toEqual(nav)
    expect(new Set(PALETTE())).toEqual(nav)
    expect(new Set([...TREE(), "/"])).toEqual(nav)
  })
})
