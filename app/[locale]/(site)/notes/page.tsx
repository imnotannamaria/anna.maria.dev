import { Notes } from "@/components/site/notes/notes"
import { pageLocale, pageMetadata, type LocaleParams } from "@/lib/i18n/page"

export const generateMetadata = ({ params }: LocaleParams) =>
  pageMetadata(params, "notes", "/notes")

export default async function Page({ params }: LocaleParams) {
  await pageLocale(params)
  return <Notes />
}
