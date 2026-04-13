import type { Metadata } from "next"

export function createMetadata({
  title,
  description,
  path = "",
}: {
  title: string
  description: string
  path?: string
}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://anna-maria-dev.vercel.app"

  return {
    title,
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
