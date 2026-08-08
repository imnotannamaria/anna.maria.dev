const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/**
 * "2026-07-28" -> "Jul 28, 2026".
 *
 * Parses the string, deliberately not `new Date()`. `new Date("2026-07-28")` is UTC
 * midnight, so `toLocaleDateString` in any negative-offset timezone renders the 27th —
 * the exact bug the `date` column was chosen to avoid. It would also mismatch between a
 * UTC server and a local client during hydration.
 *
 * That is why `formatDate` in lib/utils.ts is not reused here: it has both problems.
 */
export function formatLoggedAt(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return iso
  return `${MONTHS[m - 1]} ${d}, ${y}`
}
