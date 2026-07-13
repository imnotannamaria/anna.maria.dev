import { Suspense } from "react"
import Link from "next/link"
import { createMetadata } from "@/lib/metadata"
import { getPublishedPosts, getPostReadingStats } from "@/lib/velite"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/app/components/entrepta/badge"
import { TagFilter } from "./tag-filter"

export const metadata = createMetadata({
  title: "Blog",
  description: "Thoughts on development, architecture, and tools for developers.",
  path: "/blog",
})

export default function BlogPage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const posts = getPublishedPosts()

  const tagCounts = new Map<string, number>()
  for (const post of posts) {
    for (const tag of post.tags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
  }
  const tags = Array.from(tagCounts, ([name, count]) => ({ name, count })).sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  const latestYear = posts[0] ? new Date(posts[0].date).getFullYear() : new Date().getFullYear()

  return (
    <div className="mx-auto w-full max-w-[920px] px-5 py-12 sm:px-8 lg:px-12">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 font-mono text-xs"
        style={{ color: "var(--fg-muted)" }}
      >
        <span>~</span>
        <span aria-hidden style={{ opacity: 0.5, margin: "0 6px" }}>
          /
        </span>
        <span style={{ color: "var(--fg-primary)" }}>posts</span>
      </nav>

      {/* Page header */}
      <header
        className="mb-8 grid grid-cols-1 items-end gap-6 border-b pb-8 md:grid-cols-[1fr_auto]"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div>
          <div
            className="mb-3 font-mono text-xs tracking-[0.08em] uppercase"
            style={{ color: "var(--fg-muted)" }}
          >
            <span style={{ color: "var(--fg-brand)" }}>$</span> ls ./posts --sort=date
          </div>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              fontSize: "clamp(48px, 6vw, 72px)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: "var(--fg-primary)",
              margin: 0,
            }}
          >
            Posts
          </h1>
          <p
            className="mt-4 text-[16px] leading-[1.6]"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--fg-secondary)",
              maxWidth: "52ch",
            }}
          >
            Notes on development, architecture, and the tools I reach for. Long-form thinking, build
            logs, and the occasional{" "}
            <em
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                color: "var(--fg-brand)",
              }}
            >
              opinion.
            </em>
          </p>
        </div>

        <dl className="grid grid-cols-3 gap-2 md:self-end">
          <Stat label="total" value={String(posts.length)} />
          <Stat label="tags" value={String(tags.length)} />
          <Stat label="latest" value={String(latestYear)} />
        </dl>
      </header>

      <Suspense>
        <TagFilter tags={tags} total={posts.length} />
      </Suspense>

      <PostList posts={posts} searchParams={searchParams} />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[var(--radius-sm)] border px-4 py-3"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <dt
        className="mb-1 font-mono text-[10px] tracking-[0.08em] uppercase"
        style={{ color: "var(--fg-muted)" }}
      >
        {label}
      </dt>
      <dd
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 28,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: "var(--fg-primary)",
          margin: 0,
        }}
      >
        {value}
      </dd>
    </div>
  )
}

async function PostList({
  posts,
  searchParams,
}: {
  posts: ReturnType<typeof getPublishedPosts>
  searchParams: Promise<{ tag?: string }>
}) {
  const { tag } = await searchParams
  const filtered = tag ? posts.filter((p) => p.tags.includes(tag)) : posts

  if (filtered.length === 0) {
    return (
      <p className="mt-12 text-center font-mono text-sm" style={{ color: "var(--fg-muted)" }}>
        {posts.length === 0
          ? "// no posts yet. when I publish something, it shows up here first."
          : "// no posts found for this tag."}
      </p>
    )
  }

  return (
    <div className="flex flex-col">
      {filtered.map((post) => (
        <PostRow key={post.slug} post={post} />
      ))}
    </div>
  )
}

function PostRow({ post }: { post: ReturnType<typeof getPublishedPosts>[number] }) {
  const year = new Date(post.date).getFullYear()
  const { minutes } = getPostReadingStats(post.slug)

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid grid-cols-1 gap-4 border-b py-7 transition-colors md:grid-cols-[1fr_auto] md:gap-8"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div className="flex min-w-0 flex-col gap-3">
        <h2
          className="text-[color:var(--fg-primary)] transition-colors group-hover:text-[color:var(--fg-brand)]"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(24px, 3vw, 32px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          {post.title}
        </h2>

        <p
          className="text-sm leading-[1.6]"
          style={{ fontFamily: "var(--font-sans)", color: "var(--fg-secondary)", maxWidth: "64ch" }}
        >
          {post.description}
        </p>

        <div className="mt-1 flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <Badge key={t} variant="outline" color="neutral" className="h-6 px-2.5 text-[11px]">
              {t}
            </Badge>
          ))}
        </div>

        <div
          className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px]"
          style={{ color: "var(--fg-muted)" }}
        >
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden style={{ opacity: 0.5 }}>
            ·
          </span>
          <span>{minutes} min read</span>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between gap-2 md:flex-col md:items-end">
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 32,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: "var(--fg-primary)",
          }}
        >
          {year}
        </span>
        <span
          className="inline-flex items-center gap-1.5 font-mono text-xs transition-[gap] md:mt-auto"
          style={{ color: "var(--fg-brand)" }}
        >
          open .md
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </div>
    </Link>
  )
}
