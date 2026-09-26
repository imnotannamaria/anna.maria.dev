/**
 * The site's own formatting and text helpers.
 *
 * They lived in `lib/utils.ts` next to `cn()` until that file became entrepta's: the CLI owns
 * `lib/utils.ts` now, so anything that is this site's and not the design system's lives here.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Whether a string can be handed to a `uuid` column.
 *
 * Postgres does not return "no rows" for `where id = 'garbage'`, it raises — so an id that
 * came out of a URL has to be checked before the query, or a wrong URL becomes a 500 where
 * a 404 was the whole intent.
 */
export function isUuid(value: string): boolean {
  return UUID.test(value)
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function countWords(content: string): number {
  return content.trim().split(/\s+/).filter(Boolean).length
}

export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200
  return Math.ceil(countWords(content) / wordsPerMinute)
}

/** GitHub-style slug for heading anchors (matches the ids set on rendered headings). */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}
