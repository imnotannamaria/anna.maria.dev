import { Projects } from "@/components/site/projects/projects"
import { pageLocale, pageMetadata, type LocaleParams } from "@/lib/i18n/page"

export const generateMetadata = ({ params }: LocaleParams) =>
  pageMetadata(params, "projects", "/projects")

export default async function Page({ params }: LocaleParams) {
  await pageLocale(params)
  return <Projects />
}
