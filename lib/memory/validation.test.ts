import { describe, expect, it } from "vitest"
import { formatMs } from "./constants"
import { boardName, claimSchema, finishSchema } from "./validation"

const ID = "3f0c1f0e-7a55-4c1d-9b55-0d7b1a3d2e11"

describe("a name for the board", () => {
  it.each(["Anna", "Maria José", "João-Pedro", "d'Ávila", "李雷", "ana_02"])("takes %s", (name) => {
    expect(boardName.safeParse(name).success).toBe(true)
  })

  it("trims it and collapses inner spaces", () => {
    expect(boardName.parse("  Anna    Maria ")).toBe("Anna Maria")
  })

  it.each([
    ["nothing", "   ", "empty"],
    ["more than 24 characters", "a".repeat(25), "long"],
    ["markup", "<b>hi</b>", "chars"],
    ["an emoji", "anna 🐱", "chars"],
    ["a line break", "anna\u0000", "chars"],
    ["an address", "meusite.com", "link"],
    ["a scheme", "https anna", "link"],
    ["www", "www.anna", "link"],
  ])("refuses %s", (_label, name, issue) => {
    const result = boardName.safeParse(name)
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe(issue)
  })
})

describe("what the page sends", () => {
  it("needs a round id and at least eight moves to finish", () => {
    expect(finishSchema.safeParse({ id: ID, moves: 8 }).success).toBe(true)
    expect(finishSchema.safeParse({ id: ID, moves: 7 }).success).toBe(false)
    expect(finishSchema.safeParse({ id: "1", moves: 12 }).success).toBe(false)
  })

  it("never takes a time from the page", () => {
    expect(finishSchema.safeParse({ id: ID, moves: 12, ms: 1 }).success).toBe(false)
    expect(claimSchema.safeParse({ id: ID, name: "Anna", ms: 1 }).success).toBe(false)
  })
})

describe("formatMs", () => {
  it.each([
    [42_300, "0:42.3"],
    [61_049, "1:01.0"],
    [5_000, "0:05.0"],
  ])("%i ms is %s", (ms, text) => {
    expect(formatMs(ms)).toBe(text)
  })
})
