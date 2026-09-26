import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * zod stays on the server, apart from the forms that validate as you type.
 *
 * `lib/log/validation.ts` and `lib/roadmap/validation.ts` import zod at module scope. A client
 * component that imported a label from either one — `TYPE_LABEL`, `STATUS_LABEL` — pulled all of
 * zod into the browser, about 60 KB gzipped, on the home page, /log and /roadmap. The labels live
 * in `constants.ts` now; this test is what keeps a value import from creeping back. Type-only
 * imports are fine, since they are erased before bundling.
 */

const ROOTS = ["app", "components", "hooks"]

/** The forms whose whole point is validating on the client, and nothing else. */
const ALLOWED = new Set([
  "components/contact/contact-form.tsx",
  "components/admin/log-entry-form.tsx",
  "components/admin/roadmap-item-form.tsx",
])

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.tsx?$/.test(name) ? [path] : []
  })
}

/**
 * Value imports (not `import type`) of zod, a validation module, or the contact schema. One
 * statement at a time: the braces or the default name, then `from`. The codebase has no
 * semicolons, so anything looser runs across lines into the next import.
 */
const VALUE_IMPORT =
  /^import (?!type\b)(?:\{[^}]*\}|[\w*][^\n{]*?) from "(zod|@\/lib\/[a-z-]+\/validation|@\/lib\/contact-schema)"/m

describe("client bundles", () => {
  it("never import zod outside the forms that validate on the client", () => {
    const offenders = ROOTS.flatMap(sourceFiles).filter((file) => {
      if (ALLOWED.has(file)) return false
      const source = readFileSync(file, "utf8")
      return source.startsWith('"use client"') && VALUE_IMPORT.test(source)
    })
    expect(offenders).toEqual([])
  })

  it("keeps the shared constants free of zod", () => {
    for (const file of ["lib/log/constants.ts", "lib/roadmap/constants.ts"]) {
      expect(readFileSync(file, "utf8")).not.toMatch(/from "zod"/)
    }
  })
})
