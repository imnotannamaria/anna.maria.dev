/**
 * The wall's shared values. No zod in here, so a client component can import a label without
 * dragging the validation library into its bundle — see lib/client-bundle.test.ts.
 */

export const WALL_STATUSES = ["invited", "submitted", "approved", "rejected"] as const
export type WallStatus = (typeof WALL_STATUSES)[number]

/** What a decision can set. `invited` and `submitted` are reached by the flow, not by a click. */
export const DECISIONS = ["approved", "rejected"] as const
export type Decision = (typeof DECISIONS)[number]

export const WALL_LANGS = ["pt-BR", "en"] as const
export type WallLang = (typeof WALL_LANGS)[number]

export const LANG_LABEL: Record<WallLang, string> = {
  "pt-BR": "Português",
  en: "English",
}

/** The short code beside a flag. */
export const LANG_CODE: Record<WallLang, string> = {
  "pt-BR": "pt-br",
  en: "en",
}

/**
 * The ceiling of a LinkedIn recommendation. A ceiling, not a target: the card on the wall
 * clamps well before it and offers the rest behind "read more".
 */
export const MESSAGE_MAX = 3000

/** Past this the card clamps the text. Roughly six lines at the card's width. */
export const CLAMP_AT = 320

/** An invite link is good for a day from the moment it is created or renewed. */
export const INVITE_TTL_MS = 24 * 60 * 60 * 1000

/**
 * The photo, as the server accepts it. The form shrinks it to 512px before sending, so a
 * real upload is tens of kilobytes; this cap is for a request that skipped the form.
 */
export const AVATAR_MAX_BYTES = 1024 * 1024
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
/** The longest side the form resizes a photo to. Shown at 48px, so 512 covers retina twice. */
export const AVATAR_EDGE = 512

/** The admin list's words for each status. `expired` is derived, so it is not a status. */
export const STATUS_LABEL: Record<WallStatus | "expired", string> = {
  invited: "waiting",
  expired: "expired",
  submitted: "to review",
  approved: "on the wall",
  rejected: "rejected",
}
