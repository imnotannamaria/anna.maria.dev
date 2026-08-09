import { z } from "zod"

/**
 * Four statuses, three of them public.
 *
 * `raw` is what ROADMAP.md used to be: somewhere to put a thought without deciding
 * anything about it. It is the default, and every public query filters it out.
 */
export const ROADMAP_STATUSES = ["raw", "todo", "doing", "done"] as const
export const RoadmapStatusSchema = z.enum(ROADMAP_STATUSES)
export type RoadmapStatus = z.infer<typeof RoadmapStatusSchema>

/** The three that render on the site, in board order. */
export const PUBLIC_STATUSES = ["todo", "doing", "done"] as const
export type PublicStatus = (typeof PUBLIC_STATUSES)[number]

export function isPublicStatus(status: RoadmapStatus): status is PublicStatus {
  return status !== "raw"
}

/** Column heading, filter pill, and the label a screen reader gets for the check mark. */
export const STATUS_LABEL: Record<RoadmapStatus, string> = {
  raw: "raw",
  todo: "to do",
  doing: "in progress",
  done: "shipped",
}

/** The editor-ish mark on the card's badge. */
export const STATUS_MARK: Record<RoadmapStatus, string> = {
  raw: "[·]",
  todo: "[ ]",
  doing: "[~]",
  done: "[x]",
}

/** Optional text field: empty string and undefined both mean "not set". */
const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""))

/**
 * What the admin form submits. The server re-parses it; the client copy is for feedback.
 *
 * No z.coerce and no .default() anywhere in here. Both make zod's input type differ from
 * its output type, which breaks react-hook-form's generics — the log paid for that lesson
 * already (docs/log-plan.md). Defaults live in the mutation layer instead.
 */
export const roadmapItemInputSchema = z.object({
  title: z.string().trim().min(1, "a title is the one thing it needs").max(200, "too long"),
  blurb: optionalText(1000),
  status: RoadmapStatusSchema,
  position: z.number().int("whole numbers only").min(0).max(9999).optional(),
  // A repo path like "docs/tree-plan.md". It renders as text in the card's foot, never as
  // an href — so this validates shape, not protocol. If it ever becomes a link it needs
  // the https-only check the log's externalUrl has.
  planUrl: optionalText(200),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "lowercase letters, numbers and dashes only")
    .max(120)
    .optional()
    .or(z.literal("")),
})

export type RoadmapItemInput = z.infer<typeof roadmapItemInputSchema>

/**
 * The quick-add. One field, because the whole point of retiring ROADMAP.md is that
 * capturing an idea must not cost more than typing a line into an editor did.
 */
export const roadmapQuickAddSchema = roadmapItemInputSchema.pick({ title: true })
export type RoadmapQuickAdd = z.infer<typeof roadmapQuickAddSchema>

/** An item as the UI consumes it: empty strings are null, dates are "YYYY-MM-DD". */
export type RoadmapItem = {
  id: string
  slug: string
  title: string
  blurb: string | null
  status: RoadmapStatus
  position: number
  planUrl: string | null
  shippedAt: string | null
}
