"use client"

import { useSiteData } from "@/components/site/frame/use-site-data"
import { ArrowRightIcon, ChatCircleDotsIcon, type Icon } from "@phosphor-icons/react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/app/components/entrepta/button"
import { ChatThread, type ChatMessage } from "@/app/components/entrepta/chat-thread"
import { PromptInput } from "@/app/components/entrepta/prompt-input"
import type { SiteData } from "@/components/site/frame/site-data"
import { Tile } from "@/components/site/tile"
import { ICON, INNER_ICON } from "@/components/site/icons"
import { INNER_PAGES, PAGES } from "@/components/site/pages"
import type { Group } from "@/components/site/professional/stack-data"
import { useNavigate } from "@/components/site/navigation"
import { QUESTIONS, answer } from "./answers"
import "./chat.css"

const ICONS: Record<string, Icon> = { ...ICON, ...INNER_ICON }

const pageName = (id: string) =>
  [...PAGES, ...INNER_PAGES].find((page) => page.id === id)?.label ?? id

export function Chat({ data: staticData, stack }: { data: SiteData; stack: Group[] }) {
  const data = useSiteData(staticData)
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [writing, setWriting] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const count = useRef(0)

  const stopTyping = () => {
    if (timer.current) clearInterval(timer.current)
    timer.current = null
    setWriting(false)
  }

  useEffect(() => () => void (timer.current && clearInterval(timer.current)), [])

  function ask(question: string) {
    if (timer.current) return
    const { text, card } = answer(question, data, stack)
    const page = card?.page
    const id = `m${(count.current += 1)}`
    const hour = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    const words = text.split(" ")
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let until = calm ? words.length : 0
    const Icon = ICONS[page?.split(":")[0] ?? ""] ?? ChatCircleDotsIcon
    const full = card ? (
      <div className="st-ia-answer">
        <p className="m-0">{text}</p>
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
      </div>
    ) : (
      text
    )

    setWriting(true)
    setMessages((before) => [
      ...before,
      { id: `${id}-q`, role: "user", content: question, time: hour },
      { id: `${id}-a`, role: "assistant", content: "", status: "streaming" },
    ])

    timer.current = setInterval(
      () => {
        until += 1
        const done = until >= words.length
        setMessages((before) => {
          return before.map((m) =>
            m.id === `${id}-a`
              ? {
                  ...m,

                  content: done ? full : words.slice(0, until).join(" "),
                  status: done ? undefined : ("streaming" as const),
                }
              : m,
          )
        })
        if (done) stopTyping()
      },
      calm ? 0 : 45,
    )
  }

  return (
    <div className="st-ia">
      <ChatThread
        className="st-ia-column min-h-0"
        messages={messages}
        labels={{ assistant: "anna.ia", you: "you" }}
        empty={
          <div className="flex max-w-[44ch] flex-col gap-3 text-center">
            <h1 className="text-display-md font-serif text-[var(--fg-primary)]">
              Ask me about <em className="text-[var(--fg-brand)]">Anna.</em>
            </h1>
            <p className="text-mono-sm font-mono text-[var(--fg-muted)]">
              <span aria-hidden className="opacity-60">
                {"// "}
              </span>
              scripted answers from the site&rsquo;s own content, no model yet
            </p>
          </div>
        }
      />
      <PromptInput
        className="st-ia-column"
        onSubmit={ask}
        streaming={writing}
        onStop={() => {
          stopTyping()
          setMessages((before) =>
            before.map((m) => (m.status === "streaming" ? { ...m, status: undefined } : m)),
          )
        }}
        placeholder="Ask who she is, where she worked, her stack, projects, notes or contact"
        suggestions={QUESTIONS}
      />
    </div>
  )
}
