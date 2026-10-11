import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { createMetadata } from "@/lib/metadata"
import { DEFAULT_LOCALE, isLocale, type Locale } from "./locales"

/** What every page under `app/[locale]` is handed. */
export type LocaleParams = { params: Promise<{ locale: string }> }

/**
 * The first line of every page under `app/[locale]`: reads the language from the address the
 * page was built at and tells next-intl, so the page renders in it without reading the request
 * and stays static.
 */
export async function pageLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE
  setRequestLocale(locale)
  return locale
}

type Listed =
  | "home"
  | "ai"
  | "back"
  | "contact"
  | "log"
  | "notes"
  | "person"
  | "professional"
  | "projects"
  | "wall"

/** A page's title and description in its language, from `meta.<page>` in the messages. */
export async function pageMetadata(
  params: Promise<{ locale: string }>,
  page: Listed,
  path: string,
): Promise<Metadata> {
  const locale = await pageLocale(params)
  const t = await getTranslations({ locale, namespace: "meta" })
  return createMetadata({
    title: t(`${page}.title`),
    description: t(`${page}.description`),
    path,
    titleAbsolute: page === "home",
    locale,
    cover: t("cover"),
  })
}
