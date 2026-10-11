import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { ScreenNotFound } from "@/components/site/frame/screen-state"

/** In the language of the page that was not found: the layout above has already set it. */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta")
  return { title: t("notFound") }
}

/**
 * The fallback of last resort. Every unknown address is caught inside the site's frame, by
 * app/[locale]/(site)/[...missing]; this only shows if that route itself is ever out of the way.
 */
export default function NotFound() {
  return <ScreenNotFound />
}
