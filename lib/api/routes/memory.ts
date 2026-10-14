import { Hono, type Context } from "hono"
import { dbUrl } from "@/lib/db/client"
import { notifyRecord } from "@/lib/memory/notify"
import { claimRound, finishRound, getBoard, startRound } from "@/lib/memory/scores"
import { claimSchema, finishSchema } from "@/lib/memory/validation"
import { clientIp, rateLimit } from "../middleware/rate-limit"
import { jsonBody } from "../middleware/json-body"

export const memory = new Hono()

/**
 * The memory game's board. Public, and every write is limited per address: a round is a click,
 * so a script could otherwise fill the table. The time is the server's (see
 * docs/sql/009-memory-scores.sql); what the page sends is only which round, how many moves and a
 * name, and a name goes nowhere until it is approved in the admin.
 */
const limit = (name: string, max: number) =>
  rateLimit({ max, windowMs: 10 * 60 * 1000, key: (c) => `memory-${name}:${clientIp(c.req.raw)}` })

const NO_STORE = { "Cache-Control": "no-store" }

// a missing database is a 503 the page can tell apart from a round that is not open
const down = (c: Context) => c.json({ error: "unavailable" }, 503)

memory.get("/board", limit("board", 120), async (c) => {
  if (!dbUrl()) return down(c)
  const board = await getBoard().catch(() => null)
  if (!board) return down(c)
  return c.json({ board }, 200, NO_STORE)
})

memory.post("/start", limit("start", 30), async (c) => {
  if (!dbUrl()) return down(c)
  const id = await startRound().catch(() => null)
  if (!id) return down(c)
  return c.json({ id }, 201, NO_STORE)
})

memory.post("/finish", limit("finish", 30), jsonBody({ maxBytes: 1024 }), async (c) => {
  const parsed = finishSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: "invalid" }, 400)
  if (!dbUrl()) return down(c)
  const result = await finishRound(parsed.data.id, parsed.data.moves).catch(() => undefined)
  if (result === undefined) return down(c)
  if (result === null) return c.json({ error: "not_found" }, 404)
  return c.json(result, 200, NO_STORE)
})

memory.post("/claim", limit("claim", 5), jsonBody({ maxBytes: 1024 }), async (c) => {
  const parsed = claimSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) {
    return c.json({ error: "invalid", issue: parsed.error.issues[0]?.message ?? "name" }, 400)
  }
  if (!dbUrl()) return down(c)
  const row = await claimRound(parsed.data.id, parsed.data.name).catch(() => undefined)
  if (row === undefined) return down(c)
  if (row === null) return c.json({ error: "not_found" }, 404)
  await notifyRecord({ ...row, origin: new URL(c.req.url).origin })
  return c.json({ ok: true, status: "submitted" }, 201, NO_STORE)
})
