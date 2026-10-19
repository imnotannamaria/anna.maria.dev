import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { ScreenNotFound } from "@/components/site/frame/screen-state"

/** In the language of the page that was not found: the layout above has already set it. */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta")
  return { title: t("notFound") }
}

export default function NotFound() {
  return <ScreenNotFound />
}
