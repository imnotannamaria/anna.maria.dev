import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Post } from "@/components/site/post/post"
import { createMetadata } from "@/lib/metadata"
import { getPublishedPosts } from "@/lib/velite"

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getPublishedPosts().map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entry = getPublishedPosts().find((item) => item.slug === slug)
  if (!entry) return {}

  const base = createMetadata({
    title: entry.title,
    description: entry.description,
    path: `/notes/${slug}`,
  })
  // its own card: the title on the site's cover design
  const image = `/api/og?title=${encodeURIComponent(entry.title)}`
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: entry.date,
      images: [image],
    },
    twitter: { ...base.twitter, images: [image] },
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  if (!getPublishedPosts().some((item) => item.slug === slug)) notFound()
  return <Post slug={slug} />
}
