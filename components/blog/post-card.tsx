"use client"

/**
 * One post on /blog — the "shelf" card the discovery settled on.
 *
 * One per row, the text taking the full width. It started with a generated cover on the left
 * — the `LogCard` shape, turned toward text — and the cover came back out: a poster earns its
 * place when it is the thing you are scanning for, and a post is scanned by its title. A
 * rectangle of fake code beside every one of them was decoration competing with the sentence
 * that does the work.
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

export function PostCard({ post, index = 0 }: { post: PostItem; index?: number }) {
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

        {/* `relative` because the spotlight is absolute, and a sibling in normal flow paints
            before it — without this the glow would wash over the text. */}
        <div className="relative flex min-w-0 flex-col gap-2">
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
      </motion.article>
    </Link>
  )
}
