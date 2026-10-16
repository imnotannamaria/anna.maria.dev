import { createMiddleware } from "hono/factory"

const MAX_BODY_BYTES = 256 * 1024

/**
 * Cheap request checks that run before anything expensive. Both are header-only, so a
 * junk request is rejected without reading or parsing a body.
 */
export function jsonBody({ maxBytes = MAX_BODY_BYTES } = {}) {
  return createMiddleware(async (c, next) => {
    // the media type itself, not a header that merely mentions it: `text/plain;x=application/json`
    // is a type a cross-site form can send without a preflight
    const type = c.req.header("content-type")?.split(";")[0]?.trim().toLowerCase()
    if (type !== "application/json") {
      return c.json({ error: "expected application/json" }, 415)
    }

    const contentLength = Number(c.req.header("content-length") ?? "0")
    if (Number.isFinite(contentLength) && contentLength > maxBytes) {
      return c.json({ error: "payload too large" }, 413)
    }

    await next()
  })
}
