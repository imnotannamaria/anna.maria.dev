import { dbUrl } from "@/lib/db/client"
import { getTodayActivity } from "@/lib/wristkit/queries"

export type Goals = {
  kcal: number
  exerciseMinutes: number
  steps: number
}

export const DEFAULT_GOALS: Goals = {
  kcal: 600,
  exerciseMinutes: 30,
  steps: 8000,
}

export type TodayData = {
  kcal: number
  kcalGoal: number
  exerciseMinutes: number
  exerciseGoal: number
  steps: number
  stepsGoal: number
  lastSyncIso: string
  lastSyncLabel: string
  hoursSinceSync: number
}

export type TodayState =
  | { kind: "loading" }
  | { kind: "empty" }
  | { kind: "error"; message?: string }
  | { kind: "stale"; data: TodayData }
  | { kind: "ok"; data: TodayData }

export type LoadOptions = {
  tz?: string
  goals?: Partial<Goals>
}

const STALE_MS = 24 * 60 * 60 * 1000

function formatHourMinute(d: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: tz,
  }).format(d)
}

export async function loadTodayActivity(options: LoadOptions = {}): Promise<TodayState> {
  const url = dbUrl()
  if (!url) return { kind: "error", message: "DATABASE_URL not set" }

  const tz = options.tz ?? "UTC"
  const goals: Goals = { ...DEFAULT_GOALS, ...options.goals }

  try {
    const r = await getTodayActivity(url, tz)
    if (!r.lastSync) return { kind: "empty" }

    const ageMs = Date.now() - r.lastSync.getTime()
    const data: TodayData = {
      kcal: r.kcal ?? 0,
      kcalGoal: goals.kcal,
      exerciseMinutes: r.exerciseMinutes ?? 0,
      exerciseGoal: goals.exerciseMinutes,
      steps: r.steps ?? 0,
      stepsGoal: goals.steps,
      lastSyncIso: r.lastSync.toISOString(),
      lastSyncLabel: formatHourMinute(r.lastSync, tz),
      hoursSinceSync: Math.max(1, Math.round(ageMs / (60 * 60 * 1000))),
    }

    if (ageMs > STALE_MS) return { kind: "stale", data }
    return { kind: "ok", data }
  } catch (err) {
    return {
      kind: "error",
      message: err instanceof Error ? err.message : "unknown",
    }
  }
}
