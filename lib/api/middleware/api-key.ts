import { createHash, timingSafeEqual } from "node:crypto"
import { createMiddleware } from "hono/factory"

const digest = (value: string) => createHash("sha256").update(value).digest()

/**
 * Constant-time comparison, so response timing doesn't leak how much of the key matched.
 * Both sides are hashed first: timingSafeEqual throws on a length mismatch, and checking the
 * length beforehand would answer "how long is the key" to anyone who asks.
 */
function keyMatches(provided: string | undefined, expected: string | undefined): boolean {
  if (!provided || !expected) return false
  return timingSafeEqual(digest(provided), digest(expected))
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
