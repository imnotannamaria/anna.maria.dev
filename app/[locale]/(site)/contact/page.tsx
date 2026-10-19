import { Contact } from "@/components/site/contact/contact"
import { pageLocale, pageMetadata, type LocaleParams } from "@/lib/i18n/page"

export const generateMetadata = ({ params }: LocaleParams) =>
  pageMetadata(params, "contact", "/contact")

export default async function Page({ params }: LocaleParams) {
  await pageLocale(params)
  return <Contact />
}
