import { and, desc, eq, gte } from "drizzle-orm"
import { createDb } from "./db"
import { samples } from "./schema"
import type { Metric } from "./validation"

function startOfToday(tz: string): Date {
  const now = new Date()
  const local = new Date(now.toLocaleString("en-US", { timeZone: tz }))
  const offsetMs = local.getTime() - now.getTime()
  const midnightInNodeTz = new Date(local.getFullYear(), local.getMonth(), local.getDate())
  return new Date(midnightInNodeTz.getTime() - offsetMs)
}

export async function getLatestByMetric(url: string, metric: Metric, tz: string) {
  const { db } = createDb(url)
  return db
    .select()
    .from(samples)
    .where(and(eq(samples.metric, metric), gte(samples.recordedAt, startOfToday(tz))))
    .orderBy(desc(samples.recordedAt))
    .limit(1)
}

export async function getTodayActivity(url: string, tz: string) {
  const [kcal, ex, steps] = await Promise.all([
    getLatestByMetric(url, "kcal", tz),
    getLatestByMetric(url, "exercise_minutes", tz),
    getLatestByMetric(url, "steps", tz),
  ])

  const lastSync =
    [kcal[0]?.recordedAt, ex[0]?.recordedAt, steps[0]?.recordedAt]
      .filter((x): x is Date => Boolean(x))
      .sort((a, b) => a.getTime() - b.getTime())
      .pop() ?? null

  return {
    kcal: kcal[0]?.value != null ? Number(kcal[0].value) : null,
    exerciseMinutes: ex[0]?.value != null ? Number(ex[0].value) : null,
    steps: steps[0]?.value != null ? Number(steps[0].value) : null,
    lastSync,
  }
}
