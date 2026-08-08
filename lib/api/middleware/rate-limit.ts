import { createMiddleware } from "hono/factory"

type Bucket = { count: number; resetAt: number }

/**
 * In-memory and per-instance, so it resets on cold start and does not coordinate across
 * serverless invocations. That is fine for one phone posting a few times a day — it stops
 * a runaway loop, not a determined attacker. Swap for Upstash if this ever guards
 * something that matters.
 */
const buckets = new Map<string, Bucket>()

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown"
  return req.headers.get("x-real-ip") ?? "unknown"
}

export function rateLimit({ max = 30, windowMs = 5 * 60 * 1000 } = {}) {
  return createMiddleware(async (c, next) => {
    const ip = clientIp(c.req.raw)
    const now = Date.now()
    const existing = buckets.get(ip)

    if (!existing || existing.resetAt <= now) {
      buckets.set(ip, { count: 1, resetAt: now + windowMs })
      return next()
    }

    if (existing.count >= max) {
      const retryAfterSec = Math.ceil((existing.resetAt - now) / 1000)
      return c.json({ error: "rate_limited" }, 429, { "retry-after": String(retryAfterSec) })
    }

    existing.count += 1
    await next()
  })
}
