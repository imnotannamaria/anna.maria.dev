import { cache } from "react"
import type { Locale } from "@/lib/i18n/locales"
import type { Metadata } from "next"
import { toLetter } from "@/components/site/wall/letters"
import { Wall } from "@/components/site/wall/wall"
import { pageLocale, pageMetadata, type LocaleParams } from "@/lib/i18n/page"
import { getApprovedTestimonials } from "@/lib/wall/queries"

/** Approving a letter in the admin puts it on the wall now: rendered per request, not cached. */
export const dynamic = "force-dynamic"

const read = cache((locale: Locale) =>
  getApprovedTestimonials()
    .then((list) => list.map((letter) => toLetter(letter, locale)))
    .catch(() => null),
)

/** An empty wall is not worth a place in a search result, so it is only indexed with letters. */
export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await pageLocale(params)
  const letters = await read(locale)
  return {
    ...(await pageMetadata(params, "wall", "/wall-of-love")),
    robots: letters?.length ? undefined : { index: false, follow: true },
  }
}

export default async function Page({ params }: LocaleParams) {
  const locale = await pageLocale(params)
  // a database that is down costs a line of text on the page, not the page
  return <Wall letters={await read(locale)} />
}
