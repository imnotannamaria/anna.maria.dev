"use client"

/**
 * /blog: the outline, the tag filter and the feed, which have to be one component because
 * they share one piece of state.
 *
 * The filter lives in the URL through `useUrlFilter`, not `useSearchParams`. On a statically
 * rendered route the latter makes the nearest Suspense boundary emit its fallback during
 * prerender, so **every post was missing from the HTML a crawler reads** — on the one page
 * whose entire job is listing posts. `useUrlFilter`'s server snapshot is always null, so the
 * prerender contains every post and the filter applies right after hydration.
 *
 * The posts are grouped by year, and the outline lists those years. Grouping is what gives
 * the outline somewhere to point — and unlike /log's grouping by type, it costs nothing:
 * years descend and posts descend inside them, which is the same newest-first order the feed
 * always had, with headings added.
 *
 * The outline reads the same filter as the feed, which is why it can't live in the page. The
 * page header can, though, and does — it arrives here as `children`, server-rendered.
 */

import { useMemo } from "react"
import { PageOutline, type OutlineItem } from "@/components/chrome/page-outline"
import { FilterPill, useUrlFilter } from "@/components/ui/url-filter"
import { PostCard, type PostItem } from "./post-card"

export type TagCount = { name: string; count: number }

function groupByYear(posts: PostItem[]) {
  const years = new Map<string, PostItem[]>()
  for (const post of posts) {
    const bucket = years.get(post.year)
    if (bucket) bucket.push(post)
    else years.set(post.year, [post])
  }
  // The list arrives newest first, so insertion order is already descending.
  return Array.from(years, ([year, items]) => ({ year, items }))
}

export function BlogFeed({
  posts,
  tags,
  children,
}: {
  posts: PostItem[]
  tags: TagCount[]
  /** The server-rendered page header. */
  children: React.ReactNode
}) {
  const tagNames = useMemo(() => tags.map((t) => t.name), [tags])
  const [active, setFilter] = useUrlFilter<string>("tag", tagNames, "/blog")

  const filtered = useMemo(
    () => (active ? posts.filter((p) => p.tags.includes(active)) : posts),
    [posts, active],
  )

  const groups = useMemo(() => groupByYear(filtered), [filtered])

  const outline: OutlineItem[] = [
    { id: "posts", label: "posts", level: 1 },
    ...groups.map((g) => ({
      id: `year-${g.year}`,
      label: g.year,
      level: 2 as const,
      count: g.items.length,
    })),
  ]

  return (
    <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 min-[1100px]:grid-cols-[200px_minmax(0,1fr)]">
      <PageOutline
        items={outline}
        file="posts/"
        footer={
          <>
            <div className="flex justify-between">
              <span>{"// posts"}</span>
              <span style={{ color: "var(--fg-brand)" }}>{filtered.length}</span>
            </div>
            <div className="flex justify-between">
              <span>{"// tags"}</span>
              <span>{tags.length}</span>
            </div>
            <div>{"// mdx"}</div>
          </>
        }
      />

      <div className="min-w-0">
        <div className="mx-auto max-w-[880px] px-5 py-12 sm:px-8 lg:px-12">
          {children}

          <div role="group" aria-label="Filter by tag" className="mt-8 flex flex-wrap gap-2">
            <FilterPill
              label="all"
              count={posts.length}
              active={!active}
              onClick={() => setFilter(null)}
            />
            {tags.map((tag) => (
              <FilterPill
                key={tag.name}
                label={tag.name}
                count={tag.count}
                active={active === tag.name}
                onClick={() => setFilter(active === tag.name ? null : tag.name)}
              />
            ))}
          </div>

          {groups.length === 0 ? (
            <p className="mt-12 font-mono text-sm" style={{ color: "var(--fg-muted)" }}>
              {posts.length === 0
                ? "// no posts yet. when I publish something, it shows up here first."
                : "// nothing tagged that way yet."}
            </p>
          ) : (
            groups.map((group, gi) => (
              <section
                key={group.year}
                id={`year-${group.year}`}
                className="mt-10 border-t pt-8"
                style={{ borderColor: "var(--border-subtle)", scrollMarginTop: 24 }}
              >
                <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2
                    className="m-0"
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontWeight: 400,
                      fontSize: "clamp(24px, 3vw, 32px)",
                      lineHeight: 1.1,
                      letterSpacing: "-0.02em",
                      color: "var(--fg-primary)",
                    }}
                  >
                    {group.year}
                  </h2>
                  <span
                    className="font-mono text-[11px] tracking-[0.08em] uppercase"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {group.items.length} {group.items.length === 1 ? "post" : "posts"}
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  {group.items.map((post, i) => (
                    <PostCard key={post.slug} post={post} index={gi === 0 ? i : 0} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
