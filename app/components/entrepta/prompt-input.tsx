"use client"

import { ArrowUpIcon, StopIcon } from "@phosphor-icons/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Kbd } from "./kbd"

const LABELS = { send: "Send", stop: "Stop", suggestions: "Suggestions" }

interface PromptInputProps extends Omit<
  React.HTMLAttributes<HTMLFormElement>,
  "onSubmit" | "defaultValue"
> {
  /** Send a message. The text is trimmed; an empty one never goes. */
  onSubmit: (value: string) => void
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** A reply is on its way: the send button becomes stop. */
  streaming?: boolean
  onStop?: () => void
  /** Ready questions above the field. A click sends one. */
  suggestions?: readonly string[]
  placeholder?: string
  /** The field's name for screen readers. */
  label?: string
  disabled?: boolean
  /** Tallest it grows before it scrolls, in px. */
  maxHeight?: number
  /** Buttons on the left of the toolbar: attach, a model picker. */
  tools?: React.ReactNode
  labels?: Partial<typeof LABELS>
}

/**
 * Where a question is written. The field grows with the text up to a limit,
 * ⌘↵ or Ctrl↵ sends and ↵ keeps a new line, and while the reply streams the
 * send button is a stop button. No model and no network: it hands the text
 * to `onSubmit`.
 */
const PromptInput = React.forwardRef<HTMLTextAreaElement, PromptInputProps>(
  (
    {
      onSubmit,
      value: valueProp,
      defaultValue = "",
      onValueChange,
      streaming = false,
      onStop,
      suggestions,
      placeholder = "Ask anything",
      label = "Message",
      disabled = false,
      maxHeight = 200,
      tools,
      labels: labelsProp,
      className,
      ...props
    },
    ref,
  ) => {
    const labels = { ...LABELS, ...labelsProp }
    const [own, setOwn] = React.useState(defaultValue)
    const value = valueProp ?? own
    const field = React.useRef<HTMLTextAreaElement>(null)
    React.useImperativeHandle(ref, () => field.current as HTMLTextAreaElement)
    const [mac, setMac] = React.useState(true)

    React.useEffect(() => {
      setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent))
    }, [])

    // grows with its text, then scrolls
    // biome-ignore lint/correctness/useExhaustiveDependencies: `value` is the trigger; the size is read from the field
    React.useLayoutEffect(() => {
      const el = field.current
      if (!el) return
      el.style.height = "auto"
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
    }, [value, maxHeight])

    const set = (next: string) => {
      if (valueProp === undefined) setOwn(next)
      onValueChange?.(next)
    }

    const send = (text = value) => {
      const trimmed = text.trim()
      if (!trimmed || streaming || disabled) return
      onSubmit(trimmed)
      set("")
    }

    const empty = !value.trim()

    return (
      <form
        className={cn("flex w-full min-w-0 flex-col gap-2", className)}
        onSubmit={(event) => {
          event.preventDefault()
          send()
        }}
        {...props}
      >
        {suggestions?.length ? (
          <ul aria-label={labels.suggestions} className="m-0 flex list-none flex-wrap gap-2 p-0">
            {suggestions.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  disabled={streaming || disabled}
                  onClick={() => send(suggestion)}
                  className={cn(
                    "focus-ring cursor-pointer rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1",
                    "text-mono-sm font-mono text-[var(--fg-secondary)]",
                    "transition-colors duration-[var(--motion-fast)] hover:border-[var(--border-strong)] hover:text-[var(--fg-primary)]",
                    "disabled:pointer-events-none disabled:opacity-40",
                  )}
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <div
          className={cn(
            "flex flex-col rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--bg-field)]",
            "transition-[border-color,box-shadow] duration-150 ease-out",
            "focus-within:border-[var(--fg-brand)] focus-within:shadow-[0_0_0_3px_var(--bg-surface-brand)]",
            disabled && "pointer-events-none opacity-40",
          )}
        >
          <textarea
            ref={field}
            rows={1}
            value={value}
            aria-label={label}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(event) => set(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault()
                send()
              }
            }}
            className={cn(
              "block w-full resize-none bg-transparent px-3.5 pt-3 pb-1 outline-none",
              "text-body-md font-sans text-[var(--fg-primary)] placeholder:font-mono placeholder:text-[var(--fg-muted)]",
            )}
          />
          <div className="flex items-center justify-between gap-2 px-2 pb-2">
            <div className="flex min-w-0 items-center gap-1">{tools}</div>
            <div className="flex shrink-0 items-center gap-2">
              <Kbd className="max-sm:hidden">{mac ? "⌘↵" : "Ctrl ↵"}</Kbd>
              {streaming ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  aria-label={labels.stop}
                  onClick={onStop}
                >
                  <StopIcon aria-hidden size={14} weight="fill" />
                </Button>
              ) : (
                <Button type="submit" size="icon-sm" aria-label={labels.send} disabled={empty}>
                  <ArrowUpIcon aria-hidden size={16} weight="bold" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    )
  },
)
PromptInput.displayName = "PromptInput"

export { PromptInput }
export type { PromptInputProps }
