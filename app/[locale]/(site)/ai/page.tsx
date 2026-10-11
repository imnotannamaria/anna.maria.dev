import { pageLocale, pageMetadata, type LocaleParams } from "@/lib/i18n/page"

export const generateMetadata = ({ params }: LocaleParams) => pageMetadata(params, "ai", "/ai")

export default async function Page({ params }: LocaleParams) {
  await pageLocale(params)
  // this side is drawn by the layout, which keeps it mounted across pages; the route names it
  return null
}
