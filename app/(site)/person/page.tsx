import { Person } from "@/components/site/person/person"
import { getPublishedEntries } from "@/lib/log/queries"
import { createMetadata } from "@/lib/metadata"

export const metadata = createMetadata({
  title: "Anna, the person",
  description:
    "Who I am when the editor is closed: where I live, what I watch and listen to, and the cat.",
  path: "/person",
})

/** The log comes from Postgres and is meant to read as live: rendered per request, not cached. */
export const dynamic = "force-dynamic"

export default async function Page() {
  // a database that is down costs a line of text on the page, not the page
  const entries = await getPublishedEntries().catch(() => null)
  return <Person log={entries} />
}
