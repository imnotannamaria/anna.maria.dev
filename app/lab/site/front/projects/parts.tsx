import { ArrowSquareOutIcon, GithubLogoIcon } from "@phosphor-icons/react/dist/ssr"
import Image from "next/image"
import { cn } from "@/lib/utils"
import type { Project } from "./project"

export function Cover({
  project,
  sizes,
  className,
}: {
  project: Project
  sizes: string
  className?: string
}) {
  return (
    <span className={cn("st-pj-cover", className)}>
      {project.cover ? (
        <Image src={project.cover} alt="" fill sizes={sizes} />
      ) : (
        <span className="text-mono-sm font-mono text-[var(--fg-muted)]">{project.title}</span>
      )}
    </span>
  )
}

export function Links({ project }: { project: Project }) {
  return (
    <span className="relative z-[2] flex items-center gap-1">
      {project.github ? (
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          className="st-pj-link focus-ring"
          aria-label={`${project.title} on GitHub`}
        >
          <GithubLogoIcon aria-hidden size={15} />
        </a>
      ) : null}
      {project.live ? (
        <a
          href={project.live}
          target="_blank"
          rel="noopener noreferrer"
          className="st-pj-link focus-ring"
          aria-label={`${project.title}, live`}
        >
          <ArrowSquareOutIcon aria-hidden size={15} />
        </a>
      ) : null}
    </span>
  )
}
