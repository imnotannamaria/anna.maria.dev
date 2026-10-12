import { readFileSync } from "node:fs"
import { join } from "node:path"
import { blog, projects } from "@/.velite"
import { slugify, countWords, estimateReadingTime } from "@/lib/format"
import type { Locale } from "@/lib/i18n/locales"

function stripPrefix(slug: string) {
  return slug.split("/").slice(1).join("/")
}

/**
 * A document in a language. The English file is the document: `content/blog/my-post.mdx`. A
 * translation sits beside it in a folder named after the language, `content/blog/pt/my-post.mdx`,
 * and replaces only what is written (title, description, body). The date, the tags, the cover
 * and the links stay the English file's, so the two cannot drift apart. A document with no
 * translation is shown in English.
 */
function inLocale<T extends { slug: string; title: string; description: string; body: string }>(
  items: T[],
  locale: Locale,
): T[] {
  const originals: T[] = []
  const translated = new Map<string, T>()
  for (const item of items) {
    const [first, ...rest] = stripPrefix(item.slug).split("/")
    if (first === "pt" && rest.length) translated.set(rest.join("/"), item)
    else originals.push({ ...item, slug: stripPrefix(item.slug) })
  }
  if (locale === "en") return originals
  return originals.map((item) => {
    const other = translated.get(item.slug)
    return other
      ? { ...item, title: other.title, description: other.description, body: other.body }
      : item
  })
}

export type TocItem = { id: string; label: string; level: 2 | 3 }

/** Read a document's raw MDX from a content dir, minus frontmatter. "" if missing. */
function readRaw(dir: "blog" | "projects", slug: string, locale: Locale = "en"): string {
  const read = (...parts: string[]) =>
    readFileSync(join(process.cwd(), "content", dir, ...parts), "utf-8").replace(
      /^---\n[\s\S]*?\n---/,
      "",
    )
  // the translation when there is one, the English file otherwise
  if (locale !== "en") {
    try {
      return read(locale, `${slug}.mdx`)
    } catch {
      // no translation yet
    }
  }
  try {
    return read(`${slug}.mdx`)
  } catch {
    return ""
  }
}

/**
 * Word count + reading time from a document's actual prose. `body` is compiled
 * MDX (a JS function body), so counting it would be wildly off — we read the raw
 * markdown instead, stripping code fences and the heaviest markdown syntax.
 */
function readingStats(body: string): { words: number; minutes: number } {
  const prose = body
    .replace(/```[\s\S]*?```/g, "") // fenced code
    .replace(/`[^`]*`/g, "") // inline code
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // images/links → text
    .replace(/[#>*_~-]/g, " ") // markdown punctuation
  const words = countWords(prose)
  return { words, minutes: Math.max(1, estimateReadingTime(prose)) }
}

/**
 * Extract h2/h3 headings from raw MDX so the outline can render server-side.
 * Ids match the slugs mdx-content assigns to rendered headings. Frontmatter and
 * fenced code blocks are skipped.
 */
function extractToc(body: string): TocItem[] {
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

export function getPostReadingStats(slug: string, locale: Locale = "en") {
  return readingStats(readRaw("blog", slug, locale))
}

export function getPostToc(slug: string, locale: Locale = "en"): TocItem[] {
  return extractToc(readRaw("blog", slug, locale))
}

export function getProjectReadingStats(slug: string, locale: Locale = "en") {
  return readingStats(readRaw("projects", slug, locale))
}

export function getProjectToc(slug: string, locale: Locale = "en"): TocItem[] {
  return extractToc(readRaw("projects", slug, locale))
}

const newestFirst = (a: { date: string }, b: { date: string }) =>
  new Date(b.date).getTime() - new Date(a.date).getTime()

export function getPublishedPosts(locale: Locale = "en") {
  return inLocale(blog, locale)
    .filter((post) => post.published)
    .sort(newestFirst)
}

export function getFeaturedPosts(locale: Locale = "en") {
  return getPublishedPosts(locale).filter((post) => post.featured)
}

export function getPublishedProjects(locale: Locale = "en") {
  return inLocale(projects, locale)
    .filter((project) => project.published)
    .sort(newestFirst)
}

export function getFeaturedProjects(locale: Locale = "en") {
  return getPublishedProjects(locale).filter((project) => project.featured)
}

export function getPostBySlug(slug: string, locale: Locale = "en") {
  return getPublishedPosts(locale).find((post) => post.slug === slug)
}

export function getProjectBySlug(slug: string, locale: Locale = "en") {
  return getPublishedProjects(locale).find((project) => project.slug === slug)
}
