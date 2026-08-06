import { withAuth } from "@workos-inc/authkit-nextjs"
import { createMiddleware } from "hono/factory"
import { isAdminEmail } from "@/lib/auth/require-admin"

/**
 * Same gate as `requireAdmin()` for pages, for the API.
 *
 * Calling `withAuth()` from inside Hono is safe — the Phase 2 spike proved `next/headers`
 * still resolves after the request is handed to `app.fetch()`.
 *
 * 404 rather than 401 or 403, to match the pages. A 403 confirms the route exists.
 */
export const requireAdminApi = createMiddleware(async (c, next) => {
  const { user } = await withAuth().catch(() => ({ user: null }))
  if (!isAdminEmail(user?.email)) return c.json({ error: "not_found" }, 404)
  await next()
})
