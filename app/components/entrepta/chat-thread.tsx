"use client"

import { ArrowDownIcon, WarningIcon } from "@phosphor-icons/react"
import * as React from "react"
import { OVERLAY_SURFACE } from "@/lib/overlay"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Card, CardHeader, CardLabel } from "./card"
import { Diamond } from "./diamond"

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "tool" | "system"
  /** Text, or anything: a tool's card, a chart, a table. */
  content: React.ReactNode
  /** Who wrote it, or which tool answered. */
  name?: string
  /** A short time, such as "14:05". */
  time?: string
  /** Still arriving, or failed. */
  status?: "streaming" | "error"
  /** What to say under a failed message, and a retry. */
  error?: React.ReactNode
}

const LABELS = {
  thread: "Conversation",
  you: "You",
  assistant: "Assistant",
  latest: "Jump to latest",
  failed: "This message did not arrive.",
}

interface ChatThreadProps extends React.HTMLAttributes<HTMLElement> {
  messages: readonly ChatMessage[]
  /** Shown when there are no messages yet. */
  empty?: React.ReactNode
  labels?: Partial<typeof LABELS>
}

/** Within this many px of the bottom counts as reading the latest. */
const NEAR = 32

/**
 * A conversation, drawn: your messages on the right on the brand tint, the
 * replies in full width with a ◆, tool results in a card. Text that streams
 * in follows the bottom only if you are there; scrolled up to read, you stay
 * put and a button offers the latest. Screen readers hear each reply once,
 * when it is done, not every word as it arrives. No model and no network.
 */
const ChatThread = React.forwardRef<HTMLElement, ChatThreadProps>(
  ({ messages, empty, labels: labelsProp, className, ...props }, ref) => {
    const labels = { ...LABELS, ...labelsProp }
    const scroller = React.useRef<HTMLDivElement>(null)
    const list = React.useRef<HTMLOListElement>(null)
    const atBottom = React.useRef(true)
    const [below, setBelow] = React.useState(false)
    const [said, setSaid] = React.useState("")
    const seen = React.useRef<Map<string, ChatMessage["status"]> | null>(null)

    const toBottom = React.useCallback((smooth: boolean) => {
      const box = scroller.current
      if (!box) return
      const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      box.scrollTo({ top: box.scrollHeight, behavior: smooth && !still ? "smooth" : "auto" })
      setBelow(false)
    }, [])

    // follow the bottom only when already there; otherwise leave the reader alone
    React.useEffect(() => {
      const box = scroller.current
      const content = list.current
      if (!box || !content || typeof ResizeObserver !== "function") return
      const observer = new ResizeObserver(() => {
        if (atBottom.current) box.scrollTop = box.scrollHeight
        else setBelow(true)
      })
      observer.observe(content)
      return () => observer.disconnect()
    }, [])

    // a reply is read out once, when it has finished arriving
    React.useEffect(() => {
      // the history there on arrival is not news; only what comes after is read out
      if (seen.current === null) {
        seen.current = new Map(messages.map((m) => [m.id, m.status]))
        return
      }
      const known = seen.current
      const read: string[] = []
      for (const message of messages) {
        const isNew = !known.has(message.id)
        const before = known.get(message.id)
        known.set(message.id, message.status)
        // replies only: a tool's card is read in the thread, where its shape makes sense
        const finished =
          message.role === "assistant" &&
          message.status === undefined &&
          (before === "streaming" || isNew)
        if (!finished) continue
        const text = list.current
          ?.querySelector(`[data-message="${CSS.escape(message.id)}"] [data-body]`)
          ?.textContent?.trim()
        if (text) read.push(`${message.name ?? labels.assistant}: ${text.slice(0, 400)}`)
      }
      if (read.length) setSaid(read.join(" "))
    }, [messages, labels.assistant])

    return (
      <section
        ref={ref}
        aria-label={labels.thread}
        className={cn("relative flex min-h-0 flex-col", className)}
        {...props}
      >
        <div
          ref={scroller}
          onScroll={(event) => {
            const box = event.currentTarget
            atBottom.current = box.scrollHeight - box.scrollTop - box.clientHeight < NEAR
            if (atBottom.current) setBelow(false)
          }}
          className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-1"
        >
          {messages.length === 0 && empty ? (
            <div className="grid h-full place-items-center p-6">{empty}</div>
          ) : (
            <ol ref={list} className="m-0 flex list-none flex-col gap-5 p-0 py-2">
              {messages.map((message) => (
                <li key={message.id} data-message={message.id} className="min-w-0">
                  <Message message={message} labels={labels} />
                </li>
              ))}
            </ol>
          )}
        </div>
        {below ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className={cn(
              OVERLAY_SURFACE,
              "motion-pop absolute bottom-3 left-1/2 -translate-x-1/2 gap-1.5 rounded-full",
            )}
            onClick={() => {
              atBottom.current = true
              toBottom(true)
            }}
          >
            <ArrowDownIcon aria-hidden size={14} />
            {labels.latest}
          </Button>
        ) : null}
        <div aria-live="polite" className="sr-only">
          {said}
        </div>
      </section>
    )
  },
)
ChatThread.displayName = "ChatThread"

function Message({ message, labels }: { message: ChatMessage; labels: typeof LABELS }) {
  const meta = (name: string) => (
    <span className="text-mono-xs flex items-center gap-1.5 font-mono text-[var(--fg-muted)]">
      {message.role === "assistant" ? <Diamond size={9} /> : null}
      <span className="tracking-[0.08em] uppercase">{name}</span>
      {message.time ? <span>· {message.time}</span> : null}
    </span>
  )
  const failed =
    message.status === "error" ? (
      <p className="text-mono-sm m-0 flex items-center gap-1.5 font-mono text-[var(--status-error-fg)]">
        <WarningIcon aria-hidden size={14} weight="bold" className="shrink-0" />
        {message.error ?? labels.failed}
      </p>
    ) : null

  if (message.role === "system") {
    return (
      <p className="text-mono-xs m-0 text-center font-mono text-[var(--fg-muted)]" data-body>
        {message.content}
      </p>
    )
  }

  if (message.role === "user") {
    return (
      <div className="flex flex-col items-end gap-1.5">
        {meta(message.name ?? labels.you)}
        <div
          data-body
          className={cn(
            "max-w-[min(85%,560px)] rounded-[var(--radius-lg)] rounded-br-[var(--radius-sm)] px-3.5 py-2.5",
            "text-body-md bg-[var(--bg-surface-brand)] font-sans [overflow-wrap:anywhere] text-[var(--fg-primary)]",
          )}
        >
          {message.content}
        </div>
        {failed}
      </div>
    )
  }

  if (message.role === "tool") {
    return (
      <Card size="sm" className="gap-3">
        {message.name ? (
          <CardHeader>
            <CardLabel>{message.name}</CardLabel>
          </CardHeader>
        ) : null}
        <div data-body className="min-w-0">
          {message.content}
        </div>
        {failed}
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      {meta(message.name ?? labels.assistant)}
      <div
        data-body
        className="text-body-md min-w-0 font-sans [overflow-wrap:anywhere] text-[var(--fg-primary)]"
      >
        {message.content}
        {message.status === "streaming" ? (
          <span aria-hidden className="type-caret ml-0.5 [--type-delay:0s]" />
        ) : null}
      </div>
      {failed}
    </div>
  )
}

export { ChatThread }
export type { ChatThreadProps }
