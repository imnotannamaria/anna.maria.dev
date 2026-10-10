import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { OpenProject } from "@/components/site/project/open-project"
import { createMetadata } from "@/lib/metadata"
import { getPublishedProjects } from "@/lib/velite"

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getPublishedProjects().map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entry = getPublishedProjects().find((item) => item.slug === slug)
  if (!entry) return {}

  const base = createMetadata({
    title: entry.title,
    description: entry.description,
    path: `/projects/${slug}`,
  })
  // its own card: the title on the site's cover design
  const image = `/api/og?title=${encodeURIComponent(entry.title)}`
  return {
    ...base,
    openGraph: { ...base.openGraph, type: "website", images: [image] },
    twitter: { ...base.twitter, images: [image] },
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  if (!getPublishedProjects().some((item) => item.slug === slug)) notFound()
  return <OpenProject slug={slug} />
}
