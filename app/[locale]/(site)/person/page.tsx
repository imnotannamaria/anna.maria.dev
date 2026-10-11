import { Person } from "@/components/site/person/person"
import { getPublishedEntries } from "@/lib/log/queries"
import { pageLocale, pageMetadata, type LocaleParams } from "@/lib/i18n/page"

/** The log comes from Postgres and is meant to read as live: rendered per request, not cached. */
export const dynamic = "force-dynamic"

export const generateMetadata = ({ params }: LocaleParams) =>
  pageMetadata(params, "person", "/person")

export default async function Page({ params }: LocaleParams) {
  await pageLocale(params)
  // a database that is down costs a line of text on the page, not the page
  const entries = await getPublishedEntries().catch(() => null)
  return <Person log={entries} />
}
