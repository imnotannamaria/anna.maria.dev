import { describe, expect, it } from "vitest"
import { createDb } from "./db"
import { samples } from "./schema"
import { getTodayActivity } from "./queries"

const { db } = createDb(process.env.DATABASE_URL!)
const TZ = "America/Sao_Paulo"

async function insertSample(
  metric: "kcal" | "exercise_minutes" | "steps",
  value: number,
  recordedAt: Date,
) {
  await db.insert(samples).values({
    metric,
    value: value.toString(),
    unit: metric === "steps" ? "count" : metric === "kcal" ? "kcal" : "min",
    recordedAt,
    source: "test",
  })
}

/** Local midnight for TZ, as a real Date, independent of startOfToday — the function under test. */
function localMidnight(): Date {
  const now = new Date()
  const local = new Date(now.toLocaleString("en-US", { timeZone: TZ }))
  const offsetMs = local.getTime() - now.getTime()
  return new Date(
    new Date(local.getFullYear(), local.getMonth(), local.getDate()).getTime() - offsetMs,
  )
}

describe("getTodayActivity", () => {
  it("excludes a sample from before local midnight", async () => {
    const midnight = localMidnight()
    await insertSample("steps", 5000, new Date(midnight.getTime() - 60_000)) // yesterday, 1 min before
    await insertSample("steps", 1200, new Date(midnight.getTime() + 60_000)) // today, 1 min after

    const activity = await getTodayActivity(process.env.DATABASE_URL!, TZ)
    expect(activity.steps).toBe(1200)
  })

  it("returns null, not 0, for a metric with no sample today", async () => {
    const activity = await getTodayActivity(process.env.DATABASE_URL!, TZ)
    expect(activity.kcal).toBeNull()
    expect(activity.exerciseMinutes).toBeNull()
    expect(activity.steps).toBeNull()
    expect(activity.lastSync).toBeNull()
  })

  it("takes the latest value per metric, and lastSync is the newest of the three", async () => {
    const midnight = localMidnight()
    const earlier = new Date(midnight.getTime() + 60_000)
    const later = new Date(midnight.getTime() + 120_000)

    await insertSample("kcal", 100, earlier)
    await insertSample("kcal", 250, later) // later sample should win
    await insertSample("steps", 500, earlier)

    const activity = await getTodayActivity(process.env.DATABASE_URL!, TZ)

    expect(activity.kcal).toBe(250)
    expect(activity.lastSync?.getTime()).toBe(later.getTime())
  })

  it("converts the numeric column to a JS number", async () => {
    await insertSample("kcal", 342, new Date(localMidnight().getTime() + 60_000))
    const activity = await getTodayActivity(process.env.DATABASE_URL!, TZ)
    expect(typeof activity.kcal).toBe("number")
  })
})
