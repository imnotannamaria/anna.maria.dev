import { Hono } from "hono"
import { getPublicItems } from "@/lib/roadmap/queries"
import { rateLimit } from "../middleware/rate-limit"

/**
 * The public read of the roadmap. The only consumer is the sidebar dialog, which fetches
 * this the first time it is opened.
 *
 * It exists so the sidebar does not have to read Postgres. The sidebar renders in the root
 * layout, so a query there would happen on every page — dragging /about, /blog and every
 * MDX route into force-dynamic to serve a panel most visitors never open.
 *
 * /roadmap does not come through here. It is a server component and calls getPublicItems()
 * directly; going over HTTP to talk to itself would only add a hop.
 *
 * This is the first unauthenticated route in the app, so it is rate limited and it reads
 * nothing off the request. `raw` items are filtered in the query, not here — the filter
 * belongs next to the table, where every future caller inherits it.
 */
export const roadmap = new Hono()

roadmap.use("*", rateLimit({ max: 60, windowMs: 5 * 60 * 1000 }))

roadmap.get("/", async (c) => {
  const items = await getPublicItems()
  return c.json({ items })
})
