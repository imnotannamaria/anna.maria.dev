import type { Metadata, Viewport } from "next"
import { RootShell } from "@/app/root-shell"
import { calcYearsOfExp } from "@/lib/experience"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { LOCALES, isLocale } from "@/lib/i18n/locales"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://annamaria.app"

/** The site's own title and share card, in the language of the page. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : "en"
  const t = await getTranslations({ locale, namespace: "meta" })
  return {
    metadataBase: new URL(baseUrl),
    title: { default: "Anna Maria", template: "%s · Anna Maria" },
    description: t("site", { years: calcYearsOfExp() }),
    openGraph: {
      siteName: "Anna Maria",
      locale: locale === "pt" ? "pt_BR" : "en_US",
      type: "website",
      url: baseUrl,
      images: [{ url: "/images/og-cover.png", width: 1200, height: 630, alt: t("cover") }],
    },
    twitter: { card: "summary_large_image", images: ["/images/og-cover.png"] },
  }
}

/**
 * With a keyboard open, the layout shrinks instead of the keyboard covering it: the terminal's
 * prompt and the chat's field sit at the bottom of the screen. Chrome and Firefox on Android
 * honour this; Safari on iOS does not, and scrolls the focused field into view instead.
 */
export const viewport: Viewport = { interactiveWidget: "resizes-content" }

/** One copy of every page per language, built ahead: the proxy picks which one is served. */
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }))

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  // tells next-intl the language without reading the request, so the page stays static
  setRequestLocale(locale)
  return <RootShell locale={locale}>{children}</RootShell>
}
