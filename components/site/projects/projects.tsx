import { FolderIcon } from "@phosphor-icons/react/dist/ssr"
import { Lede, PageLabel } from "@/components/site/page-header"
import { getPublishedProjects } from "@/lib/velite"
import { findBrand } from "@/components/site/brand-data"
import { Explorer } from "./explorer"
import type { Project } from "./project"
import "./projects.css"

export function Projects() {
  const projects: Project[] = getPublishedProjects()
    .map((project) => ({
      slug: project.slug,
      title: project.title,
      summary: project.description,
      tags: project.tags,

      techs: project.tags
        .flatMap((tag) => {
          const brand = findBrand(tag)
          return brand ? [{ name: tag, ...brand }] : []
        })
        .slice(0, 3),
      type: project.kind,

      year: project.date.slice(0, 4),
      cover: project.cover ?? null,
      github: project.github ?? null,
      live: project.live ?? null,
      featured: project.featured,
    }))

    .sort((a, b) => Number(b.featured) - Number(a.featured))

  return (
    <article className="st-room st-projects">
      <header className="flex flex-col gap-4">
        <PageLabel
          icon={<FolderIcon aria-hidden size={13} weight="bold" />}
          label="projects"
          count={projects.length}
        />

        <Lede>
          Open-source tools, libraries and side projects. The things I built because I{" "}
          <span className="text-[var(--fg-primary)]">wanted them to exist</span>.
        </Lede>
      </header>

      <Explorer projects={projects} />
    </article>
  )
}
