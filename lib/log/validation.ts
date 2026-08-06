import { z } from "zod"

export const LOG_TYPES = ["film", "series", "book", "music", "podcast", "game"] as const
export const LogTypeSchema = z.enum(LOG_TYPES)
export type LogType = z.infer<typeof LogTypeSchema>

/** Badge text on a card. "podcast" shows as "pod", per the design. */
export const TYPE_LABEL: Record<LogType, string> = {
  film: "film",
  series: "series",
  book: "book",
  music: "album",
  podcast: "pod",
  game: "game",
}

/** Filter pill text. */
export const TYPE_PLURAL: Record<LogType, string> = {
  film: "films",
  series: "series",
  book: "books",
  music: "music",
  podcast: "podcasts",
  game: "games",
}

/** Optional text field: empty string and undefined both mean "not set". */
const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""))

/**
 * Any https URL. There is deliberately no host allowlist.
 *
 * There used to be one, mirroring `images.remotePatterns`, so that next/image could not
 * throw on an unlisted host. It was unwinnable: Spotify alone serves art from i.scdn.co,
 * image-cdn-ak.spotifycdn.com, image-cdn-fa.spotifycdn.com and mosaic.scdn.co, and every
 * new source meant editing two files before a poster would save.
 *
 * The posters render through a plain <img> now, so no host list is needed anywhere, and a
 * URL that does not load falls back to the type label. One check, one failure mode.
 */
const posterUrlSchema = z
  .string()
  .trim()
  .url("that doesn't look like a URL")
  .refine((v) => v.startsWith("https://"), "must be an https URL")

/** What the admin form submits. The server re-parses it; the client copy is for feedback. */
export const logEntryInputSchema = z.object({
  type: LogTypeSchema,
  title: z.string().trim().min(1, "title is required").max(200, "that title is too long"),
  creator: optionalText(150),
  // No z.coerce and no .default() anywhere in this schema. Both make zod's input type
  // differ from its output type, which breaks react-hook-form's generics. Callers send
  // JSON with real numbers and booleans, so neither buys anything.
  year: z
    .number()
    .int("years don't have decimals")
    .min(1800, "too far back")
    .max(2200, "too far ahead")
    .nullable()
    .optional(),
  rating: z
    .number()
    .min(0.5, "half a star is the minimum")
    .max(5, "five is the maximum")
    .refine((v) => (v * 2) % 1 === 0, "half stars only")
    .nullable()
    .optional(),
  favorite: z.boolean().optional(),
  note: optionalText(2000),
  posterUrl: posterUrlSchema.optional().or(z.literal("")),
  externalUrl: z
    .string()
    .trim()
    .url("that doesn't look like a URL")
    .max(500)
    .optional()
    .or(z.literal("")),
  loggedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use YYYY-MM-DD"),
  published: z.boolean().optional(),
  // `.or(z.literal(""))` matters: the form always sends a string, and "" fails the regex
  // on its own. Without it the field is advertised as optional and then rejected empty.
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "lowercase letters, numbers and dashes only")
    .max(120)
    .optional()
    .or(z.literal("")),
})

export type LogEntryInput = z.infer<typeof logEntryInputSchema>

/** An entry as the UI consumes it: rating is a number, empty strings are null. */
export type LogEntry = {
  id: string
  slug: string
  type: LogType
  title: string
  creator: string | null
  year: number | null
  rating: number | null
  favorite: boolean
  note: string | null
  posterUrl: string | null
  externalUrl: string | null
  loggedAt: string
  published: boolean
}
