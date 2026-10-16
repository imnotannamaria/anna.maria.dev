import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { decideScore, deleteScore } from "@/lib/memory/scores"
import { memoryDecisionSchema } from "@/lib/memory/validation"
import { requireAdminApi } from "../middleware/require-admin"
import { jsonBody } from "../middleware/json-body"

export const adminMemory = new Hono()

// Every route below is behind the allowlist, whatever the proxy matcher says.
adminMemory.use("*", requireAdminApi)

adminMemory.patch(
  "/:id",
  jsonBody(),
  zValidator("json", memoryDecisionSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: "invalid payload", issues: result.error.issues }, 400)
    }
  }),
  async (c) => {
    const row = await decideScore(c.req.param("id"), c.req.valid("json").status)
    if (!row) return c.json({ error: "not_found" }, 404)
    return c.json({ ok: true, status: row.status })
  },
)

adminMemory.delete("/:id", async (c) => {
  const row = await deleteScore(c.req.param("id"))
  if (!row) return c.json({ error: "not_found" }, 404)
  return c.json({ ok: true })
})
