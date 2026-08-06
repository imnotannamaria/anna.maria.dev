import { timingSafeEqual } from "node:crypto"
import { createMiddleware } from "hono/factory"

/**
 * Constant-time comparison, so response timing doesn't leak how much of the key matched.
 * timingSafeEqual throws on length mismatch, hence the length check first — that does leak
 * the key's length, which is not worth defending against.
 */
function keyMatches(provided: string | undefined, expected: string | undefined): boolean {
  if (!provided || !expected) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/** Guards a route with a shared secret read from `envVar`. */
export function apiKeyAuth(envVar: string) {
  return createMiddleware(async (c, next) => {
    if (!keyMatches(c.req.header("x-api-key"), process.env[envVar])) {
      return c.json({ error: "unauthorized" }, 401)
    }
    await next()
  })
}
