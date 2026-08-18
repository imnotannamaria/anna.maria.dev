import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * AGENTS.md is a byte-identical copy of CLAUDE.md, so that agents reading either name get the
 * same conventions. A symlink would express that better, but not every tool that opens
 * AGENTS.md follows one, and a silently empty instruction file is worse than a duplicate.
 *
 * So: keep the copy, and let a test be the thing that notices when the two drift. Editing
 * one and forgetting the other is the failure this exists for — `cp CLAUDE.md AGENTS.md` is
 * the fix when it fires.
 */
describe("agent instructions", () => {
  it("keeps AGENTS.md identical to CLAUDE.md", () => {
    const read = (name: string) => readFileSync(join(process.cwd(), name), "utf8")
    expect(read("AGENTS.md")).toBe(read("CLAUDE.md"))
  })
})
