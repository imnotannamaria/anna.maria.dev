/**
 * "Dune: Part Two" + 2024 -> "dune-part-two-2024".
 *
 * NFD then stripping combining marks turns "Amélie" into "amelie" rather than dropping the
 * accented letter entirely.
 */
export function slugify(title: string, year?: number | null): string {
  const base = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  const withYear = year ? `${base}-${year}` : base
  return withYear.slice(0, 120).replace(/-+$/, "")
}

/**
 * Appends -2, -3 and so on until the slug is free. The unique index is still the real
 * guard — this just keeps the admin from throwing a form away over a name collision.
 */
export function uniqueSlug(candidate: string, taken: Iterable<string>): string {
  const used = new Set(taken)
  if (!used.has(candidate)) return candidate

  for (let n = 2; n < 1000; n++) {
    const next = `${candidate}-${n}`
    if (!used.has(next)) return next
  }
  return `${candidate}-${Date.now()}`
}
