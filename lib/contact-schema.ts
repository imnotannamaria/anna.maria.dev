import { z } from "zod"

/**
 * Shared contact-form validation — used on the client (instant feedback) and
 * again on the server (source of truth, can't be bypassed).
 */
export const contactSchema = z.object({
  name: z.string().trim().min(1, "your name, please").max(100, "that name is a little too long"),
  email: z
    .string()
    .trim()
    .min(1, "email is required")
    .max(200, "that email is a little too long")
    .pipe(z.email("hmm, that doesn't look like a valid email")),
  message: z
    .string()
    .trim()
    .min(10, "tell me a little more (10+ characters)")
    .max(5000, "that's a lot — try trimming it down a bit"),
})

export type ContactInput = z.infer<typeof contactSchema>
export type ContactFieldErrors = Partial<Record<keyof ContactInput, string>>
