import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { createItem, deleteItem, updateItem } from "@/lib/roadmap/mutations"
import { roadmapItemInputSchema } from "@/lib/roadmap/validation"
import { requireAdminApi } from "../middleware/require-admin"
import { jsonBody } from "../middleware/json-body"

export const adminRoadmap = new Hono()

// Every route below is behind the allowlist. The proxy matcher covers /api/v1/admin too,
// but this is the check that actually decides — a matcher can be edited wrong.
adminRoadmap.use("*", requireAdminApi)

const validate = zValidator("json", roadmapItemInputSchema, (result, c) => {
  if (!result.success) {
    return c.json({ error: "invalid payload", issues: result.error.issues }, 400)
  }
})

// No revalidatePath anywhere below. /roadmap and everything under /admin render per
// request, so there is no cache entry to bust. shipped_at is set by the mutation layer,
// not by the client — a payload claiming one is ignored.

adminRoadmap.post("/", jsonBody(), validate, async (c) => {
  const row = await createItem(c.req.valid("json"))
  return c.json({ ok: true, item: row }, 201)
})

adminRoadmap.patch("/:id", jsonBody(), validate, async (c) => {
  const row = await updateItem(c.req.param("id"), c.req.valid("json"))
  if (!row) return c.json({ error: "not_found" }, 404)
  return c.json({ ok: true, item: row })
})

adminRoadmap.delete("/:id", async (c) => {
  const row = await deleteItem(c.req.param("id"))
  if (!row) return c.json({ error: "not_found" }, 404)
  return c.json({ ok: true })
})
