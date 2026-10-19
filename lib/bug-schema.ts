import { z } from "zod"

/** A screenshot, at most. Under the platform's body limit, with room for the text. */
export const BUG_ATTACHMENT_MAX_BYTES = 4 * 1024 * 1024

/**
 * A bug report, checked on the page for instant feedback and again on the server, which is the
 * one that counts. The email is optional: a report is welcome from someone who wants no answer.
 */
export const bugSchema = z.object({
  name: z.string().trim().min(1, "your name, please").max(100, "that name is a little too long"),
  email: z
    .string()
    .trim()
    .max(200, "that email is a little too long")
    .refine((value) => value === "" || z.email().safeParse(value).success, {
      message: "that does not look like an email",
    }),
  description: z
    .string()
    .trim()
    .min(10, "tell me a little more (10+ characters)")
    .max(4000, "that is a lot, try trimming it down"),
  /** The address the report was sent from, so "this page" means something. */
  page: z.string().trim().max(300).regex(/^\//, "not a page of the site").or(z.literal("")),
})

export type BugInput = z.infer<typeof bugSchema>
