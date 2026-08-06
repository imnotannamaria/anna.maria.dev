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

/**
 * Poster hosts we allow.
 *
 * KEEP IN SYNC with `images.remotePatterns` in next.config.ts. next/image throws at
 * runtime for an unlisted host, so validating here turns a broken production page into a
 * form error the moment a bad URL is pasted.
 */
export const POSTER_HOSTS = ["image.tmdb.org", "covers.openlibrary.org", "i.scdn.co"] as const

/** Optional text field: empty string and undefined both mean "not set". */
const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""))

const posterUrlSchema = z
  .string()
  .trim()
  .url("that doesn't look like a URL")
  .refine(
    (v) => {
      try {
        return (POSTER_HOSTS as readonly string[]).includes(new URL(v).hostname)
      } catch {
        return false
      }
    },
    { message: `poster must come from: ${POSTER_HOSTS.join(", ")}` },
  )

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
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "lowercase letters, numbers and dashes only")
    .max(120)
    .optional(),
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
