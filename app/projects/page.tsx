import { Suspense } from "react"
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr"
import { createMetadata } from "@/lib/metadata"
import { getPublishedProjects } from "@/lib/velite"
import { ProjectCard } from "@/components/projects/project-card"
import { TagFilter } from "./tag-filter"

export const metadata = createMetadata({
  title: "Projects",
  description: "A collection of open-source tools, libraries, and side projects.",
  path: "/projects",
})

export default function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const projects = getPublishedProjects()
  const allTags = Array.from(new Set(projects.flatMap((p) => p.tags))).sort()

  return (
    <div className="mx-auto w-full max-w-275 px-5 py-16">
      <div className="mb-10">
        <h1 className="font-display text-text-primary text-4xl font-bold">
          Projects <span className="text-2xl font-normal text-indigo-500">({projects.length})</span>
        </h1>
        <p className="text-text-secondary mt-2">
          Open-source tools, libraries, and side projects. This list features my latest work from{" "}
          <strong>2026</strong> onwards. For the full archive, check my{" "}
          <a
            href="https://github.com/imnotannamaria"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-indigo-400 transition-colors hover:text-indigo-300"
          >
            GitHub <ArrowSquareOutIcon size={13} />
          </a>{" "}
          or my{" "}
          <a
            href="https://anna-maria-portfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-indigo-400 transition-colors hover:text-indigo-300"
          >
            old portfolio <ArrowSquareOutIcon size={13} />
          </a>
          .
        </p>
      </div>

      <Suspense>
        <TagFilter tags={allTags} />
      </Suspense>

      <ProjectGrid projects={projects} searchParams={searchParams} />
    </div>
  )
}

async function ProjectGrid({
  projects,
  searchParams,
}: {
  projects: ReturnType<typeof getPublishedProjects>
  searchParams: Promise<{ tag?: string }>
}) {
  const { tag } = await searchParams
  const filtered = tag ? projects.filter((p) => p.tags.includes(tag)) : projects

  if (filtered.length === 0) {
    return <p className="text-text-muted mt-12 text-center">No projects found for this tag.</p>
  }

  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2">
      {filtered.map((project) => (
        <ProjectCard
          key={project.slug}
          slug={project.slug}
          title={project.title}
          description={project.description}
          tags={project.tags}
          github={project.github}
          live={project.live}
        />
      ))}
    </div>
  )
}
