import { Hono } from "hono"
import { siteContext } from "@/lib/ai/context"
import { screenAnswer, screenQuestion, splitTopic } from "@/lib/ai/guard"
import { MAX_OUTPUT_TOKENS, costMicro, reserveMicro } from "@/lib/ai/limits"
import { RULE_MARKS, buildMessages, canaryOf } from "@/lib/ai/prompt"
import { admit, settle, visitorOf } from "@/lib/ai/usage"
import { chatSchema } from "@/lib/ai/validation"
import { byClient, clientIp, rateLimit } from "../middleware/rate-limit"

export const ai = new Hono()

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"

/** The key and the model, or null when the chat is off. Read per request, never at import. */
function config() {
  const key = process.env.OPENROUTER_API_KEY?.trim()
  const model = process.env.OPENROUTER_MODEL?.trim()
  return key && model ? { key, model } : null
}

/** One line per refusal, with the reason and never the text: enough to see an attack happening. */
const note = (reason: string) => console.warn(JSON.stringify({ event: "ai.refused", reason }))

/** Whether a model is answering, so the page can say so before the first question. */
ai.get("/status", (c) => c.json({ live: config() !== null }))

type Completion = {
  choices?: { message?: { content?: string | null } }[]
  usage?: { prompt_tokens?: number; completion_tokens?: number; cost?: number }
}

/**
 * One question in, one answer out.
 *
 * The order is the defence, and each step is cheaper than the one after it:
 *
 * 1. malformed: refused before anything is counted (`invalid`)
 * 2. the question screen: an attempt on the rules (`blocked`) or a request for unrelated work
 *    (`scope`) is turned away without calling the model, so it costs nothing
 * 3. the visitor's limit, then the site's budget (`visitor`, `slow`, `budget`)
 * 4. the model, with the rules and the site from here and the visitor's words fenced as data.
 *    It has no tools, no network and nothing to act on
 * 5. the answer screen: the whole answer is read here before the visitor gets a word of it.
 *    One the model labelled out of scope is dropped for the page's own refusal (`scope`); one
 *    carrying code, a link to somewhere else or the rules is dropped too (`blocked`)
 *
 * The answer is not streamed, and that is the point of step 5: text already on a screen cannot
 * be taken back. Every refusal carries a `reason`, and the page has something to show for each.
 */
ai.post(
  "/chat",
  // a blunt first gate, in memory: the real limits are in Postgres, in `admit`
  rateLimit({
    max: 40,
    windowMs: 60_000,
    key: byClient("ai"),
  }),
  async (c) => {
    const conf = config()
    if (!conf) return c.json({ reason: "off" }, 503)

    const body = await c.req.json().catch(() => null)
    const parsed = chatSchema.safeParse(body)
    if (!parsed.success) return c.json({ reason: "invalid" }, 400)
    const { question, earlier = [] } = parsed.data

    const asked = screenQuestion(question)
    if (asked !== "ok") {
      note(asked === "task" ? "scope:question" : "blocked:question")
      return c.json({ reason: asked === "task" ? "scope" : "blocked" }, 422)
    }
    // an earlier question that would not pass now is not context worth sending
    const context = earlier.filter((text) => screenQuestion(text) === "ok")

    const reserve = reserveMicro(conf.model)
    const visitor = visitorOf(clientIp(c.req.raw), conf.key)
    const admission = await admit(visitor, reserve).catch(() => ({
      ok: false as const,
      reason: "unavailable" as const,
    }))
    if (!admission.ok) {
      return c.json({ reason: admission.reason }, admission.reason === "unavailable" ? 503 : 429)
    }

    const site = siteContext()
    const canary = canaryOf(conf.key)
    let completion: Completion
    try {
      const upstream = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${conf.key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://annamaria.app",
          "X-Title": "annamaria.app",
        },
        body: JSON.stringify({
          model: conf.model,
          messages: buildMessages(site, question, context, canary),
          max_tokens: MAX_OUTPUT_TOKENS,
          temperature: 0.2,
          usage: { include: true },
          // providers that keep or train on prompts are not used
          provider: { data_collection: "deny" },
        }),
        signal: AbortSignal.timeout(25_000),
      })
      if (!upstream.ok) throw new Error("upstream")
      completion = (await upstream.json()) as Completion
    } catch {
      await settle(reserve, 0).catch(() => {})
      return c.json({ reason: "upstream" }, 502)
    }

    const usage = completion.usage
    const actual = !usage
      ? reserve
      : typeof usage.cost === "number"
        ? Math.ceil(usage.cost * 1_000_000)
        : costMicro(conf.model, usage.prompt_tokens ?? 0, usage.completion_tokens ?? 0)
    await settle(reserve, actual).catch(() => {})

    const { topic, text } = splitTopic(completion.choices?.[0]?.message?.content ?? "")
    if (topic === "off") {
      note("scope:model")
      return c.json({ reason: "scope" }, 422)
    }
    const verdict = screenAnswer(text, site, [canary, ...RULE_MARKS])
    if (verdict === "empty") return c.json({ reason: "upstream" }, 502)
    if (verdict !== "ok") {
      note(`blocked:${verdict}`)
      return c.json({ reason: "blocked" }, 422)
    }

    return c.json({ text, topic }, 200, {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    })
  },
)
