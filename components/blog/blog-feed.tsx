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
 * Everything below the filter — the rail, the pills, the sections, the empty state — is
 * `FeedShell`, shared with /projects and /log. What is left here is the three things that are
 * actually about posts: what they group by, what a group is called, and the card.
 */

import { useMemo } from "react"
import { FeedShell, groupInOrder, type FeedGroup } from "@/components/chrome/feed-shell"
import { useUrlFilter } from "@/components/ui/url-filter"
import { PostCard, type PostItem } from "./post-card"

export type TagCount = { name: string; count: number }

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

  const groups: FeedGroup<PostItem>[] = useMemo(
    () =>
      groupInOrder(filtered, (post) => post.year).map(({ key, items }) => ({
        id: `year-${key}`,
        label: key,
        items,
      })),
    [filtered],
  )

  return (
    <FeedShell
      file="posts/"
      root={{ id: "posts", label: "posts" }}
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
      filterLabel="Filter by tag"
      pills={tags.map((tag) => ({ key: tag.name, label: tag.name, count: tag.count }))}
      totalCount={posts.length}
      active={active}
      onFilter={setFilter}
      groups={groups}
      groupMeta={(group) => `${group.items.length} ${group.items.length === 1 ? "post" : "posts"}`}
      empty={{
        all: "// no posts yet. when I publish something, it shows up here first.",
        filtered: "// nothing tagged that way yet.",
      }}
      listClassName="flex flex-col gap-4"
      renderItem={(post, index) => <PostCard key={post.slug} post={post} index={index} />}
    >
      {children}
    </FeedShell>
  )
}
