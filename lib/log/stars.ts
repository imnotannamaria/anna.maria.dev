/**
 * The star string from the design: 4.5 becomes "★★★★½".
 * Decorative — always pair it with `starLabel` for screen readers.
 */
export function starString(rating: number | null): string {
  if (rating == null) return ""
  return "★".repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? "½" : "")
}

/** What a screen reader should hear instead of a pile of star glyphs. */
export function starLabel(rating: number | null): string {
  return rating == null ? "not rated" : `${rating} out of 5`
}
