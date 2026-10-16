import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

describe("invite tokens", () => {
  it("are 43 url-safe characters, and the shape check agrees", async () => {
    const { generateToken, isTokenShape } = await import("./token")
    const token = generateToken()
    expect(token).toHaveLength(43)
    expect(isTokenShape(token)).toBe(true)
  })

  it("never repeat", async () => {
    const { generateToken } = await import("./token")
    const tokens = new Set(Array.from({ length: 200 }, () => generateToken()))
    expect(tokens.size).toBe(200)
  })

  it("are stored as a sha256, not as themselves", async () => {
    const { generateToken, hashToken } = await import("./token")
    const token = generateToken()
    const hash = hashToken(token)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
    expect(hash).not.toContain(token)
    expect(hashToken(token)).toBe(hash)
  })

  it("rejects anything that is not a token before it reaches a query", async () => {
    const { isTokenShape } = await import("./token")
    for (const bad of ["", "short", "a".repeat(44), `${"a".repeat(42)}/`, "../../etc/passwd"]) {
      expect(isTokenShape(bad)).toBe(false)
    }
  })
})
