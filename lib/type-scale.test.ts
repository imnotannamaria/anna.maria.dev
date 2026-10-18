import { readFileSync, readdirSync } from "node:fs"
import { execFileSync } from "node:child_process"
import { describe, expect, it } from "vitest"

/**
 * The scale in `app/entrepta.css` was defined once and then ignored: ten named roles with
 * zero consumers, while 185 call-sites across 16 distinct sizes wrote `text-[11px]` by
 * hand — including `12` next to `12.5` and `13` next to `13.5`, pairs nobody can tell
 * apart. Nothing failed, which is the point: a scale that is optional is a scale that
 * decays, and it decays one plausible-looking `text-[13px]` at a time.
 *
 * These three greps are the whole enforcement. A lint rule would need to understand class
 * strings; this reads the source the way the person reintroducing the problem would write
 * it, and it costs milliseconds.
 */

const ROOTS = ["app", "components"]

/** `grep -rE` over the source, returning matching lines. Exit code 1 means no matches. */
function grepSource(pattern: string, extraArgs: string[] = []): string[] {
  try {
    const out = execFileSync(
      "grep",
      ["-rnE", pattern, ...ROOTS, "--include=*.tsx", "--include=*.ts", ...extraArgs],
      { encoding: "utf8" },
    )
    return out.trim().split("\n").filter(Boolean)
  } catch (error) {
    if ((error as { status?: number }).status === 1) return []
    throw error
  }
}

describe("the type scale is the only way to set a size", () => {
  it("has no arbitrary Tailwind font sizes", () => {
    expect(grepSource("text-\\[[0-9.]+px\\]")).toEqual([])
  })

  /**
   * Tailwind's own steps are a second vocabulary for the same sizes — `text-xs` is the
   * 12px that `text-mono-sm` already names, `text-sm` the 14px of `text-mono-md`. Two
   * spellings for one size is the ambiguity the scale exists to remove.
   */
  it("does not use Tailwind's default steps", () => {
    expect(grepSource("\\btext-(xs|sm|base|lg|xl|[2-9]xl)\\b")).toEqual([])
  })

  /**
   * Inline `fontSize` is allowed for one thing: a decorative glyph (`◆`, `♥`, `■`, the
   * key labels on the mini piano) whose size is optically matched to the text beside it
   * rather than being a role in the scale. Those all sit at 18px and below. Anything
   * larger is real text and belongs on the scale — as `var(--text-*)` if the element is
   * already inline-styled, or as a class if it isn't.
   */
  it("keeps inline numeric fontSize down to glyph sizes", () => {
    const oversized = grepSource("fontSize: [0-9]+", ["--exclude-dir=og"]).filter((line) => {
      const px = Number(/fontSize: ([0-9]+)/.exec(line)?.[1])
      return px > 18
    })
    expect(oversized).toEqual([])
  })
})

it("uses the scale in the site's CSS too", () => {
  // Only page titles are fluid; the remaining pixel sizes are small decorative glyphs.
  const exceptions: Record<string, string> = {
    "components/site/home/home.css:.st-hm-name": "clamp(44px, 8cqw, 88px)",
    "components/site/post/post.css:.st-ps-title": "clamp(28px, 5cqw, 52px)",
    "components/site/project/open-project.css:.st-pa-title": "clamp(32px, 6cqw, 64px)",
    "components/site/plate.css:.st-plate-chars": "13px", // logo initials, not running text
    "components/site/home/home.css:.st-hm-reacts > b": "11px", // decorative emoji
    "components/site/person/favorites.css:.st-reaction-emoji": "15px",
    "components/site/person/favorites.css:.st-reaction-flight": "15px",
  }
  const files = [
    "app/globals.css",
    ...readdirSync("components/site", { recursive: true })
      .filter((path) => path.toString().endsWith(".css"))
      .map((path) => `components/site/${path}`),
  ]
  const violations: string[] = []
  for (const file of files) {
    const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "")
    for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      for (const decl of rule[2].matchAll(/\bfont-size:\s*([^;]+);/g)) {
        const value = decl[1].trim()
        const key = `${file}:${rule[1].trim()}`
        if (/^var\(--text-[a-z-]+\)$/.test(value)) continue
        // Hiding the copied chat glyph behind the site's avatar is not a new text size.
        if (file === "components/site/ai/chat.css" && value === "0 !important") continue
        if (exceptions[key] === value) continue
        violations.push(`${key}: ${value}`)
      }
    }
  }
  expect(violations).toEqual([])
})
