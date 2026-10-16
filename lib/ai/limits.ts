/**
 * Every number that keeps the chat cheap and on topic, in one place. They come from a budget of
 * about R$ 5 to 10 a month on a model that costs $0.10 per million input tokens and $0.50 per
 * million output tokens; the arithmetic is in docs/v3-migration-plan.md.
 */

/** A question, in characters. Long enough for a real one, too short for a pasted document. */
export const MAX_QUESTION = 400
/** How many earlier questions go along as context. Questions only, never answers. */
export const MAX_EARLIER = 3
/** The length of an answer, in tokens. */
export const MAX_OUTPUT_TOKENS = 300

/** Per visitor, per day. Past it the chat answers from its script, which costs nothing. */
export const PER_VISITOR = 10
/** Seconds between two questions from the same visitor. */
export const MIN_GAP_SECONDS = 5

/** The whole site, per day, in micro-dollars: $0.04. */
export const DAILY_CAP_MICRO = 40_000

/** Micro-dollars per token, by model. A model not listed is priced as the dearest one here. */
const PRICES: Record<string, { input: number; output: number }> = {
  "anthropic/claude-haiku-5.5": { input: 0.1, output: 0.5 },
  "openai/gpt-6-luna": { input: 0.1, output: 0.5 },
  "openai/gpt-5.6-luna": { input: 0.2, output: 1.2 },
}
const DEAREST = { input: 0.2, output: 1.2 }

/** What one answer cost, in micro-dollars, rounded up: the cap should err toward stopping. */
export function costMicro(model: string, inputTokens: number, outputTokens: number): number {
  const price = PRICES[model] ?? DEAREST
  return Math.ceil(inputTokens * price.input + outputTokens * price.output)
}

/**
 * Set aside before a call and corrected after it. The worst case: a full context, the
 * earlier questions and a full answer. Reserving it first is what makes the cap hold under concurrency.
 */
export function reserveMicro(model: string): number {
  return costMicro(model, 8_000, MAX_OUTPUT_TOKENS)
}
