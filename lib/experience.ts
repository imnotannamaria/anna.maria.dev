// ─── Experience — single source of truth ────────────────────────────────────
// Professional start: March 15, 2021. Everything that says "N years" derives
// from here so nothing goes stale (e.g. flips to "6 years" in March 2027).

export const CAREER_START_DATE = new Date(2021, 2, 15) // month is 0-indexed
export const CAREER_START_YEAR = CAREER_START_DATE.getFullYear()

/** Capitalized number words for display (matches the serif "Five" on the home card). */
export const YEAR_WORDS: Record<number, string> = {
  1: "One",
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
  6: "Six",
  7: "Seven",
  8: "Eight",
  9: "Nine",
  10: "Ten",
}

/** Years elapsed since the exact career start date (not just the calendar year). */
export function calcYearsOfExp(now: Date = new Date()): number {
  let years = now.getFullYear() - CAREER_START_DATE.getFullYear()
  const hasPassedAnniversary =
    now.getMonth() > CAREER_START_DATE.getMonth() ||
    (now.getMonth() === CAREER_START_DATE.getMonth() &&
      now.getDate() >= CAREER_START_DATE.getDate())
  if (!hasPassedAnniversary) years--
  return Math.max(0, years)
}

/** Spell out the year count as a capitalized word, falling back to digits. */
export function yearsWord(n: number = calcYearsOfExp()): string {
  return YEAR_WORDS[n] ?? String(n)
}
