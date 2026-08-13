import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { blog, projects } from "@/.velite"

/**
 * The shipped bug: wristkit.mdx once carried a cover with two letters swapped, and
 * `/projects` rendered "nothing published yet" instead of erroring. See the `/projects`
 * section of CLAUDE.md.
 *
 * What was measured while fixing this file, by reproducing that exact typo:
 *
 *   velite build  ->  logs "info cover file not found under public/"  ->  EXIT CODE 0
 *   .velite       ->  4 projects, unchanged, wristkit still present
 *   its cover     ->  "/projects/wirstkit.png", a path with no file behind it
 *
 * So a broken `cover` does **not** empty the collection on the current velite, and it does
 * not fail the build either — the document sails through with a dead path. A count
 * assertion cannot see that, which is why the cover check below exists and is the one that
 * actually encodes the bug. The counts are kept for the catastrophic case (a whole
 * collection dropped), not because they cover this one.
 *
 * `velite build` must run before this test; it isn't run here because `.velite` is also
 * relied on by the Next build itself.
 */

function mdxFileCount(dir: "blog" | "projects"): number {
  return readdirSync(join(process.cwd(), "content", dir)).filter((f) => f.endsWith(".mdx")).length
}

describe("velite output matches content/ on disk", () => {
  it("blog collection has one entry per .mdx file in content/blog", () => {
    const expected = mdxFileCount("blog")
    expect(expected).toBeGreaterThan(0)
    expect(blog.length).toBe(expected)
  })

  it("projects collection has one entry per .mdx file in content/projects", () => {
    const expected = mdxFileCount("projects")
    expect(expected).toBeGreaterThan(0)
    expect(projects.length).toBe(expected)
  })
})

describe("every cover path in the output has a file behind it", () => {
  it("resolves each project cover under public/", () => {
    // `cover` is optional — a project without one falls back to the generated cover — so
    // this asserts about the ones that set it, and that at least one does. If every
    // project ever drops its cover, the second assertion is what says so rather than the
    // test quietly checking nothing.
    const withCovers = projects.filter((project) => project.cover)
    expect(withCovers.length).toBeGreaterThan(0)

    const missing = withCovers
      .filter((project) => !existsSync(join(process.cwd(), "public", project.cover!)))
      .map((project) => `${project.title}: ${project.cover}`)

    expect(missing).toEqual([])
  })
})
