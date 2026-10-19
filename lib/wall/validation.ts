import { z } from "zod"
import {
  MESSAGE_MAX,
  WALL_LANGS,
  WALL_REACTION_IDS,
  WALL_STATUSES,
  type ReactionCounts,
  type WallLang,
  type WallStatus,
} from "./constants"

export const WallLangSchema = z.enum(WALL_LANGS)

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""))

/**
 * A LinkedIn profile or company page, https only. It becomes the `href` on the person's name,
 * so `.url()` alone is not enough: it accepts `javascript:…`. The host check keeps the field
 * meaning what its label says.
 */
export const linkedinUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => {
    try {
      const url = new URL(v)
      return (
        url.protocol === "https:" &&
        (url.hostname === "linkedin.com" || url.hostname.endsWith(".linkedin.com"))
      )
    } catch {
      return false
    }
  }, "linkedin")

/**
 * What the admin form sends to create an invite. Name and company are prefilled in the
 * invite and the person can correct both; the note is what they read first; `formLang` is the
 * language the form opens in.
 *
 * No z.coerce and no .default(): both make zod's input type differ from its output, which
 * breaks react-hook-form's generics. Same rule as the log and the roadmap.
 */
export const inviteInputSchema = z.object({
  name: z.string().trim().min(1, "who is it for?").max(100, "too long"),
  company: z.string().trim().min(1, "pick a company or type one").max(100, "too long"),
  note: optionalText(1000),
  formLang: WallLangSchema,
})
export type InviteInput = z.infer<typeof inviteInputSchema>

/**
 * What the invite form sends. The messages are keys, not sentences: the form speaks
 * Portuguese or English, so it maps a key to its own copy (see `copy.ts`).
 */
export const submissionSchema = z.object({
  name: z.string().trim().min(1, "name").max(100, "name"),
  company: z.string().trim().min(1, "company").max(100, "company"),
  role: optionalText(100),
  linkedin: linkedinUrl.optional().or(z.literal("")),
  lang: WallLangSchema,
  message: z.string().trim().min(10, "message").max(MESSAGE_MAX, "message"),
})
export type SubmissionInput = z.infer<typeof submissionSchema>
export type SubmissionField = keyof SubmissionInput

export const decisionSchema = z.object({ status: z.enum(["approved", "rejected"]) })

/** One row, as the site and the admin see it. Dates are ISO strings so they cross to a client. */
export interface WallEntry {
  id: string
  status: WallStatus
  /** True when an invite is past its day. Only meaningful while `status` is `invited`. */
  expired: boolean
  expiresAt: string
  note: string | null
  formLang: WallLang
  name: string
  company: string
  role: string | null
  linkedinUrl: string | null
  message: string | null
  lang: WallLang | null
  avatarUrl: string | null
  reactions: ReactionCounts
  createdAt: string
  submittedAt: string | null
  decidedAt: string | null
}

/** One reaction, added or taken back. */
export const reactSchema = z
  .object({ reaction: z.enum(WALL_REACTION_IDS), on: z.boolean() })
  .strict()

/** What a card on the wall needs, and nothing it does not. */
export interface Testimonial {
  id: string
  name: string
  company: string
  role: string | null
  linkedinUrl: string | null
  message: string
  lang: WallLang
  avatarUrl: string | null
  /** `YYYY-MM`, the month it went up. */
  month: string
  reactions: ReactionCounts
}

export { WALL_LANGS, WALL_STATUSES }
