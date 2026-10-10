"use client"

import type { SiteData } from "@/components/site/frame/site-data"
import { useSiteData } from "@/components/site/frame/use-site-data"
import { buildFiles } from "./files"
import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react"
import { Card, CardTerminalBar, CardTerminalBody } from "@/app/components/entrepta/card"
import { cn } from "@/lib/utils"
import { pet } from "@/components/site/abimaela/abimaela"
import type { ScreenId } from "@/components/site/pages"
import { useNavigate } from "@/components/site/navigation"
import { path, complete, execute, type Output, type ItemKind } from "./shell"
import "./terminal.css"

type LogLine = Output & { id: number }

const SHORTCUTS = ["help", "ls", "cat person.txt", "cat professional.txt", "routes", "open notes"]

const WELCOME: Output = {
  type: "text",
  text: "the back of annamaria.app. the whole site is in here, as text.\ntype a command and press enter, or click one below.",
}

const USER = "guest@annamaria.app"

const COLOR: Record<ItemKind, string> = {
  command: "text-[var(--t-command)]",
  folder: "text-[var(--t-folder)]",
  file: "text-[var(--fg-primary)]",
  link: "text-[var(--t-path)]",
}

const METHOD_COLOR: Record<string, string> = {
  GET: "text-[var(--status-success-fg)]",
  POST: "text-[var(--status-warning-fg)]",
  PATCH: "text-[var(--status-info-fg)]",
  DELETE: "text-[var(--status-error-fg)]",
}

export function Terminal({ data, className }: { data: SiteData; className?: string }) {
  const withLog = useSiteData(data)
  const system = useMemo(() => buildFiles(withLog), [withLog])
  const [lines, setLines] = useState<LogLine[]>([{ ...WELCOME, id: 0 }])
  const [cwd, setCwd] = useState<string[]>([])
  const [entry, setEntry] = useState("")
  const [recalling, setRecalling] = useState<number | null>(null)
  const pastCommands = useRef<string[]>([])
  const count = useRef(1)
  const pane = useRef<HTMLDivElement>(null)
  const output = useRef<HTMLDivElement>(null)
  const field = useRef<HTMLInputElement>(null)
  const id = useId()
  const navigate = useNavigate()

  useEffect(() => {
    if (output.current) output.current.scrollTop = output.current.scrollHeight
  }, [lines])

  useEffect(() => {
    const target = pane.current
    if (!target || !window.matchMedia("(pointer: fine)").matches) return
    const observer = new IntersectionObserver(([seen]) => {
      if (seen.isIntersecting) field.current?.focus({ preventScroll: true })
    })
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  function run(raw: string) {
    const line = raw.trim()
    const result = execute(system, cwd, line)
    const added: Output[] = [{ type: "echo", path: path(cwd), text: line }, ...result.output]
    const withId = added.map((line) => ({ ...line, id: count.current++ }))

    if (line) pastCommands.current.push(line)
    setRecalling(null)
    setEntry("")
    setCwd(result.cwd)
    setLines((before) => (result.clear ? [] : [...before, ...withId]))
    if (result.event) pet.notify(result.event)
    if (result.open) navigate(result.open.replace(/^tela:/, "") as ScreenId)
  }

  function recall(step: -1 | 1) {
    const total = pastCommands.current.length
    if (total === 0) return
    const next = (recalling ?? total) + step
    if (next >= total) {
      setRecalling(null)
      return setEntry("")
    }
    const index = Math.max(0, next)
    setRecalling(index)
    setEntry(pastCommands.current[index])
  }

  return (
    <Card ref={pane} className={cn("st-term gap-0 p-0 font-mono max-sm:p-0", className)}>
      <CardTerminalBar>
        <span className="flex min-w-0 items-center gap-2.5">
          <span aria-hidden className="flex gap-1.5">
            <i className="size-2.5 rounded-full bg-[var(--rose-500)]" />
            <i className="size-2.5 rounded-full bg-[var(--amber-500)]" />
            <i className="size-2.5 rounded-full bg-[var(--emerald-500)]" />
          </span>
          <span className="truncate text-[var(--t-folder)] normal-case">{USER}</span>
        </span>
        <span className="truncate text-[var(--t-path)] normal-case">{path(cwd)}</span>
      </CardTerminalBar>

      <CardTerminalBody className="flex min-h-0 flex-1 flex-col p-0">
        <div
          ref={output}
          role="log"
          aria-label="Terminal output"
          className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-y-contain p-5"
          onClick={(event) => {
            if (!(event.target as Element).closest("button, a")) field.current?.focus()
          }}
        >
          {lines.map((line) => (
            <Line key={line.id} line={line} onRun={run} />
          ))}

          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              run(entry)
            }}
          >
            <label htmlFor={id} className="shrink-0">
              <Prompt path={path(cwd)} />
            </label>
            <input
              id={id}
              ref={field}
              value={entry}
              placeholder="type a command"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent text-[var(--fg-primary)] caret-[var(--t-folder)] outline-none placeholder:text-[var(--fg-muted)]"
              onChange={(event) => {
                setEntry(event.target.value)
                setRecalling(null)
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowUp") {
                  event.preventDefault()
                  recall(-1)
                } else if (event.key === "ArrowDown") {
                  event.preventDefault()
                  recall(1)
                } else if (event.key === "Tab" && entry) {
                  event.preventDefault()
                  setEntry(complete(system, cwd, entry))
                }
              }}
            />
          </form>
        </div>

        <div className="st-term-shortcuts flex flex-wrap gap-1.5 border-t border-[var(--border-subtle)] px-4 py-3">
          {SHORTCUTS.map((shortcut) => (
            <button
              key={shortcut}
              type="button"
              onClick={() => run(shortcut)}
              className="focus-ring text-mono-sm cursor-pointer rounded-[var(--radius-sm)] border border-dashed border-[var(--border-strong)] px-2.5 py-1 text-[var(--t-command)] transition-colors hover:border-[var(--t-command)] hover:bg-[var(--bg-hover-soft)]"
            >
              {shortcut}
            </button>
          ))}
        </div>
      </CardTerminalBody>
    </Card>
  )
}

function Prompt({ path: shown }: { path: string }) {
  return (
    <>
      <span className="text-[var(--t-path)]">{shown}</span>{" "}
      <span className="text-[var(--t-folder)]">$</span>
    </>
  )
}

function Line({ line, onRun }: { line: Output; onRun: (command: string) => void }) {
  if (line.type === "echo") {
    return (
      <p className="mt-2.5 first:mt-0">
        <Prompt path={line.path} /> <span className="text-[var(--fg-primary)]">{line.text}</span>
      </p>
    )
  }

  if (line.type === "error") {
    return <p className="text-[var(--status-error-fg)]">{line.text}</p>
  }

  if (line.type === "text") {
    return (
      <pre className="m-0 overflow-x-auto font-mono whitespace-pre text-[var(--fg-secondary)]">
        {line.text.split("\n").map((excerpt, index) => (
          <Fragment key={index}>
            {index > 0 ? "\n" : null}
            <Segment text={excerpt} title={index === 0} />
          </Fragment>
        ))}
      </pre>
    )
  }

  const asList = line.items.some((item) => item.note)
  return (
    <ul
      className={cn("m-0 list-none p-0", asList ? "grid gap-1" : "flex flex-wrap gap-x-5 gap-y-1")}
    >
      {line.items.map((item) => (
        <li
          key={item.label}
          className={asList ? "grid grid-cols-[88px_minmax(0,1fr)] gap-3" : undefined}
        >
          <button
            type="button"
            onClick={() => onRun(item.command)}
            className={cn(
              "focus-ring cursor-pointer text-left underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current",
              COLOR[item.kind],
            )}
          >
            {item.kind === "link" ? "→ " : null}
            {item.label}
          </button>
          {item.note ? <span className="text-[var(--fg-muted)]">{item.note}</span> : null}
        </li>
      ))}
    </ul>
  )
}

function Segment({ text, title }: { text: string; title: boolean }) {
  const method = /^(GET|POST|PATCH|DELETE)\b/.exec(text)?.[1]
  if (method) {
    return (
      <>
        <span className={METHOD_COLOR[method]}>{method}</span>
        {text.slice(method.length)}
      </>
    )
  }
  if (title && text === text.toUpperCase() && /[A-Z]/.test(text)) {
    return <span className="tracking-[0.08em] text-[var(--fg-primary)]">{text}</span>
  }
  return <>{text}</>
}
