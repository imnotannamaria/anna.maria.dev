import type { Metadata } from "next"

export function createMetadata({
  title,
  description,
  path = "",
  titleAbsolute = false,
  locale = "en",
  cover = "Anna Maria, Full-stack Software Engineer",
}: {
  title: string
  description: string
  path?: string
  /** Skip the "%s · Anna Maria" root template (use for the home page). */
  titleAbsolute?: boolean
  /** The language the page is in, for the share card. */
  locale?: "en" | "pt"
  /** What the cover image shows, for whoever cannot see it. */
  cover?: string
}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://annamaria.app"

  // the page's own address in its language, and the pair it belongs to
  const english = `${baseUrl}${path}`
  const portuguese = `${baseUrl}/pt${path === "/" ? "" : path}`
  const here = locale === "pt" ? portuguese : english

  const ogImage = {
    url: `${baseUrl}/images/og-cover.png`,
    width: 1200,
    height: 630,
    alt: cover,
  }

  return {
    title: titleAbsolute ? { absolute: title } : title,
    description,
    openGraph: {
      title,
      description,
      url: here,
      images: [ogImage],
      siteName: "Anna Maria",
      locale: locale === "pt" ? "pt_BR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
    alternates: {
      canonical: here,
      // how a search engine learns there is another language, and which one is the default
      languages: { en: english, "pt-BR": portuguese, "x-default": english },
    },
  }
}
