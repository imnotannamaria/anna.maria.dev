"use client"

import { cn } from "@/lib/utils"
import { cardVariants } from "@/app/components/entrepta/card"
import Link from "next/link"
import { motion } from "motion/react"
import { BookOpenIcon } from "@phosphor-icons/react"
import { ArrowAffordance } from "@/app/components/entrepta/arrow-link"
import {
  CardComment,
  CardFooter,
  CardHeader,
  CardLabel,
  CardMeta,
} from "@/app/components/entrepta/card"
import { Badge } from "@/app/components/entrepta/badge"
import { useReveal } from "@/app/components/entrepta/reveal"
import { Spotlight, useSpotlight } from "@/app/components/entrepta/spotlight"
import { TypeIn } from "@/app/components/entrepta/type-in"

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
      <motion.div className={cn(cardVariants(), "flex-1")} {...reveal}>
        <Spotlight {...spotlight} />

        <CardHeader>
          <CardLabel>featured post</CardLabel>
          <CardMeta>
            {
              <span className="inline-flex items-center gap-1.5">
                <BookOpenIcon aria-hidden size={12} />
                {post.date} · {post.minutes} min
              </span>
            }
          </CardMeta>
        </CardHeader>

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
            fontSize: "var(--text-heading-lg)",
            lineHeight: 1.2,
            color: "var(--fg-primary)",
            margin: 0,
          }}
        />

        {post.description && (
          <p
            className="text-body-md relative line-clamp-3 leading-relaxed"
            style={{ fontFamily: "var(--font-sans)", color: "var(--fg-secondary)", margin: 0 }}
          >
            {post.description}
          </p>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="relative flex flex-wrap gap-1.5">
            {post.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} color="brand">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <CardFooter>
          <CardComment>notes · public</CardComment>
          <span className="font-mono" style={{ color: "var(--fg-brand)" }}>
            <ArrowAffordance>read post</ArrowAffordance>
          </span>
        </CardFooter>
      </motion.div>
    </Link>
  )
}
