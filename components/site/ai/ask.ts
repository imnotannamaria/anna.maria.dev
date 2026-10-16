import { CARD_TOPICS, type CardTopic } from "@/lib/ai/guard"
import { MAX_EARLIER, MAX_QUESTION } from "@/lib/ai/limits"

/** Why the model did not answer. The page has something to show for every one of them. */
export type Refusal =
  | "off"
  | "invalid"
  | "visitor"
  | "slow"
  | "budget"
  | "unavailable"
  | "upstream"
  | "scope"
  | "blocked"

const REFUSALS: readonly string[] = [
  "off",
  "invalid",
  "visitor",
  "slow",
  "budget",
  "unavailable",
  "upstream",
  "scope",
  "blocked",
]

/** What goes to the server: the question, and the last few questions before it. No answers. */
export function bodyFor(asked: string[], question: string) {
  return {
    question,
    earlier: asked.filter((text) => text.trim() && text.length <= MAX_QUESTION).slice(-MAX_EARLIER),
  }
}

/** After these the model will not answer again today, so the chat stops asking it. */
export const endsTheDay = (reason: Refusal) => reason === "budget" || reason === "visitor"

/** Refusals that are about the question itself: the script has nothing to add to them. */
export const isAboutTheQuestion = (reason: Refusal) => reason === "scope" || reason === "blocked"

export async function isLive(): Promise<boolean> {
  try {
    const res = await fetch("/api/v1/ai/status")
    return res.ok && ((await res.json()) as { live?: boolean }).live === true
  } catch {
    return false
  }
}

export type Reply =
  | { ok: true; text: string; topic: CardTopic | null }
  | { ok: false; reason: Refusal }

/**
 * Asks the model. The answer comes back whole, already read by the server, or not at all with
 * the reason. A label the page does not know is no card, never a guess.
 */
export async function askModel(
  asked: string[],
  question: string,
  signal: AbortSignal,
): Promise<Reply> {
  try {
    const res = await fetch("/api/v1/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyFor(asked, question)),
      signal,
    })
    const body = (await res.json().catch(() => ({}))) as {
      reason?: unknown
      text?: unknown
      topic?: unknown
    }
    if (!res.ok) {
      const reason = REFUSALS.includes(body.reason as string)
        ? (body.reason as Refusal)
        : "upstream"
      return { ok: false, reason }
    }
    if (typeof body.text !== "string" || !body.text.trim()) return { ok: false, reason: "upstream" }
    const topic = (CARD_TOPICS as readonly string[]).includes(body.topic as string)
      ? (body.topic as CardTopic)
      : null
    return { ok: true, text: body.text, topic }
  } catch {
    return { ok: false, reason: "upstream" }
  }
}
