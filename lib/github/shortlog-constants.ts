/**
 * The shortlog's numbers, apart from the fetch in `shortlog.ts`, which is server-only: the
 * card is a client component and needs them too.
 */

/** How far back the card looks. A month moves every week; a year barely moves at all. */
export const SHORTLOG_DAYS = 30

/**
 * The card lists every project, busy ones first and quiet ones under them, so it grows with
 * each project that ships. These are the ceilings that keep it the height of the column beside
 * it. Busy rows past the cap still count toward the total; quiet ones past it are the ones
 * that have been quiet longest.
 */
export const SHORTLOG_ACTIVE_ROWS = 5
export const SHORTLOG_QUIET_ROWS = 4
