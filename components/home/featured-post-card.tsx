"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { BookOpenIcon } from "@phosphor-icons/react"
import { ArrowAffordance } from "@/components/ui/arrow-link"
import { Badge, CardFoot, CardHead } from "@/components/ui/card-parts"
import { useReveal } from "@/components/ui/reveal"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import { TypeIn } from "@/components/ui/type-in"

export type FeaturedPost = {
  slug: string
  title: string
  description?: string
  tags?: string[]
  date: string
  minutes: number
}

/**
 * The whole card is one link, so the footer affordance is a span rather than a
 * second anchor to the same place — two links with the same target is noise for
 * anyone tabbing through. `group/arrow` sits on the card, which is why hovering
 * anywhere on it pulls the rule under "read post".
 */
export function FeaturedPostCard({ post }: { post: FeaturedPost }) {
  const { onMouseMove, spotlight } = useSpotlight(340)
  const reveal = useReveal(0.08)

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group/arrow flex flex-1 flex-col"
      style={{ textDecoration: "none" }}
      onMouseMove={onMouseMove}
    >
      <motion.div className="bento-card flex flex-1 flex-col" {...reveal}>
        <Spotlight {...spotlight} />

        <CardHead
          label="featured post"
          meta={
            <span className="inline-flex items-center gap-1.5">
              <BookOpenIcon aria-hidden size={12} />
              {post.date} · {post.minutes} min
            </span>
          }
        />

        {/* By word, not by character. This is a sentence that wraps, and
            inline-block characters can't break a line where a word ends. */}
        <TypeIn
          as="h3"
          by="word"
          text={post.title}
          delay={0.18}
          className="relative"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 22,
            lineHeight: 1.2,
            color: "var(--fg-primary)",
            margin: 0,
          }}
        />

        {post.description && (
          <p
            className="relative line-clamp-3 text-sm leading-relaxed"
            style={{ fontFamily: "var(--font-sans)", color: "var(--fg-secondary)", margin: 0 }}
          >
            {post.description}
          </p>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="relative flex flex-wrap gap-1.5">
            {post.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="brand-soft">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <CardFoot comment="notes · public">
          <span className="font-mono" style={{ color: "var(--fg-brand)" }}>
            <ArrowAffordance>read post</ArrowAffordance>
          </span>
        </CardFoot>
      </motion.div>
    </Link>
  )
}
