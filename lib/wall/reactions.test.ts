import { describe, expect, it } from "vitest"
import { WALL_REACTIONS, reactionCounts } from "./constants"
import { reactSchema } from "./validation"

describe("reactionCounts", () => {
  it("reads the known reactions and nothing else", () => {
    expect(reactionCounts({ heart: 3, party: 1, up: 5, poop: 99 })).toEqual({
      heart: 3,
      clap: 0,
      party: 1,
    })
  })

  it("survives whatever is in the column", () => {
    const zero = { heart: 0, clap: 0, party: 0 }
    for (const stored of [null, undefined, "x", 4, [], { heart: -2, clap: "many", party: NaN }]) {
      expect(reactionCounts(stored)).toEqual(zero)
    }
  })
})

describe("the reactions", () => {
  it("are heart hands, clapping and party", () => {
    expect(WALL_REACTIONS.map((reaction) => reaction.emoji)).toEqual(["🫶", "👏", "🎉"])
  })

  it("can only be switched on or off, one at a time", () => {
    expect(reactSchema.safeParse({ reaction: "heart", on: true }).success).toBe(true)
    expect(reactSchema.safeParse({ reaction: "heart", on: 5 }).success).toBe(false)
    expect(reactSchema.safeParse({ reaction: "fire", on: true }).success).toBe(false)
    // the thumbs up was taken off the wall; counts already stored under it are ignored
    expect(reactSchema.safeParse({ reaction: "up", on: true }).success).toBe(false)
  })
})
