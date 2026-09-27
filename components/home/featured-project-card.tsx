"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowLink } from "@/app/components/entrepta/arrow-link"
import {
  cardVariants,
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

export type FeaturedProject = {
  slug: string
  title: string
  description: string
  tags: string[]
  github?: string
  live?: string
}

/**
 * The featured project, on the same card as everything else on the page.
 *
 * It used to be the one card that wasn't: entrepta's `featured` variant, with a brand-tinted
 * surface, a brand border, a lift and a glow, a larger radius and more padding, plus a dot
 * mesh drifting against the pointer. On its own that read as emphasis. Beside the shortlog
 * and above the featured post, both plain cards, it read as a card from a different site —
 * the divergence the Standardization check is about. Its emphasis now comes from what it
 * says, the serif title at display size, and the surface and the hover are the shared ones:
 * the spotlight, the reveal, the border that firms up.
 *
 * The head and foot are the fixed card shape: `◆ featured` and the status on top, a `//`
 * comment on the left of the foot with the links on the right. The links used to lead the
 * foot and the comment trail it, the one card on the page with the foot the wrong way round.
 */
export function FeaturedProjectCard({
  project,
  index,
  total,
  className,
}: {
  project: FeaturedProject
  index: number
  total: number
  className?: string
}) {
  const { onMouseMove, spotlight } = useSpotlight(420)
  const reveal = useReveal()

  const [head, ...rest] = project.title.split("-")
  const hasDash = rest.length > 0

  return (
    <motion.div className={cn(cardVariants(), className)} onMouseMove={onMouseMove} {...reveal}>
      <Spotlight {...spotlight} />

      {/*
       * Stretch link — covers the whole card. The real links sit above it.
       *
       * "case study" and not just the title: when the featured project happens
       * to be wristkit, the off-the-clock section further down already has a
       * "View wristkit" link pointing somewhere else entirely, and two links on
       * one page with the same name and different destinations is exactly what
       * a screen-reader link list makes unusable.
       *
       * Its focus ring is drawn inward. The global ring sits 2px outside the element, and this
       * element is the whole card, whose `overflow: hidden` would clip it to nothing.
       */}
      <Link
        href={`/projects/${project.slug}`}
        className="absolute inset-0 z-[1] rounded-[var(--radius-lg)] focus-visible:-outline-offset-2"
        aria-label={`Read the ${project.title} case study`}
      />

      <CardHeader>
        <CardLabel>featured</CardLabel>
        <CardMeta>
          <Badge color="brand">SHIPPED</Badge>
        </CardMeta>
      </CardHeader>

      <p
        className="text-mono-sm relative m-0 font-mono tracking-[0.04em]"
        style={{ color: "var(--fg-brand-text)" }}
      >
        {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </p>

      <h3
        className="text-display-md relative m-0 font-serif font-normal"
        style={{ lineHeight: 1, letterSpacing: "-0.02em", color: "var(--fg-primary)" }}
      >
        {hasDash ? (
          <>
            <TypeIn
              text={`${head}-`}
              style={{ fontStyle: "italic", color: "var(--fg-brand)" }}
              delay={0.15}
            />
            <br />
            <TypeIn text={rest.join("-")} delay={0.15 + (head.length + 1) * 0.03} />
          </>
        ) : (
          <TypeIn
            text={project.title}
            style={{ fontStyle: "italic", color: "var(--fg-brand)" }}
            delay={0.15}
          />
        )}
      </h3>

      <p
        className="text-body-md relative m-0 max-w-[52ch] font-sans leading-relaxed"
        style={{ color: "var(--fg-secondary)" }}
      >
        {project.description}
      </p>

      <div className="relative flex flex-wrap gap-1.5">
        {project.tags.slice(0, 4).map((t) => (
          <Badge key={t} color="brand">
            {t}
          </Badge>
        ))}
      </div>

      <CardFooter>
        <CardComment>mit · open source</CardComment>
        {/* Above the stretch link, so each one is its own target. */}
        <div className="relative z-[2] flex gap-5">
          {project.github && (
            /* Named for the project, not just "github": the shortlog beside this card has a
               "github" link of its own pointing at the profile, and two links with one name
               and two destinations is what makes a screen reader's link list useless. */
            <ArrowLink href={project.github} external aria-label={`${project.title} on GitHub`}>
              github
            </ArrowLink>
          )}
          {project.live && (
            <ArrowLink href={project.live} external>
              live demo
            </ArrowLink>
          )}
        </div>
      </CardFooter>
    </motion.div>
  )
}
