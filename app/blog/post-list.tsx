"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/app/components/entrepta/badge"

export type PostItem = {
  slug: string
  title: string
  description: string
  tags: string[]
  date: string
  minutes: number
}

/** Client-side tag filter — keeps /blog statically rendered (no searchParams on the server). */
export function PostList({ posts }: { posts: PostItem[] }) {
  const tag = useSearchParams().get("tag")
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

function PostRow({ post }: { post: PostItem }) {
  const year = new Date(post.date).getFullYear()

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
          <span>{post.minutes} min read</span>
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
