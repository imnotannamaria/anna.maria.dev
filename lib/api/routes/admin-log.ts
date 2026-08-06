import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { revalidatePath } from "next/cache"
import { createEntry, deleteEntry, updateEntry } from "@/lib/log/mutations"
import { logEntryInputSchema } from "@/lib/log/validation"
import { requireAdminApi } from "../middleware/require-admin"
import { jsonBody } from "../middleware/json-body"

export const adminLog = new Hono()

// Every route below is behind the allowlist. The proxy matcher covers /api/v1/admin too,
// but this is the check that actually decides — a matcher can be edited wrong.
adminLog.use("*", requireAdminApi)

const validate = zValidator("json", logEntryInputSchema, (result, c) => {
  if (!result.success) {
    return c.json({ error: "invalid payload", issues: result.error.issues }, 400)
  }
})

/** Publishing should show up immediately rather than waiting out the 5m ISR window. */
function revalidateLog() {
  revalidatePath("/log")
  revalidatePath("/admin/log")
}

adminLog.post("/", jsonBody(), validate, async (c) => {
  const row = await createEntry(c.req.valid("json"))
  revalidateLog()
  return c.json({ ok: true, entry: row }, 201)
})

adminLog.patch("/:id", jsonBody(), validate, async (c) => {
  const row = await updateEntry(c.req.param("id"), c.req.valid("json"))
  if (!row) return c.json({ error: "not_found" }, 404)
  revalidateLog()
  return c.json({ ok: true, entry: row })
})

adminLog.delete("/:id", async (c) => {
  const row = await deleteEntry(c.req.param("id"))
  if (!row) return c.json({ error: "not_found" }, 404)
  revalidateLog()
  return c.json({ ok: true })
})
