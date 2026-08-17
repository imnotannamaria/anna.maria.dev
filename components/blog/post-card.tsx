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
 * footer affordance is a span reacting to the card's hover through `group/arrow`, not a second
 * anchor pointing where the first one already goes.
 *
 * A stretched overlay link with an `aria-label`, the same shape `ProjectCard` uses, and for a
 * reason that only shows up in a screen reader: wrapping the whole card in the `<Link>` makes
 * its accessible name everything inside it, so each row announced as "post, Aug 4 2026, 7 min,
 * <title>, <the entire description>, next.js, typescript, …, open .mdx". One unusable entry per
 * post in the links list, on the page whose job is listing posts. Two sibling feeds also had no
 * business answering the same question two ways.
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
    <motion.article
      className="bento-card group/arrow w-full !gap-0"
      onMouseMove={onMouseMove}
      {...reveal}
    >
      <Spotlight {...spotlight} />

      {/* Sits above the content at `z-1`, so the whole card is the hit area while the link
          itself has one short name. There is nothing to lift above it here — unlike
          `ProjectCard`, this card has no second destination. */}
      <Link
        href={`/blog/${post.slug}`}
        className="absolute inset-0 z-[1] rounded-[var(--radius-lg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--fg-brand)"
        aria-label={`${post.title} — read the post`}
      />

      {/* `relative` because the spotlight is absolute, and a sibling in normal flow paints
            before it — without this the glow would wash over the text. */}
      <div className="relative flex min-w-0 flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <CardHead label="post" />
          <span
            className="text-mono-sm font-mono whitespace-nowrap"
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
          className="text-body-md m-0 line-clamp-2 leading-relaxed"
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
  )
}
