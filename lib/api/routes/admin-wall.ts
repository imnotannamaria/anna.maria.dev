import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { removeAvatar } from "@/lib/wall/avatar"
import { createInvite, decide, deleteEntry, renewInvite } from "@/lib/wall/mutations"
import { decisionSchema, inviteInputSchema } from "@/lib/wall/validation"
import { requireAdminApi } from "../middleware/require-admin"
import { jsonBody } from "../middleware/json-body"

export const adminWall = new Hono()

// Every route below is behind the allowlist. The proxy matcher covers /api/v1/admin too,
// but this is the check that actually decides — a matcher can be edited wrong.
adminWall.use("*", requireAdminApi)

/** The link, built from the request's own origin so it points at whichever host made it. */
function inviteUrl(origin: string, token: string) {
  return `${origin}/invite/${token}`
}

adminWall.post(
  "/",
  jsonBody(),
  zValidator("json", inviteInputSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: "invalid payload", issues: result.error.issues }, 400)
    }
  }),
  async (c) => {
    const invite = await createInvite(c.req.valid("json"))
    return c.json(
      {
        ok: true,
        id: invite.id,
        url: inviteUrl(new URL(c.req.url).origin, invite.token),
        expiresAt: invite.expiresAt,
      },
      201,
    )
  },
)

/** A new link and another day, for an invite nobody used. The old link stops working. */
adminWall.post("/:id/renew", async (c) => {
  const invite = await renewInvite(c.req.param("id"))
  if (!invite) return c.json({ error: "not_found" }, 404)
  return c.json({
    ok: true,
    id: invite.id,
    url: inviteUrl(new URL(c.req.url).origin, invite.token),
    expiresAt: invite.expiresAt,
  })
})

adminWall.patch(
  "/:id",
  jsonBody(),
  zValidator("json", decisionSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: "invalid payload", issues: result.error.issues }, 400)
    }
  }),
  async (c) => {
    const row = await decide(c.req.param("id"), c.req.valid("json").status)
    if (!row) return c.json({ error: "not_found" }, 404)
    return c.json({ ok: true, status: row.status })
  },
)

adminWall.delete("/:id", async (c) => {
  const row = await deleteEntry(c.req.param("id"))
  if (!row) return c.json({ error: "not_found" }, 404)
  await removeAvatar(row.avatarUrl)
  return c.json({ ok: true })
})
