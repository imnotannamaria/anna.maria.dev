import { Hono } from "hono"
import { TYPE_LABEL } from "@/lib/log/constants"
import { getPublishedEntries } from "@/lib/log/queries"
import { rateLimit } from "../middleware/rate-limit"

export const site = new Hono()

/**
 * The log as the terminal and the chat read it: type, title, creator and date of every published
 * entry. The same entries /log shows, so there is nothing here a visitor cannot already see.
 *
 * It exists because those two sides live in the layout, which stays static: reading Postgres
 * there would make every page of the site dynamic. They ask for it when they are first opened.
 */
site.get(
  "/log",
  // its own bucket: the default key is the bare IP, which the other routes count on too
  rateLimit({
    max: 30,
    windowMs: 60_000,
    key: (c) => `site-log:${c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"}`,
  }),
  async (c) => {
    const entries = await getPublishedEntries()
    return c.json({
      entries: entries.map((entry) => ({
        type: TYPE_LABEL[entry.type],
        title: entry.title,
        creator: entry.creator,
        loggedAt: entry.loggedAt,
      })),
    })
  },
)
