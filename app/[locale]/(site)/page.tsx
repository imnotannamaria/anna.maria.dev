import { Home } from "@/components/site/home/home"
import { pageLocale, pageMetadata, type LocaleParams } from "@/lib/i18n/page"

export const generateMetadata = ({ params }: LocaleParams) => pageMetadata(params, "home", "")

export default async function Page({ params }: LocaleParams) {
  await pageLocale(params)
  return <Home />
}
