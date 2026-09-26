import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * `app/entrepta.css` and `lib/utils.ts` are entrepta's files, not this site's. They are copied
 * from `@entrepta/registry` rather than written by `entrepta init`, because init rewrites
 * `globals.css` whole and this site keeps ~1,100 lines of its own CSS there.
 *
 * A copy drifts silently, so this test is what notices. Updating entrepta is: bump the pinned
 * `@entrepta/registry` devDependency, run this, and copy what it reports.
 *
 * Two deliberate differences, both because next/font owns the fonts in `app/layout.tsx`: the
 * Google Fonts `@import` and the `--font-*` declarations are not copied. The Tailwind import and
 * `@source` live in `globals.css`, which imports this file.
 */

const REGISTRY = join(process.cwd(), "node_modules/@entrepta/registry")
const read = (path: string) => readFileSync(path, "utf8")

const THEMES = ["entrepta", "blossom", "marmalade", "julia", "ivy", "bosco"] as const

/** Comments, whitespace and the formatting prettier is free to change, gone. */
function normalize(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, "")
    .replace(/;}/g, "}")
}

/** What the registry's globals.css looks like with the lines this site leaves out removed. */
function registryGlobalsForThisSite(): string {
  return read(join(REGISTRY, "styles/globals.css"))
    .replace(/^@import url\([^)]*\);$/m, "")
    .replace(/^@import "tailwindcss";$/m, "")
    .replace(/^@source .*;$/m, "")
    .replace(/^\s*--font-(serif|mono|sans):.*;$/gm, "")
}

/** The custom properties declared in the block with exactly this selector list. */
function declarations(css: string, selector: string): Record<string, string> {
  const flat = css.replace(/\/\*[\s\S]*?\*\//g, "")
  const blocks = [...flat.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  const block = blocks.find(([, sel]) => sel.split(",").some((s) => s.trim() === selector))
  if (!block) return {}
  return Object.fromEntries(
    [...block[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => [
      name,
      value.trim(),
    ]),
  )
}

describe("app/entrepta.css follows @entrepta/registry", () => {
  const local = read(join(process.cwd(), "app/entrepta.css"))

  it("contains the registry's globals.css, minus the fonts", () => {
    expect(normalize(local)).toContain(normalize(registryGlobalsForThisSite()))
  })

  it("declares no fonts and imports nothing", () => {
    expect(local).not.toMatch(/^\s*--font-(serif|mono|sans)\s*:/m)
    expect(local).not.toMatch(/^@import/m)
  })

  for (const theme of THEMES) {
    it(`carries the ${theme} theme in both modes`, () => {
      const source = read(join(REGISTRY, `styles/themes/${theme}.css`))
      expect(declarations(local, `:root[data-theme="${theme}"]`)).toEqual(
        declarations(source, ":root"),
      )
      expect(declarations(local, `:root[data-theme="${theme}"][data-mode="light"]`)).toEqual(
        declarations(source, ':root[data-mode="light"]'),
      )
    })
  }
})

describe("lib/utils.ts follows @entrepta/registry", () => {
  it("is the registry's cn(), and nothing else", () => {
    const strip = (ts: string) =>
      normalize(ts)
        .replace(/;/g, "")
        .replace(/,(?=[}\])])/g, "")
    expect(strip(read(join(process.cwd(), "lib/utils.ts")))).toBe(
      strip(read(join(REGISTRY, "lib/utils.ts"))),
    )
  })
})
