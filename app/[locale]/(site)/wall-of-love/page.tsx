import type { Metadata } from "next"
import { toLetter } from "@/components/site/wall/letters"
import { Wall } from "@/components/site/wall/wall"
import { pageLocale, pageMetadata, type LocaleParams } from "@/lib/i18n/page"
import { getApprovedTestimonials } from "@/lib/wall/queries"

/** Approving a letter in the admin puts it on the wall now: rendered per request, not cached. */
export const dynamic = "force-dynamic"

const read = () =>
  getApprovedTestimonials()
    .then((list) => list.map(toLetter))
    .catch(() => null)

/** An empty wall is not worth a place in a search result, so it is only indexed with letters. */
export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const letters = await read()
  return {
    ...(await pageMetadata(params, "wall", "/wall-of-love")),
    robots: letters?.length ? undefined : { index: false, follow: true },
  }
}

export default async function Page({ params }: LocaleParams) {
  await pageLocale(params)
  // a database that is down costs a line of text on the page, not the page
  return <Wall letters={await read()} />
}
