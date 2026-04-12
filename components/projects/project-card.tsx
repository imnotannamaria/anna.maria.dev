import Link from "next/link"
import { GithubLogoIcon, ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  slug: string
  title: string
  description: string
  tags: string[]
  github?: string
  live?: string
}

function ProjectThumbnail({ title }: { title: string }) {
  const initials = title
    .split(/[\s-]/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")

  return (
    <div className="flex h-36 items-center justify-center rounded-t-xl bg-gradient-to-br from-indigo-950 via-indigo-900/60 to-indigo-950">
      <span className="font-display text-4xl font-bold text-indigo-300/60">{initials}</span>
    </div>
  )
}

export function ProjectCard({ slug, title, description, tags, github, live }: ProjectCardProps) {
  const visibleTags = tags.slice(0, 3)
  const remaining = tags.length - visibleTags.length

  return (
    <article className="group border-border bg-bg-surface hover:border-border-hover flex flex-col overflow-hidden rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
      <Link href={`/projects/${slug}`} tabIndex={-1} aria-hidden="true">
        <ProjectThumbnail title={title} />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap gap-1.5">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-indigo-900 px-2 py-0.5 font-mono text-[11px] tracking-wide text-indigo-300 uppercase"
            >
              {tag}
            </span>
          ))}
          {remaining > 0 && (
            <span className="bg-bg-elevated text-text-muted rounded px-2 py-0.5 font-mono text-[11px]">
              +{remaining}
            </span>
          )}
        </div>

        <div className="flex-1">
          <Link href={`/projects/${slug}`}>
            <h2 className="text-text-primary text-base font-semibold transition-colors group-hover:text-indigo-400">
              {title}
            </h2>
          </Link>
          <p className="text-text-secondary mt-1 text-sm leading-relaxed">{description}</p>
        </div>

        <div
          className={cn(
            "border-border text-text-muted flex items-center gap-3 border-t pt-3 text-xs",
          )}
        >
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${title} on GitHub`}
              className="hover:text-text-primary flex items-center gap-1.5 transition-colors"
            >
              <GithubLogoIcon size={14} />
              GitHub
            </a>
          )}
          {live && (
            <a
              href={live}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${title} live demo`}
              className="hover:text-text-primary flex items-center gap-1.5 transition-colors"
            >
              <ArrowSquareOutIcon size={13} />
              Live
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
