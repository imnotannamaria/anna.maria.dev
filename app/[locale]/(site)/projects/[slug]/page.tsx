import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { OpenProject } from "@/components/site/project/open-project"
import { pageLocale } from "@/lib/i18n/page"
import { createMetadata } from "@/lib/metadata"
import { getPublishedProjects } from "@/lib/velite"

type Props = { params: Promise<{ locale: string; slug: string }> }

export function generateStaticParams() {
  return getPublishedProjects().map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const locale = await pageLocale(params)
  const entry = getPublishedProjects(locale).find((item) => item.slug === slug)
  if (!entry) return {}

  const base = createMetadata({
    locale,
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
  await pageLocale(params)
  if (!getPublishedProjects().some((item) => item.slug === slug)) notFound()
  return <OpenProject slug={slug} />
}
