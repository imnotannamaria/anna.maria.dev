import { notFound } from "next/navigation"
import { pageLocale, type LocaleParams } from "@/lib/i18n/page"

/**
 * Catches every address no other route answers, so the 404 is drawn inside the frame. Without
 * it an unknown URL falls to the root not-found, which has no sidebar and no way back.
 */
export default async function Missing({ params }: LocaleParams) {
  await pageLocale(params)
  notFound()
}
