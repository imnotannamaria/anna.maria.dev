import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { getPublishedPosts, getPostBySlug, getPostToc, getPostReadingStats } from "@/lib/velite"
import { formatDate } from "@/lib/utils"
import { MDXContent } from "@/components/blog/mdx-content"
import { ReadingProgress } from "@/components/blog/reading-progress"
import { PageOutline } from "@/components/chrome/page-outline"
import { MetaCol, MetaGrid } from "@/components/chrome/page-parts"
import { Badge } from "@/app/components/entrepta/badge"

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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://annamaria.app"

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

  const { words, minutes } = getPostReadingStats(slug)
  const toc = getPostToc(slug)

  return (
    <>
      <ReadingProgress />

      <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 min-[1100px]:grid-cols-[200px_minmax(0,1fr)]">
        {/* The same panel the index pages use. This page had its own copy —
            `components/outline.tsx`, the fourth — identical down to the observer's
            rootMargin and the scroll offset, and the only one that never got the
            staggered entrance when the other three were folded together. */}
        <PageOutline
          items={toc}
          file={`${slug}.mdx`}
          footer={
            <>
              <div className="flex justify-between">
                <span>{"// words"}</span>
                <span>{words.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>{"// read"}</span>
                <span>{minutes} min</span>
              </div>
              <div>{"// markdown · utf-8"}</div>
            </>
          }
        />

        <div className="min-w-0">
          <article className="mx-auto max-w-[760px] px-5 py-12 sm:px-8 lg:px-12">
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="text-mono-sm mb-4 font-mono"
              style={{ color: "var(--fg-muted)" }}
            >
              <Link href="/blog" className="transition-colors hover:text-[color:var(--fg-primary)]">
                ~
              </Link>
              <span aria-hidden style={{ opacity: 0.5, margin: "0 6px" }}>
                /
              </span>
              <Link href="/blog" className="transition-colors hover:text-[color:var(--fg-primary)]">
                posts
              </Link>
              <span aria-hidden style={{ opacity: 0.5, margin: "0 6px" }}>
                /
              </span>
              <span style={{ color: "var(--fg-primary)" }}>{slug}.mdx</span>
            </nav>

            {/* Hero */}
            <header className="mb-12 border-b pb-8" style={{ borderColor: "var(--border-subtle)" }}>
              <div className="mb-4 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="soft" color="brand" className="text-mono-sm h-6 px-2.5">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1
                style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: 400,
                  fontSize: "clamp(38px, 6vw, 68px)",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  color: "var(--fg-primary)",
                  margin: "0 0 16px",
                }}
              >
                {post.title}
              </h1>

              <p
                className="text-heading-md leading-[1.6]"
                style={{
                  fontFamily: "var(--font-sans)",
                  color: "var(--fg-secondary)",
                  maxWidth: "56ch",
                  margin: "0 0 24px",
                }}
              >
                {post.description}
              </p>

              <MetaGrid>
                <MetaCol label="published" value={formatDate(post.date)} />
                <MetaCol label="read" value={`${minutes} min`} />
                <MetaCol label="words" value={words.toLocaleString()} />
                <MetaCol label="topics" value={String(post.tags.length)} />
              </MetaGrid>
            </header>

            {/* Prose */}
            <div id="doc-body">
              <MDXContent code={post.body} />
            </div>

            {/* Footer nav */}
            <div className="mt-16 border-t pt-6" style={{ borderColor: "var(--border-subtle)" }}>
              <Link
                href="/blog"
                className="text-mono-sm inline-flex items-center gap-1.5 font-mono text-[color:var(--fg-muted)] transition-colors hover:text-[color:var(--fg-primary)]"
              >
                <span aria-hidden style={{ color: "var(--fg-brand)" }}>
                  ←
                </span>
                back to posts/
              </Link>
            </div>
          </article>
        </div>
      </div>
    </>
  )
}
