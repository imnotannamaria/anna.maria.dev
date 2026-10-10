import { Log } from "@/components/site/log/log"
import { getPublishedEntries } from "@/lib/log/queries"
import { createMetadata } from "@/lib/metadata"

export const metadata = createMetadata({
  title: "Log",
  description:
    "A single feed for everything I finish: films, series, books, albums, podcasts and games.",
  path: "/log",
})

/** The log comes from Postgres and is meant to read as live: rendered per request, not cached. */
export const dynamic = "force-dynamic"

export default async function Page() {
  // a database that is down costs a line of text on the page, not the page
  const entries = await getPublishedEntries().catch(() => null)
  return <Log entries={entries} />
}
