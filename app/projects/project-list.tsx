"use client"

import { useSearchParams } from "next/navigation"
import { Reveal } from "@/components/ui/reveal"
import {
  FeaturedProjectCard,
  ProjectCard,
  type ProjectCardData,
} from "@/components/projects/project-card"

/** Client-side tag filter — keeps /projects statically rendered (no searchParams on the server). */
export function ProjectList({ projects }: { projects: ProjectCardData[] }) {
  const tag = useSearchParams().get("tag")
  const filtered = tag ? projects.filter((p) => p.tags.includes(tag)) : projects

  if (filtered.length === 0) {
    return (
      <p className="mt-12 text-center font-mono text-sm" style={{ color: "var(--fg-muted)" }}>
        {"// no projects found for this tag."}
      </p>
    )
  }

  // Featured first, then the rest by date — one card per row.
  const ordered = [...filtered].sort((a, b) => Number(b.featured) - Number(a.featured))

  return (
    <div className="flex flex-col gap-6">
      {ordered.map((project, i) => (
        <Reveal key={project.slug} index={i}>
          {project.featured ? (
            <FeaturedProjectCard project={project} />
          ) : (
            <ProjectCard project={project} />
          )}
        </Reveal>
      ))}
    </div>
  )
}
