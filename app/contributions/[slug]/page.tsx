import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { GithubLogoIcon, ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr"
import { getPublishedContributions, getContributionBySlug } from "@/lib/velite"
import { formatDate } from "@/lib/utils"
import { MDXContent } from "@/components/blog/mdx-content"
import { Badge } from "@/components/ui/badge"
import { InlineArrow } from "@/components/ui/inline-arrow"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getPublishedContributions().map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const contribution = getContributionBySlug(slug)

  if (!contribution) return {}

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://anna-maria-dev.vercel.app"

  return {
    title: contribution.title,
    description: contribution.description,
    openGraph: {
      title: contribution.title,
      description: contribution.description,
      type: "website",
      images: [`${baseUrl}/api/og?title=${encodeURIComponent(contribution.title)}`],
    },
    twitter: {
      card: "summary_large_image",
      title: contribution.title,
      description: contribution.description,
    },
  }
}

export default async function ContributionPage({ params }: Props) {
  const { slug } = await params
  const contribution = getContributionBySlug(slug)

  if (!contribution) notFound()

  return (
    <div className="mx-auto w-full max-w-275 px-5 py-16">
      <Link
        href="/contributions"
        className="group text-text-muted hover:text-text-primary mb-10 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <InlineArrow direction="left" />
        All contributions
      </Link>

      <div className="mt-6 flex flex-col gap-10 lg:flex-row lg:gap-16">
        <aside className="shrink-0 lg:sticky lg:top-24 lg:w-56 lg:self-start">
          <h1 className="font-display text-text-primary text-2xl leading-tight font-bold">
            {contribution.title}
          </h1>
          <p className="text-text-secondary mt-2 text-sm leading-relaxed">
            {contribution.description}
          </p>

          <div className="mt-6 flex flex-col gap-2">
            {contribution.repo && (
              <a
                href={contribution.repo}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${contribution.title} repository`}
                className="text-text-secondary hover:text-text-primary flex items-center gap-2 text-sm transition-colors"
              >
                <GithubLogoIcon size={14} />
                Repository
              </a>
            )}
            {contribution.pr && (
              <a
                href={contribution.pr}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${contribution.title} pull request`}
                className="text-text-secondary hover:text-text-primary flex items-center gap-2 text-sm transition-colors"
              >
                <ArrowSquareOutIcon size={14} />
                Pull request
              </a>
            )}
          </div>

          <div className="mt-6">
            <p className="text-text-muted mb-2 text-xs font-medium tracking-widest uppercase">
              Stack
            </p>
            <div className="flex flex-wrap gap-1.5">
              {contribution.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-text-muted mb-1 text-xs font-medium tracking-widest uppercase">
              Date
            </p>
            <time dateTime={contribution.date} className="text-text-secondary font-mono text-sm">
              {formatDate(contribution.date)}
            </time>
          </div>
        </aside>

        <article className="min-w-0 flex-1">
          <MDXContent code={contribution.body} />
        </article>
      </div>
    </div>
  )
}
