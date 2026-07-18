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

  return {
    title: titleAbsolute ? { absolute: title } : title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}${path}`,
      images: [`${baseUrl}/api/og?title=${encodeURIComponent(title)}`],
      siteName: "Anna Maria",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${baseUrl}${path}`,
    },
  }
}
