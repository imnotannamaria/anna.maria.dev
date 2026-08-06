import { app } from "@/lib/api/app"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Legacy path. The real handler lives at /api/v1/wristkit/sync now; this stays because an
 * iPhone Shortcut still posts here. Body, headers and API key pass through untouched, so
 * the Shortcut sees exactly the responses it saw before.
 *
 * Delete once the Shortcut points at the new URL — see the Phase 6 checklist in
 * docs/log-plan.md.
 */
export async function POST(req: Request) {
  const url = new URL(req.url)
  url.pathname = "/api/v1/wristkit/sync"
  return app.fetch(new Request(url, req))
}
