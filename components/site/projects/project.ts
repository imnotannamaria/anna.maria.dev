import type { ScreenId } from "@/components/site/pages"
import type { Tech } from "@/components/site/professional/stack-data"

export type Project = {
  slug: string
  title: string
  summary: string
  tags: string[]

  techs: Tech[]

  type: string
  year: string

  cover: string | null
  github: string | null
  live: string | null

  featured: boolean
}

export function projectScreen(project: Pick<Project, "slug">): ScreenId {
  return `project:${project.slug}`
}

export function address(project: Project): string {
  const url = project.live ?? project.github
  if (!url) return project.slug
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "")
}
