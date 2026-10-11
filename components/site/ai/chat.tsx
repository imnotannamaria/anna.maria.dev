"use client"

import { Hint } from "@/components/site/hint"
import { useSiteData } from "@/components/site/frame/use-site-data"
import { ArrowRightIcon, ChatCircleDotsIcon, type Icon, CatIcon } from "@phosphor-icons/react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { Button } from "@/app/components/entrepta/button"
import { ChatThread, type ChatMessage } from "@/app/components/entrepta/chat-thread"
import { PromptInput } from "@/app/components/entrepta/prompt-input"
import type { SiteData } from "@/components/site/frame/site-data"
import { Tile } from "@/components/site/tile"
import { ICON, INNER_ICON } from "@/components/site/icons"
import { INNER_PAGES, PAGES } from "@/components/site/pages"
import type { Group } from "@/components/site/professional/stack-data"
import { useNavigate } from "@/components/site/navigation"
import { screenQuestion } from "@/lib/ai/guard"
import { MAX_QUESTION } from "@/lib/ai/limits"
import { QUESTIONS, answer, answerOf, type Answer } from "./answers"
import { askModel, endsTheDay, isAboutTheQuestion, isLive } from "./ask"
import { ChatNotice, type NoticeKind } from "./notice"
import "./chat.css"

const ICONS: Record<string, Icon> = { ...ICON, ...INNER_ICON }
const NOTICE_KINDS: readonly string[] = ["budget", "visitor", "slow", "scope", "blocked"]

const pageName = (id: string) =>
  [...PAGES, ...INNER_PAGES].find((page) => page.id === id)?.label ?? id

/**
 * The chat. A model answers when there is one and the limits allow it; the script answers the
 * rest of the time, from the same content, so a visitor always gets something.
 *
 * The model only ever writes text. Which card goes under an answer is the model's label checked
 * against the list of pages, and the card itself is the script's. When the chat says no (a
 * limit, a question that is not about Anna, an attempt on the rules) it says so with a notice.
 */
export function Chat({ data: staticData, stack }: { data: SiteData; stack: Group[] }) {
  const data = useSiteData(staticData)
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [writing, setWriting] = useState(false)
  // null until the server says whether a model is answering
  const [live, setLive] = useState<boolean | null>(null)
  const stop = useRef<(() => void) | null>(null)
  const asked = useRef<string[]>([])
  const count = useRef(0)

  useEffect(() => {
    let alive = true
    void isLive().then((answering) => alive && setLive(answering))
    return () => {
      alive = false
      stop.current?.()
    }
  }, [])

  const write = (id: string, content: ReactNode, streaming: boolean) =>
    setMessages((before) =>
      before.map((m) =>
        m.id === id ? { ...m, content, status: streaming ? ("streaming" as const) : undefined } : m,
      ),
    )

  function composed(text: string, card: Answer["card"], notice: NoticeKind | null): ReactNode {
    if (!card && !notice) return text
    const page = card?.page
    const Icon = ICONS[page?.split(":")[0] ?? ""] ?? ChatCircleDotsIcon
    return (
      <div className="st-ia-answer">
        {notice ? <ChatNotice kind={notice} /> : null}
        {text ? <p className="m-0">{text}</p> : null}
        {card ? (
          <Tile label={card.name} icon={card.icon ?? <Icon />} className="st-enter">
            {card.body}
            {page ? (
              <Button
                size="sm"
                variant="secondary"
                className="self-start"
                onClick={() => navigate(page)}
              >
                open {pageName(page)}
                <ArrowRightIcon aria-hidden size={13} weight="bold" />
              </Button>
            ) : null}
          </Tile>
        ) : null}
      </div>
    )
  }

  const finish = (id: string, content: ReactNode) => {
    stop.current = null
    setWriting(false)
    write(id, content, false)
  }

  /** Writes an answer a word at a time, under a notice if there is one. */
  function type(id: string, text: string, card: Answer["card"], notice: NoticeKind | null = null) {
    const words = text ? text.split(" ") : []
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let until = calm ? words.length : 0
    const partial = () => composed(words.slice(0, until).join(" "), undefined, notice)
    const timer = setInterval(
      () => {
        until += 1
        if (until < words.length) return write(id, partial(), true)
        clearInterval(timer)
        finish(id, composed(text, card, notice))
      },
      calm ? 0 : 45,
    )
    stop.current = () => {
      clearInterval(timer)
      until = Math.max(until, 1)
      finish(id, partial())
    }
  }

  async function ask(question: string) {
    if (stop.current) return
    const id = `m${(count.current += 1)}`
    const hour = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })

    setWriting(true)
    setMessages((before) => [
      ...before,
      { id: `${id}-q`, role: "user", content: question, time: hour },
      { id, role: "assistant", content: "", status: "streaming" },
    ])

    // The same screen the server runs: a request for work, or an attempt on the rules, is turned
    // away here whether or not a model is answering, and is not kept as context.
    const screened = screenQuestion(question)
    if (screened !== "ok") return type(id, "", undefined, screened === "task" ? "scope" : "blocked")

    const scripted = answer(question, data, stack)
    const earlier = asked.current
    asked.current = [...earlier, question]

    if (question.length > MAX_QUESTION) return type(id, "", undefined, "long")
    if (!live) return type(id, scripted.text, scripted.card)

    const controller = new AbortController()
    stop.current = () => {
      controller.abort()
      finish(id, "Stopped.")
    }
    const reply = await askModel(earlier, question, controller.signal)
    if (controller.signal.aborted) return
    stop.current = null

    if (reply.ok) {
      const card = reply.topic ? answerOf(reply.topic, data, stack).card : undefined
      return type(id, reply.text, card)
    }
    if (endsTheDay(reply.reason)) setLive(false)
    if (isAboutTheQuestion(reply.reason)) return type(id, "", undefined, reply.reason as NoticeKind)
    const notice = NOTICE_KINDS.includes(reply.reason) ? (reply.reason as NoticeKind) : null
    // "slow" is about the pace, not the day: the notice says it all and the question can be asked again
    if (reply.reason === "slow") return type(id, "", undefined, "slow")
    type(id, scripted.text, scripted.card, notice)
  }

  return (
    <div className="st-ia">
      <ChatThread
        className="st-ia-column min-h-0"
        messages={messages}
        labels={{ assistant: "abimaela.ia", you: "you" }}
        empty={
          <div className="flex max-w-[44ch] flex-col gap-3 text-center">
            <h1 className="text-display-md font-serif text-[var(--fg-primary)]">
              Ask me about <em className="text-[var(--fg-brand)]">Anna.</em>
            </h1>
            <Hint className="self-center" icon={<CatIcon aria-hidden size={13} />}>
              <span>
                {live
                  ? "Abimaela answers, only about Anna and this site, a few questions a day"
                  : "Abimaela answers from the site’s own content"}
              </span>
            </Hint>
          </div>
        }
      />
      <PromptInput
        className="st-ia-column"
        onSubmit={ask}
        streaming={writing}
        onStop={() => stop.current?.()}
        placeholder="Ask who she is, where she worked, her stack, projects, notes or contact"
        suggestions={QUESTIONS}
      />
    </div>
  )
}
