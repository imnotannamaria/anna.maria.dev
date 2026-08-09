"use client"

import Link from "next/link"
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react"
import type { Variants } from "motion/react"
import { ArrowLink } from "@/components/ui/arrow-link"
import { Badge, CardFoot, CardHead } from "@/components/ui/card-parts"
import { EASE_OUT } from "@/components/ui/reveal"
import { TypeIn } from "@/components/ui/type-in"

export type FeaturedProject = {
  slug: string
  title: string
  description: string
  tags: string[]
  github?: string
  live?: string
}

/**
 * The featured project, with the movement living entirely in the hover.
 *
 * Nothing here animates on its own. The section already has the page's own
 * entrance happening around it, and one more thing moving by itself would be
 * noise — so the card stays still until you reach for it, which also means it
 * never wears out on the tenth visit.
 *
 * The lift and the brand shadow stay in `.featured-card` rather than moving into
 * Motion: that shadow is built from `var(--shadow-brand)`, and Motion can't
 * interpolate a colour hiding inside a custom property. CSS can.
 */
export function FeaturedProjectCard({
  project,
  index,
  total,
}: {
  project: FeaturedProject
  index: number
  total: number
}) {
  const reduce = useReducedMotion() ?? false

  // The dot mesh drifts against the pointer, which reads as depth without
  // moving any of the content the visitor is trying to read.
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const meshX = useSpring(useTransform(mx, [0, 1], [16, -16]), { stiffness: 50, damping: 20 })
  const meshY = useSpring(useTransform(my, [0, 1], [12, -12]), { stiffness: 50, damping: 20 })

  const tagGroup: Variants = {
    rest: {},
    hover: { transition: { staggerChildren: reduce ? 0 : 0.04 } },
  }
  const tag: Variants = {
    rest: { y: 0 },
    hover: { y: reduce ? 0 : -3, transition: { duration: 0.2, ease: EASE_OUT } },
  }

  const [head, ...rest] = project.title.split("-")
  const hasDash = rest.length > 0

  return (
    <motion.div
      className="featured-card group/featured relative flex flex-col gap-4 overflow-hidden p-6 sm:p-8"
      style={{
        background: "var(--bg-surface-brand)",
        border: "1px solid var(--border-brand)",
        borderRadius: "var(--radius-xl)",
        minHeight: 380,
      }}
      initial="rest"
      animate="rest"
      whileHover="hover"
      onMouseMove={(e) => {
        if (reduce) return
        const r = e.currentTarget.getBoundingClientRect()
        mx.set((e.clientX - r.left) / r.width)
        my.set((e.clientY - r.top) / r.height)
      }}
    >
      {/*
       * Stretch link — covers the whole card. The real links sit above it.
       *
       * "case study" and not just the title: when the featured project happens
       * to be wristkit, the off-the-clock section further down already has a
       * "View wristkit" link pointing somewhere else entirely, and two links on
       * one page with the same name and different destinations is exactly what
       * a screen-reader link list makes unusable.
       */}
      <Link
        href={`/projects/${project.slug}`}
        className="absolute inset-0"
        style={{ zIndex: 1 }}
        aria-label={`Read the ${project.title} case study`}
      />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          right: "-10%",
          bottom: "-30%",
          width: "60%",
          aspectRatio: "1",
          opacity: 0.35,
          x: meshX,
          y: meshY,
          backgroundImage: "radial-gradient(var(--fg-brand) 1px, transparent 1.4px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(circle, #000 0%, transparent 60%)",
          WebkitMaskImage: "radial-gradient(circle, #000 0%, transparent 60%)",
        }}
      />

      <CardHead label="featured" meta={<Badge variant="brand-soft">SHIPPED</Badge>} />

      <p
        className="relative font-mono text-xs tracking-[0.04em]"
        style={{ color: "var(--fg-brand)" }}
      >
        {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </p>

      <h3
        className="relative"
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 400,
          fontSize: 48,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: "var(--fg-primary)",
          margin: 0,
        }}
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
        className="relative max-w-[44ch] text-sm leading-relaxed"
        style={{ fontFamily: "var(--font-sans)", color: "var(--fg-secondary)" }}
      >
        {project.description}
      </p>

      <motion.div className="relative flex flex-wrap gap-1.5" variants={tagGroup}>
        {project.tags.slice(0, 4).map((t) => (
          <motion.span key={t} variants={tag} className="inline-flex">
            <Badge variant="brand-soft">{t}</Badge>
          </motion.span>
        ))}
      </motion.div>

      <CardFoot>
        <div className="flex gap-6" style={{ position: "relative", zIndex: 2 }}>
          {project.github && (
            /* Named for the project, not just "github": the contributions card
               further down this page has a "github" link of its own pointing at
               the profile, and two links with one name and two destinations is
               what makes a screen reader's link list useless. */
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
        <span style={{ color: "var(--fg-muted)", marginLeft: "auto" }}>
          {"// "}mit · open source
        </span>
      </CardFoot>
    </motion.div>
  )
}
