import { readFileSync } from "node:fs"
import { join } from "node:path"
import { blog, projects } from "@/.velite"
import { slugify, countWords, estimateReadingTime } from "@/lib/utils"

function stripPrefix(slug: string) {
  return slug.split("/").slice(1).join("/")
}

export type TocItem = { id: string; label: string; level: 2 | 3 }

/** Read a post's raw MDX, minus its frontmatter block. Returns "" if missing. */
function readPostRaw(slug: string): string {
  try {
    const raw = readFileSync(join(process.cwd(), "content", "blog", `${slug}.mdx`), "utf-8")
    return raw.replace(/^---\n[\s\S]*?\n---/, "")
  } catch {
    return ""
  }
}

/**
 * Word count + reading time from a post's actual prose. `post.body` is compiled
 * MDX (a JS function body), so counting it would be wildly off — we read the raw
 * markdown instead, stripping code fences and the heaviest markdown syntax.
 */
export function getPostReadingStats(slug: string): { words: number; minutes: number } {
  const prose = readPostRaw(slug)
    .replace(/```[\s\S]*?```/g, "") // fenced code
    .replace(/`[^`]*`/g, "") // inline code
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // images/links → text
    .replace(/[#>*_~-]/g, " ") // markdown punctuation
  const words = countWords(prose)
  return { words, minutes: Math.max(1, estimateReadingTime(prose)) }
}

/**
 * Extract h2/h3 headings from a post's raw MDX so the outline can render
 * server-side. Ids match the slugs mdx-content assigns to rendered headings.
 * Frontmatter and fenced code blocks are skipped.
 */
export function getPostToc(slug: string): TocItem[] {
  const body = readPostRaw(slug)
  const items: TocItem[] = []
  let inFence = false

  for (const line of body.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!match) continue

    const label = match[2].trim()
    items.push({ id: slugify(label), label, level: match[1].length as 2 | 3 })
  }

  return items
}

export function getPublishedPosts() {
  return blog
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((post) => ({ ...post, slug: stripPrefix(post.slug) }))
}

export function getFeaturedProjects() {
  return projects
    .filter((project) => project.published && project.featured)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((project) => ({ ...project, slug: stripPrefix(project.slug) }))
}

export function getPublishedProjects() {
  return projects
    .filter((project) => project.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((project) => ({ ...project, slug: stripPrefix(project.slug) }))
}

export function getPostBySlug(slug: string) {
  return blog
    .filter((post) => post.published)
    .map((post) => ({ ...post, slug: stripPrefix(post.slug) }))
    .find((post) => post.slug === slug)
}

export function getProjectBySlug(slug: string) {
  return projects
    .filter((project) => project.published)
    .map((project) => ({ ...project, slug: stripPrefix(project.slug) }))
    .find((project) => project.slug === slug)
}
