import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { THEMES } from "./site-config"

/**
 * `THEMES` and the theme blocks in `app/globals.css` are the same twelve colours written twice,
 * and they have to be: the `ThemeSwitcher` needs a value to paint its swatch before any of those
 * blocks is applied to anything, so the constant cannot be derived from the stylesheet at
 * runtime. Deduplicating would mean generating one from the other at build time, which is a lot
 * of machinery for twelve hex codes.
 *
 * So: keep the copy, and let a test be the thing that notices when they drift — the same call
 * `lib/docs-sync.test.ts` makes about AGENTS.md. Without it, changing a brand colour in the
 * stylesheet leaves the switcher showing the old one, silently, and the only symptom is a swatch
 * that does not match the page it just repainted.
 *
 * `color` is the dark value and `lightColor` the light one, which is why the two selectors below
 * are read separately.
 */
const CSS = readFileSync(join(process.cwd(), "app/globals.css"), "utf8")

/**
 * The `--fg-brand` a selector ends up with, or null if it never declares one.
 *
 * The **last** block wins, not the first, because that is what the cascade does and because
 * `:root` legitimately appears twice — once for the primitives near the top of the file and
 * again in the theme section at the bottom. Reading the first would test the wrong block and
 * pass for the wrong reason.
 */
function brandFor(selector: string): string | null {
  let found: string | null = null
  let from = 0
  for (;;) {
    const start = CSS.indexOf(`${selector} {`, from)
    if (start === -1) return found
    const end = CSS.indexOf("}", start)
    const match = CSS.slice(start, end).match(/--fg-brand:\s*([^;]+);/)
    if (match) found = match[1].trim()
    from = end
  }
}

/**
 * Where a theme's colours live.
 *
 * The default one has no `[data-theme]` at all — it is what `:root` already says, and
 * `ThemeSwitcher` sets the attribute only when you pick something else. So entrepta is read off
 * `:root` and the rest off their own blocks.
 */
const DEFAULT_THEME = "entrepta"
const darkSelector = (id: string) => (id === DEFAULT_THEME ? ":root" : `[data-theme="${id}"]`)
const lightSelector = (id: string) => `${darkSelector(id)}[data-mode="light"]`

describe("theme colours", () => {
  it("matches --fg-brand in every dark theme block", () => {
    const drifted = THEMES.filter((t) => brandFor(darkSelector(t.id)) !== t.color).map(
      (t) => `${t.id}: THEMES ${t.color} vs css ${brandFor(darkSelector(t.id))}`,
    )
    expect(drifted).toEqual([])
  })

  it("matches --fg-brand in every light theme block", () => {
    const drifted = THEMES.filter((t) => brandFor(lightSelector(t.id)) !== t.lightColor).map(
      (t) => `${t.id}: THEMES ${t.lightColor} vs css ${brandFor(lightSelector(t.id))}`,
    )
    expect(drifted).toEqual([])
  })

  /**
   * A theme block that exists in the stylesheet and not in `THEMES` is a theme nobody can pick.
   * The reverse is covered above — `brandFor` returns null for a missing block, which no hex
   * equals.
   */
  it("has no theme block the switcher cannot reach", () => {
    const inCss = [...CSS.matchAll(/\[data-theme="([a-z-]+)"\]\s*\{/g)].map((m) => m[1])
    const known = new Set<string>(THEMES.map((t) => t.id))
    expect([...new Set(inCss)].filter((id) => !known.has(id))).toEqual([])
  })
})
