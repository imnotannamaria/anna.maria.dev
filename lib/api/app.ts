import { Hono } from "hono"
import { adminLog } from "./routes/admin-log"
import { adminWall } from "./routes/admin-wall"
import { ai } from "./routes/ai"
import { bug } from "./routes/bug"
import { poster } from "./routes/poster"
import { site } from "./routes/site"
import { wall } from "./routes/wall"
import { wallInvite } from "./routes/wall-invite"
import { wristkit } from "./routes/wristkit"

/**
 * The app's API. Mounted once, at app/api/v1/[[...route]]/route.ts.
 *
 * /api/contact, /api/og and /api/now-playing stay as plain route handlers — they work,
 * and moving them would add risk without buying anything.
 */
export const app = new Hono().basePath("/api/v1")

app.route("/wristkit", wristkit)
app.route("/poster", poster)
app.route("/site", site)
app.route("/ai", ai)
app.route("/bug", bug)
app.route("/admin/log", adminLog)
app.route("/admin/wall", adminWall)
app.route("/invite", wallInvite)
app.route("/wall", wall)

app.onError((err, c) => {
  console.error("[api]", err)
  return c.json({ error: "internal_error" }, 500)
})

app.notFound((c) => c.json({ error: "not_found" }, 404))
