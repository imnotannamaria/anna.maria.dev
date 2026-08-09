import { typeBreakdown } from "@/lib/log/counts"
import type { LogEntry } from "@/lib/log/validation"
import { LogCardView } from "./log-card-view"

/** Today in my timezone, as "YYYY-MM-DD". */
function today(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

/** Few enough to stay a highlight rather than a second copy of /log. */
const SHELF_SIZE = 5

/**
 * The log on the home page: a full-width strip under the other widgets.
 *
 * This half stays on the server and does the arithmetic. The view is a client
 * component because the strip is interactive, and "this month" computed on both
 * sides of the boundary is a hydration mismatch waiting for a render that
 * straddles midnight in São Paulo — rare, real, and untraceable when it happens.
 * Counted once here, it can only be one number.
 *
 * Takes the whole published list as a prop rather than querying, so the home page makes
 * one trip to the database. Everything here comes from real columns — there is no goal
 * or streak, because there is no such thing in `log_entries`.
 */
export function LatestLogCard({ entries }: { entries: LogEntry[] }) {
  if (entries.length === 0) return null

  const day = today()
  const month = day.slice(0, 7)
  const year = day.slice(0, 4)

  const favourites = entries.filter((e) => e.favorite)
  // `entries` already arrives albums-first, so filtering keeps that order.
  const shelf = (favourites.length > 0 ? favourites : entries).slice(0, SHELF_SIZE)

  const stats = [
    { label: "this month", value: entries.filter((e) => e.loggedAt.startsWith(month)).length },
    { label: "this year", value: entries.filter((e) => e.loggedAt.startsWith(year)).length },
    { label: "favourites", value: favourites.length },
    { label: "all time", value: entries.length },
  ]

  return (
    <LogCardView
      shelf={shelf}
      stats={stats}
      byType={typeBreakdown(entries)}
      total={entries.length}
    />
  )
}
