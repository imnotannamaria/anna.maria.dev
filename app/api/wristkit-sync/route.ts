import { timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { createDb, dbUrl } from "@/lib/db/client"
import { samples } from "@/lib/wristkit/schema"
import { IngestPayloadSchema } from "@/lib/wristkit/validation"

const MAX_BODY_BYTES = 256 * 1024
const RATE_LIMIT_MAX = 30
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

function rateLimit(ip: string): { ok: boolean; retryAfterSec: number } {
  const now = Date.now()
  const existing = buckets.get(ip)
  if (!existing || existing.resetAt <= now) {
    buckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { ok: true, retryAfterSec: 0 }
  }
  if (existing.count >= RATE_LIMIT_MAX) {
    return { ok: false, retryAfterSec: Math.ceil((existing.resetAt - now) / 1000) }
  }
  existing.count += 1
  return { ok: true, retryAfterSec: 0 }
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown"
  return req.headers.get("x-real-ip") ?? "unknown"
}

function apiKeyMatches(provided: string | null, expected: string | undefined): boolean {
  if (!provided || !expected) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export async function POST(req: Request) {
  const ip = clientIp(req)
  const rl = rateLimit(ip)
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "retry-after": String(rl.retryAfterSec) } },
    )
  }

  if (!req.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "expected application/json" }, { status: 415 })
  }

  const contentLength = Number(req.headers.get("content-length") ?? "0")
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "payload too large" }, { status: 413 })
  }

  if (!apiKeyMatches(req.headers.get("x-api-key"), process.env.WRISTKIT_API_KEY)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const url = dbUrl()
  if (!url) {
    return NextResponse.json({ error: "db not configured" }, { status: 500 })
  }

  const json = await req.json().catch(() => null)
  const parsed = IngestPayloadSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid payload", issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const recordedAt = new Date()
  const rows = [
    { metric: "kcal" as const, value: parsed.data.moveKcal, unit: "kcal" },
    { metric: "exercise_minutes" as const, value: parsed.data.exerciseMin, unit: "min" },
    { metric: "steps" as const, value: parsed.data.steps, unit: "count" },
  ]

  const { db } = createDb(url)
  try {
    await db.insert(samples).values(
      rows.map((r) => ({
        metric: r.metric,
        value: r.value.toString(),
        unit: r.unit,
        recordedAt,
        source: "apple_watch",
      })),
    )
  } catch (err) {
    console.error("[wristkit-sync] ingest failed", err)
    return NextResponse.json({ error: "ingest failed" }, { status: 500 })
  }

  return NextResponse.json({ ok: true, inserted: rows.length })
}
