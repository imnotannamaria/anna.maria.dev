import { withAuth } from "@workos-inc/authkit-nextjs"
import { Hono } from "hono"

/**
 * THROWAWAY — Phase 2 spike of docs/log-plan.md. Delete before the phase closes.
 *
 * The question: does `withAuth()` still work once a request has been handed from a Next
 * route handler to `app.fetch()`? It reads the session cookie through `next/headers`,
 * which depends on per-request async local storage. Hono runs in the same call stack, so
 * it should be there. Should is not the same as is.
 */
export const whoami = new Hono().get("/", async (c) => {
  try {
    const { user } = await withAuth()
    return c.json({ ok: true, email: user?.email ?? null })
  } catch (err) {
    return c.json({ ok: false, error: String(err) }, 500)
  }
})
