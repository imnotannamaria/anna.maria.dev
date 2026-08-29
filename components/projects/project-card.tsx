"use client"

/**
 * One project on /projects — the "uniform feed" card the discovery settled on.
 *
 * Cover on top, text below, two per row, newest first. Every project gets the same card:
 * `featured` decides what the home page shows, not what this grid emphasises.
 *
 * The cover is a real image when the project has one and the generated cover when it
 * doesn't, so the grid looks finished before every project has art. `next/image` gets real
 * dimensions and a blur placeholder from Velite, which is why the frontmatter takes a
 * co-located file rather than a URL — no host to add to `remotePatterns`.
 *
 * This replaces a card that hand-rolled its own `CardBadge`, its own header row, its own
 * footer rule and two decorative gradients. All of that already existed in
 * `components/ui/card-parts` and `Spotlight`.
 *
 * A stretched overlay link rather than wrapping the card, because github and live are links
 * of their own and an anchor inside an anchor is not markup. The overlay sits at `z-1` and
 * they sit above it.
 */

import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { GithubLogoIcon, ArrowSquareOutIcon } from "@phosphor-icons/react"
import { ArrowAffordance } from "@/components/ui/arrow-link"
import { Badge, CardFoot, CardHead } from "@/components/ui/card-parts"
import { GeneratedCover } from "@/components/ui/generated-cover"
import { useReveal } from "@/components/ui/reveal"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import { KIND_LABEL, type ProjectKind } from "@/lib/projects"

export type ProjectItem = {
  slug: string
  title: string
  description: string
  tags: string[]
  kind: ProjectKind
  github?: string
  live?: string
  date: string
  /** Sliced off the ISO string — `new Date("2026-01-01")` is 2025 in São Paulo. */
  year: string
  featured?: boolean
  /** A path under `public/`, e.g. `/projects/wristkit.png`. Velite checks it exists. */
  cover?: string
}

/** Sits above the stretched overlay, so it opens its own destination. */
function OutLink({ href, kind }: { href: string; kind: "github" | "live" }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-mono-sm relative z-[2] inline-flex min-h-6 items-center gap-1.5 font-mono transition-colors hover:text-(--fg-brand) focus-visible:text-(--fg-brand)"
      style={{ color: "var(--fg-primary)" }}
    >
      {kind === "github" ? <GithubLogoIcon size={13} /> : <ArrowSquareOutIcon size={12} />}
      {kind}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}

export function ProjectCard({ project, index = 0 }: { project: ProjectItem; index?: number }) {
  const { onMouseMove, spotlight } = useSpotlight(400)
  const reveal = useReveal(Math.min(index, 6) * 0.05)

  return (
    <motion.article className="bento-card group/arrow h-full" onMouseMove={onMouseMove} {...reveal}>
      <Spotlight {...spotlight} />

      <Link
        href={`/projects/${project.slug}`}
        className="absolute inset-0 z-[1] rounded-[var(--radius-lg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--fg-brand)"
        aria-label={`${project.title} — read the case study`}
      />

      {/* Bleeds to the card edge. The negative margins have to match `.bento-card`'s
          padding, which is 20px below `sm` and 24px above it. */}
      <div className="relative -mx-5 -mt-5 aspect-[16/9] overflow-hidden sm:-mx-6 sm:-mt-6">
        {project.cover ? (
          /* `fill`, so the path needs no intrinsic dimensions — which is what makes a plain
             `public/` path enough. The optimiser still resizes and re-encodes it, since a
             local path needs no `remotePatterns` entry. */
          <Image
            src={project.cover}
            alt=""
            fill
            sizes="(min-width: 1100px) 420px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/arrow:scale-[1.03]"
          />
        ) : (
          <GeneratedCover
            slug={project.slug}
            title={project.title}
            variant="grid"
            className="h-full w-full"
          />
        )}
      </div>

      <CardHead label={KIND_LABEL[project.kind]} meta={project.year} />

      <h3
        className="relative m-0 transition-colors group-hover/arrow:text-(--fg-brand)"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "var(--text-heading-lg)",
          fontWeight: 400,
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          color: "var(--fg-primary)",
        }}
      >
        {project.title}
      </h3>

      <p
        className="text-body-md relative m-0 line-clamp-2 leading-relaxed"
        style={{ fontFamily: "var(--font-sans)", color: "var(--fg-secondary)" }}
      >
        {project.description}
      </p>

      <div className="relative flex flex-wrap gap-1.5">
        {project.tags.slice(0, 4).map((tag) => (
          <Badge key={tag} variant="brand-soft">
            {tag}
          </Badge>
        ))}
        {project.tags.length > 4 && <Badge>+{project.tags.length - 4}</Badge>}
      </div>

      <CardFoot className="gap-y-2">
        <span className="flex items-center gap-4">
          {project.github && <OutLink href={project.github} kind="github" />}
          {project.live && <OutLink href={project.live} kind="live" />}
          {!project.github && !project.live && (
            <span style={{ opacity: 0.6 }}>{"// case study"}</span>
          )}
        </span>
        <span className="font-mono" style={{ color: "var(--fg-brand)" }}>
          <ArrowAffordance>open .tsx</ArrowAffordance>
        </span>
      </CardFoot>
    </motion.article>
  )
}
