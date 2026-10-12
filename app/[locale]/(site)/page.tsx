import { Home } from "@/components/site/home/home"
import { pageLocale, pageMetadata, type LocaleParams } from "@/lib/i18n/page"

/**
 * Rebuilt once a day. The page has no data of its own, but it does arithmetic on today: the years
 * in the first sentence and the end of the career's ruler. Fully static, it kept the date of the
 * last deploy, and a January with no deploy would have gone on saying last year.
 */
export const revalidate = 86400

export const generateMetadata = ({ params }: LocaleParams) => pageMetadata(params, "home", "")

export default async function Page({ params }: LocaleParams) {
  await pageLocale(params)
  return <Home />
}
