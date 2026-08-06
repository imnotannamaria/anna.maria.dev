import { Hono } from "hono"
import { whoami } from "./routes/whoami"
import { wristkit } from "./routes/wristkit"

/**
 * The app's API. Mounted once, at app/api/v1/[[...route]]/route.ts.
 *
 * /api/contact, /api/og and /api/now-playing stay as plain route handlers — they work,
 * and moving them would add risk without buying anything.
 */
export const app = new Hono().basePath("/api/v1")

app.route("/wristkit", wristkit)

// Phase 2 spike. Goes away with lib/api/routes/whoami.ts.
app.route("/whoami", whoami)

app.onError((err, c) => {
  console.error("[api]", err)
  return c.json({ error: "internal_error" }, 500)
})

app.notFound((c) => c.json({ error: "not_found" }, 404))
