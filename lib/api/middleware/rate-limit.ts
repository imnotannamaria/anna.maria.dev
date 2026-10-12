import type { Context } from "hono"
import { createMiddleware } from "hono/factory"

type Bucket = { count: number; resetAt: number }

/**
 * In-memory and per-instance, so it resets on cold start and does not coordinate across
 * serverless invocations. That is fine for one phone posting a few times a day — it stops
 * a runaway loop, not a determined attacker. Swap for Upstash if this ever guards
 * something that matters.
 */
const buckets = new Map<string, Bucket>()

/**
 * One request against a bucket. For a handler that is not part of the Hono app (/api/contact):
 * the middleware below is this, with the answer written for it.
 */
export function take(
  bucketKey: string,
  max: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now()
  const existing = buckets.get(bucketKey)
  if (!existing || existing.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs })
    return { ok: true }
  }
  if (existing.count >= max) {
    return { ok: false, retryAfterSec: Math.ceil((existing.resetAt - now) / 1000) }
  }
  existing.count += 1
  return { ok: true }
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown"
  return req.headers.get("x-real-ip") ?? "unknown"
}

/**
 * `key` decides what a bucket counts, and the default — the caller's IP — is only right when
 * the caller is the browser. It is not always: anything the browser reaches through
 * `next/image` arrives here from the server's own loopback, so every visitor lands in one
 * bucket and the limit becomes a global cap rather than a per-visitor one. A route in that
 * position should key on whatever it is actually trying to protect. See routes/poster.ts.
 */
export function rateLimit({
  max = 30,
  windowMs = 5 * 60 * 1000,
  key,
}: {
  max?: number
  windowMs?: number
  key?: (c: Context) => string
} = {}) {
  return createMiddleware(async (c, next) => {
    const taken = take(key ? key(c) : clientIp(c.req.raw), max, windowMs)
    if (!taken.ok) {
      return c.json({ error: "rate_limited" }, 429, { "retry-after": String(taken.retryAfterSec) })
    }
    await next()
  })
}
