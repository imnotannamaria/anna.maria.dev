import type { Metadata } from "next"

export function createMetadata({
  title,
  description,
  path = "",
  titleAbsolute = false,
}: {
  title: string
  description: string
  path?: string
  /** Skip the "%s · Anna Maria" root template (use for the home page). */
  titleAbsolute?: boolean
}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://annamaria.app"

  const ogImage = {
    url: `${baseUrl}/images/og-cover.jpg`,
    width: 1200,
    height: 630,
    alt: "Anna Maria — Full-stack Software Engineer",
  }

  return {
    title: titleAbsolute ? { absolute: title } : title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}${path}`,
      images: [ogImage],
      siteName: "Anna Maria",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
    alternates: {
      canonical: `${baseUrl}${path}`,
    },
  }
}
