import { Suspense } from "react"
import { createMetadata } from "@/lib/metadata"
import { getPublishedPosts, getPostReadingStats } from "@/lib/velite"
import { numberToWord } from "@/lib/utils"
import { TagFilter } from "./tag-filter"
import { PostList, type PostItem } from "./post-list"

export const metadata = createMetadata({
  title: "Blog",
  description: "Thoughts on development, architecture, and tools for developers.",
  path: "/blog",
})

export default function BlogPage() {
  const posts = getPublishedPosts()

  const tagCounts = new Map<string, number>()
  for (const post of posts) {
    for (const tag of post.tags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
  }
  const tags = Array.from(tagCounts, ([name, count]) => ({ name, count })).sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  const latestYear = posts[0] ? new Date(posts[0].date).getFullYear() : new Date().getFullYear()

  const postItems: PostItem[] = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    tags: post.tags,
    date: post.date,
    minutes: getPostReadingStats(post.slug).minutes,
  }))

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
          <Stat label="total" value={numberToWord(posts.length)} />
          <Stat label="tags" value={numberToWord(tags.length)} />
          <Stat label="latest" value={String(latestYear)} />
        </dl>
      </header>

      <Suspense>
        <TagFilter tags={tags} total={posts.length} />
      </Suspense>

      <Suspense>
        <PostList posts={postItems} />
      </Suspense>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="overflow-hidden rounded-[var(--radius-sm)] border px-2 py-2.5 sm:px-4 sm:py-3"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <dt
        className="mb-1.5 font-mono text-[10px] tracking-[0.08em] uppercase"
        style={{ color: "var(--fg-muted)" }}
      >
        {label}
      </dt>
      <dd
        className="text-[20px] sm:text-[34px]"
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: "var(--fg-brand)",
          margin: 0,
        }}
      >
        {value}
      </dd>
    </div>
  )
}
