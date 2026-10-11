import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { ScreenRemoved } from "@/components/site/frame/screen-state"
import { pageLocale, type LocaleParams } from "@/lib/i18n/page"

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await pageLocale(params)
  const t = await getTranslations({ locale, namespace: "meta" })
  return { title: t("removed"), robots: { index: false, follow: true } }
}

/** This page left the site in v3. The address still answers, to say so. */
export default async function Page({ params }: LocaleParams) {
  const locale = await pageLocale(params)
  const t = await getTranslations({ locale, namespace: "meta" })
  return <ScreenRemoved name={t("piano")} />
}
