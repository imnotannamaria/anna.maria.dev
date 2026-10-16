import { Professional } from "@/components/site/professional/professional"
import { pageLocale, pageMetadata, type LocaleParams } from "@/lib/i18n/page"

export const generateMetadata = ({ params }: LocaleParams) =>
  pageMetadata(params, "professional", "/professional")

export default async function Page({ params }: LocaleParams) {
  await pageLocale(params)
  return <Professional />
}
