import { execFileSync } from "node:child_process"
import { describe, expect, it } from "vitest"

/**
 * The scale in `app/globals.css` was defined once and then ignored: ten named roles with
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
