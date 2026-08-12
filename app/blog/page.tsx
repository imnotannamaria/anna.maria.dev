import { createMetadata } from "@/lib/metadata"
import { getPublishedPosts, getPostReadingStats } from "@/lib/velite"
import { formatDate } from "@/lib/utils"
import { BlogFeed, type TagCount } from "@/components/blog/blog-feed"
import { type PostItem } from "@/components/blog/post-card"
import { DocLabel, Em } from "@/components/chrome/page-parts"
import { TypeIn } from "@/components/ui/type-in"

export const metadata = createMetadata({
  title: "Blog",
  description: "Thoughts on development, architecture, and tools for developers.",
  path: "/blog",
})

/**
 * The header is built here, on the server, and handed to `BlogFeed` as children — the feed
 * has to be a client component because the outline and the cards read the same filter, but
 * the title and the prose have no reason to go with them.
 */
export default function BlogPage() {
  const posts = getPublishedPosts()

  const items: PostItem[] = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    tags: post.tags,
    date: post.date,
    dateLabel: formatDate(post.date),
    // Sliced, not parsed. `new Date("2026-01-01")` is UTC midnight, which is 2025 in São
    // Paulo — and the year is what the feed groups by and the outline lists.
    year: post.date.slice(0, 4),
    minutes: getPostReadingStats(post.slug).minutes,
  }))

  const counts = new Map<string, number>()
  for (const post of posts) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  const tags: TagCount[] = Array.from(counts, ([name, count]) => ({ name, count })).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  )

  return (
    <BlogFeed posts={items} tags={tags}>
      <nav
        aria-label="Breadcrumb"
        className="mb-8 font-mono text-xs"
        style={{ color: "var(--fg-muted)" }}
      >
        <span>~</span>
        <span aria-hidden style={{ opacity: 0.5, margin: "0 6px" }}>
          /
        </span>
        <span style={{ color: "var(--fg-primary)" }}>posts</span>
      </nav>

      <div id="posts" style={{ scrollMarginTop: 24 }}>
        <DocLabel level="#">ls ./posts --sort=date</DocLabel>

        <TypeIn
          as="h1"
          text="Posts."
          emphasis="Posts"
          speed={0.05}
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            fontSize: "clamp(48px, 6vw, 72px)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: "var(--fg-primary)",
            margin: 0,
            display: "block",
          }}
        />

        {/* Not wrapped in <Reveal>, and that is the point: this paragraph is the page's LCP
            element, and an entrance that starts at `opacity: 0` is serialised into the SSR
            markup as an inline style — so the largest thing on the page is invisible until
            hydration finishes and the delay runs out. Lighthouse measured ~1.6s of "element
            render delay" here against 412ms of TTFB. The <TypeIn> title above already carries
            the entrance; see the same shape on every other page header. */}
        <p
          className="mt-4 text-[16px] leading-[1.6]"
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--fg-secondary)",
            maxWidth: "52ch",
          }}
        >
          Notes on development, architecture, and the tools I reach for. Long-form thinking, build
          logs, and the occasional <Em>opinion.</Em>
        </p>
      </div>
    </BlogFeed>
  )
}
