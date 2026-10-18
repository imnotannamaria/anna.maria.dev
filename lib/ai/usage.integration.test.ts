import postgres from "postgres"
import { describe, expect, it } from "vitest"
import { DAILY_CAP_MICRO, PER_VISITOR } from "./limits"
import { admit, settle } from "./usage"

const sql = () => postgres(process.env.DATABASE_URL as string, { prepare: false })

/** Moves a visitor's last question into the past, the way waiting would. */
async function wait(visitor: string) {
  const db = sql()
  try {
    await db`update ai_visitors set last_at = now() - interval '1 minute' where visitor = ${visitor}`
  } finally {
    await db.end()
  }
}
async function spentToday(): Promise<number> {
  const db = sql()
  try {
    const [row] = await db`select micro_usd from ai_usage where day = current_date`
    return Number(row?.micro_usd ?? 0)
  } finally {
    await db.end()
  }
}

describe("admit", () => {
  it("lets a first question through and holds a second one that comes too soon", async () => {
    expect(await admit("ana", 100)).toEqual({
      ok: true,
      day: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    })
    expect(await admit("ana", 100)).toEqual({ ok: false, reason: "slow" })
    // a refused question is not counted against the day
    expect(await spentToday()).toBe(100)
  })

  it("stops a visitor at the daily limit, and not the next visitor", async () => {
    for (let i = 0; i < PER_VISITOR; i++) {
      expect(await admit("bia", 1)).toEqual({
        ok: true,
        day: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      })
      await wait("bia")
    }
    expect(await admit("bia", 1)).toEqual({ ok: false, reason: "visitor" })
    expect(await admit("caio", 1)).toEqual({
      ok: true,
      day: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    })
  })

  it("stops everyone when the day's budget is spent", async () => {
    expect(await admit("dora", DAILY_CAP_MICRO)).toEqual({
      ok: true,
      day: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    })
    expect(await admit("enzo", 1)).toEqual({ ok: false, reason: "budget" })
    expect(await spentToday()).toBe(DAILY_CAP_MICRO)
  })

  it("never lets two racing questions both take the last of the budget", async () => {
    const half = DAILY_CAP_MICRO / 2 + 1
    const results = await Promise.all(["f1", "f2", "f3"].map((visitor) => admit(visitor, half)))
    expect(results.filter((result) => result.ok)).toHaveLength(1)
    expect(await spentToday()).toBeLessThanOrEqual(DAILY_CAP_MICRO)
  })
})

describe("settle", () => {
  it("swaps what was set aside for what the answer cost", async () => {
    const admission = await admit("gabi", 750)
    if (!admission.ok) throw new Error("expected admission")
    await settle(admission.day, 750, 120)
    expect(await spentToday()).toBe(120)
  })
})

it("settles the reserved day without changing today's budget", async () => {
  const db = sql()
  try {
    const [row] = await db`insert into ai_usage (day, requests, micro_usd)
      values (current_date - 1, 1, 750) returning day::text as day`
    await db`insert into ai_usage (day, requests, micro_usd) values (current_date, 1, 900)`
    await settle(row.day, 750, 120)
    const [yesterday] = await db`select micro_usd from ai_usage where day = ${row.day}::date`
    expect(Number(yesterday.micro_usd)).toBe(120)
    expect(await spentToday()).toBe(900)
  } finally {
    await db.end()
  }
})
