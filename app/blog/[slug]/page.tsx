import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getPublishedPosts, getPostBySlug } from "@/lib/velite"
import { formatDate, estimateReadingTime } from "@/lib/utils"
import { MDXContent } from "@/components/blog/mdx-content"
import { ReadingProgress } from "@/components/blog/reading-progress"
import { Badge } from "@/components/ui/badge"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getPublishedPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) return {}

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://anna-maria-dev.vercel.app"

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      images: [`${baseUrl}/api/og?title=${encodeURIComponent(post.title)}`],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) notFound()

  const readingTime = estimateReadingTime(post.body)

  return (
    <>
      <ReadingProgress />

      <article className="mx-auto w-full max-w-275 px-5 py-16">
        <header className="mb-10 max-w-2xl">
          <h1 className="font-display text-text-primary mb-4 text-3xl leading-tight font-bold sm:text-4xl">
            {post.title}
          </h1>

          <div className="text-text-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <time dateTime={post.date} className="font-mono">
              {formatDate(post.date)}
            </time>
            <span aria-hidden="true">·</span>
            <span>{readingTime} min read</span>
            <span aria-hidden="true">·</span>
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>
        </header>

        <div className="max-w-2xl">
          <MDXContent code={post.body} />
        </div>
      </article>
    </>
  )
}
