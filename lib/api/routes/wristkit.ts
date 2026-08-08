import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { createDb, dbUrl } from "@/lib/db/client"
import { samples } from "@/lib/wristkit/schema"
import { IngestPayloadSchema } from "@/lib/wristkit/validation"
import { apiKeyAuth } from "../middleware/api-key"
import { jsonBody } from "../middleware/json-body"
import { rateLimit } from "../middleware/rate-limit"

export const wristkit = new Hono()

/**
 * Ingest from the iPhone Shortcut. One POST becomes three rows, one per metric.
 *
 * Middleware order is deliberate and matches the old route handler: rate limit, header
 * checks, API key, then parse. Reordering it would let an unauthenticated caller make us
 * parse a body.
 */
wristkit.post(
  "/sync",
  rateLimit({ max: 30, windowMs: 5 * 60 * 1000 }),
  jsonBody(),
  apiKeyAuth("WRISTKIT_API_KEY"),
  zValidator("json", IngestPayloadSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: "invalid payload", issues: result.error.issues }, 400)
    }
  }),
  async (c) => {
    const url = dbUrl()
    if (!url) return c.json({ error: "db not configured" }, 500)

    const payload = c.req.valid("json")
    const recordedAt = new Date()
    const rows = [
      { metric: "kcal" as const, value: payload.moveKcal, unit: "kcal" },
      { metric: "exercise_minutes" as const, value: payload.exerciseMin, unit: "min" },
      { metric: "steps" as const, value: payload.steps, unit: "count" },
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
      console.error("[wristkit] ingest failed", err)
      return c.json({ error: "ingest failed" }, 500)
    }

    return c.json({ ok: true, inserted: rows.length })
  },
)
