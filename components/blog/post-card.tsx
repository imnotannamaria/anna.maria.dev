"use client"

/**
 * One post on /blog — the "shelf" card the discovery settled on.
 *
 * Horizontal: cover on the left, title and blurb on the right, one per row. It is the shape
 * `LogCard` already uses, turned toward text instead of a poster. The cover drops away below
 * `sm`, which is what keeps it readable at 375px: the text column gets the whole width
 * instead of ~200px.
 *
 * Nothing here invents a surface. `.bento-card` is the card, `CardHead` names it, `CardFoot`
 * carries the `//` comment and the accent, `Spotlight` is the glow every card has, and the
 * whole thing is one `<Link>` — so the footer affordance is a span reacting to the card's
 * hover through `group/arrow`, not a second anchor pointing where the first one already goes.
 */

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowAffordance } from "@/components/ui/arrow-link"
import { Badge, CardFoot, CardHead } from "@/components/ui/card-parts"
import { useReveal } from "@/components/ui/reveal"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import { PostCover, type CoverVariant } from "./post-cover"

export type PostItem = {
  slug: string
  title: string
  description: string
  tags: string[]
  /** The raw ISO date, for the `<time dateTime>`. */
  date: string
  dateLabel: string
  /**
   * Sliced off the ISO string, never `new Date(date).getFullYear()`. `"2026-01-01"` parses as
   * UTC midnight, which is 2025 in São Paulo — and the year is what groups the feed.
   */
  year: string
  minutes: number
}

export function PostCard({
  post,
  index = 0,
  cover = "minimap",
}: {
  post: PostItem
  index?: number
  cover?: CoverVariant
}) {
  const { onMouseMove, spotlight } = useSpotlight(420)
  const reveal = useReveal(Math.min(index, 6) * 0.05)

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group/arrow flex"
      style={{ textDecoration: "none" }}
      onMouseMove={onMouseMove}
    >
      <motion.article className="bento-card w-full !gap-0" {...reveal}>
        <Spotlight {...spotlight} />

        <div className="relative flex gap-4 sm:gap-5">
          <PostCover
            slug={post.slug}
            title={post.title}
            variant={cover}
            className="hidden aspect-[4/3] w-[118px] shrink-0 rounded-[8px] border border-(--border-subtle) sm:block"
          />

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <CardHead label="post" />
              <span
                className="font-mono text-[11px] whitespace-nowrap"
                style={{ color: "var(--fg-muted)" }}
              >
                <time dateTime={post.date}>{post.dateLabel}</time> · {post.minutes} min
              </span>
            </div>

            <h3
              className="m-0 transition-colors group-hover/arrow:text-(--fg-brand)"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(20px, 2.4vw, 26px)",
                fontWeight: 400,
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
                color: "var(--fg-primary)",
              }}
            >
              {post.title}
            </h3>

            <p
              className="m-0 line-clamp-2 text-[13.5px] leading-relaxed"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--fg-secondary)",
                maxWidth: "68ch",
              }}
            >
              {post.description}
            </p>

            <CardFoot className="mt-2 flex-wrap gap-y-2">
              <span className="flex flex-wrap gap-1.5">
                {post.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="brand-soft">
                    {tag}
                  </Badge>
                ))}
              </span>
              <span className="font-mono" style={{ color: "var(--fg-brand)" }}>
                <ArrowAffordance>open .mdx</ArrowAffordance>
              </span>
            </CardFoot>
          </div>
        </div>
      </motion.article>
    </Link>
  )
}
