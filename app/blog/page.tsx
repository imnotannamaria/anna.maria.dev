import { Suspense } from "react"
import Link from "next/link"
import { createMetadata } from "@/lib/metadata"
import { InlineArrow } from "@/components/ui/inline-arrow"
import { getPublishedPosts } from "@/lib/velite"
import { formatDate, estimateReadingTime } from "@/lib/utils"
import { TagFilter } from "./tag-filter"

export const metadata = createMetadata({
  title: "Blog",
  description: "Thoughts on development, architecture, and tools for developers.",
  path: "/blog",
})

export default function BlogPage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const posts = getPublishedPosts()
  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort()

  return (
    <div className="mx-auto w-full max-w-275 px-5 py-16">
      <div className="mb-10">
        <h1 className="font-display text-text-primary text-4xl font-bold">
          Blog <span className="text-2xl font-normal text-indigo-500">({posts.length})</span>
        </h1>
        <p className="text-text-secondary mt-2">On development, architecture, and tooling.</p>
      </div>

      <Suspense>
        <TagFilter tags={allTags} />
      </Suspense>

      <PostList posts={posts} searchParams={searchParams} />
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
    return <p className="text-text-muted mt-12 text-center">No posts found for this tag.</p>
  }

  return (
    <ul className="divide-border mt-8 divide-y">
      {filtered.map((post) => (
        <li key={post.slug}>
          <Link
            href={`/blog/${post.slug}`}
            className="group hover:bg-bg-surface flex items-center gap-6 border-l-[3px] border-transparent py-6 pl-4 transition-all duration-150 hover:border-indigo-500"
          >
            <time dateTime={post.date} className="text-text-muted w-28 shrink-0 font-mono text-xs">
              {formatDate(post.date)}
            </time>

            <div className="flex-1 space-y-1">
              <h2 className="text-text-primary text-base font-medium transition-colors group-hover:text-indigo-400">
                {post.title}
              </h2>
              <p className="text-text-secondary text-sm">{post.description}</p>
            </div>

            <div className="text-text-muted hidden shrink-0 flex-col items-end gap-1 text-xs sm:flex">
              <span>{estimateReadingTime(post.body)} min read</span>
              <div className="flex gap-1">
                {post.tags.slice(0, 2).map((t) => (
                  <span key={t} className="rounded bg-indigo-900 px-1.5 py-0.5 text-indigo-300">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <span className="text-text-muted shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
              <InlineArrow />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
