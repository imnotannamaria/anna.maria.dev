import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { getPublishedPosts, getPostBySlug, getPostToc, getPostReadingStats } from "@/lib/velite"
import { formatDate } from "@/lib/utils"
import { MDXContent } from "@/components/blog/mdx-content"
import { ReadingProgress } from "@/components/blog/reading-progress"
import { PostOutline } from "./post-outline"
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
        <PostOutline slug={slug} items={toc} words={words} minutes={minutes} />

        <div className="min-w-0">
          <article className="mx-auto max-w-[760px] px-5 py-12 sm:px-8 lg:px-12">
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="mb-4 font-mono text-xs"
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
                  <Badge key={tag} variant="soft" color="brand" className="h-6 px-2.5 text-[11px]">
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
                className="text-[19px] leading-[1.6]"
                style={{
                  fontFamily: "var(--font-sans)",
                  color: "var(--fg-secondary)",
                  maxWidth: "56ch",
                  margin: "0 0 24px",
                }}
              >
                {post.description}
              </p>

              <dl
                className="grid grid-cols-2 gap-3 rounded-[var(--radius-lg)] border p-4 sm:grid-cols-4"
                style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
              >
                <MetaCol label="published" value={formatDate(post.date)} />
                <MetaCol label="read" value={`${minutes} min`} />
                <MetaCol label="words" value={words.toLocaleString()} />
                <MetaCol label="topics" value={String(post.tags.length)} />
              </dl>
            </header>

            {/* Prose */}
            <div id="post-body">
              <MDXContent code={post.body} />
            </div>

            {/* Footer nav */}
            <div className="mt-16 border-t pt-6" style={{ borderColor: "var(--border-subtle)" }}>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-[color:var(--fg-muted)] transition-colors hover:text-[color:var(--fg-primary)]"
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

function MetaCol({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt
        className="font-mono text-[10px] tracking-[0.08em] uppercase"
        style={{ color: "var(--fg-muted)" }}
      >
        {label}
      </dt>
      <dd className="font-mono text-[13px]" style={{ color: "var(--fg-primary)", margin: 0 }}>
        {value}
      </dd>
    </div>
  )
}
