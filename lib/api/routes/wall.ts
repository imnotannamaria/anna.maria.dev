import { Hono } from "hono"
import { react } from "@/lib/wall/mutations"
import { reactSchema } from "@/lib/wall/validation"
import { rateLimit } from "../middleware/rate-limit"

export const wall = new Hono()

/**
 * A reaction on a letter of the wall, added or taken back. Public, like the wall: anyone
 * reading a letter can answer it with one of four emoji.
 *
 * Who reacted is not kept, so the server cannot tell a second heart from the same person. The
 * page remembers a visitor's picks and sends each one once; what stops a script is the limit
 * here, which is a few dozen clicks in ten minutes per address.
 */
wall.post(
  "/:id/react",
  rateLimit({
    max: 40,
    windowMs: 10 * 60 * 1000,
    key: (c) => `wall-react:${c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"}`,
  }),
  async (c) => {
    const parsed = reactSchema.safeParse(await c.req.json().catch(() => null))
    if (!parsed.success) return c.json({ error: "invalid" }, 400)

    const counts = await react(c.req.param("id"), parsed.data.reaction, parsed.data.on).catch(
      () => undefined,
    )
    if (counts === undefined) return c.json({ error: "unavailable" }, 503)
    if (counts === null) return c.json({ error: "not_found" }, 404)
    return c.json({ reactions: counts }, 200, { "Cache-Control": "no-store" })
  },
)
