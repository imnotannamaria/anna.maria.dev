import { z } from "zod"
import { MIN_MOVES, NAME_MAX } from "./constants"

/**
 * A name for the board. Letters (any alphabet), digits, spaces and a little punctuation, and
 * nothing that reads as an address: the board is not a place to advertise. Inner runs of spaces
 * collapse to one. The messages are keys; the form says them in its own language.
 */
export const boardName = z
  .string()
  .transform((value) => value.trim().replace(/\s+/g, " "))
  .pipe(
    z
      .string()
      .min(1, "empty")
      .max(NAME_MAX, "long")
      .regex(/^[\p{L}\p{N}][\p{L}\p{N} .'_-]*$/u, "chars")
      .refine((value) => !/www\.|https?|\.(com|br|io|dev|app|net|org)\b/i.test(value), "link"),
  )

const id = z.string().uuid()

export const finishSchema = z
  .object({ id, moves: z.number().int().min(MIN_MOVES).max(1000) })
  .strict()
export type FinishInput = z.infer<typeof finishSchema>

export const claimSchema = z.object({ id, name: boardName }).strict()
export type ClaimInput = z.infer<typeof claimSchema>

export const memoryDecisionSchema = z.object({ status: z.enum(["approved", "rejected"]) })
