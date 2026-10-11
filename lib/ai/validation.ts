import { z } from "zod"
import { MAX_EARLIER, MAX_QUESTION } from "./limits"

const question = z.string().trim().min(1).max(MAX_QUESTION)

/**
 * What the browser may send: a question, and the few questions before it. There is no role to
 * choose and no answer to send back. A `system` turn would be the visitor writing the rules, and
 * an `assistant` turn would be the visitor writing what the model already agreed to.
 */
export const chatSchema = z
  .object({ question, earlier: z.array(question).max(MAX_EARLIER).optional() })
  .strict()

export type ChatBody = z.infer<typeof chatSchema>
