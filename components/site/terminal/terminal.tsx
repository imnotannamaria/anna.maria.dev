"use client"

import type { SiteData } from "@/components/site/frame/site-data"
import { useSiteData } from "@/components/site/frame/use-site-data"
import { buildFiles, type FileWords } from "./files"
import { useTranslations } from "next-intl"
import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react"
import { FileIcon, FolderIcon, GitBranchIcon } from "@phosphor-icons/react"
import { Card, CardTerminalBody } from "@/app/components/entrepta/card"
import { cn } from "@/lib/utils"
import { pet } from "@/components/site/abimaela/abimaela"
import type { ScreenId } from "@/components/site/pages"
import { useNavigate } from "@/components/site/navigation"
import {
  SHELL_WORDS,
  commandSchema,
  path,
  complete,
  execute,
  type Output,
  type ItemKind,
} from "./shell"
import "./terminal.css"

type LogLine = Output & { id: number }

const SHORTCUTS = ["help", "ls", "cat person.txt", "cat professional.txt", "routes", "open notes"]

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
  const t = useTranslations("terminal")
  const pages = useTranslations("pages")
  const system = useMemo(() => {
    // the shell is a plain function: it gets its sentences already in the page's language
    const shell = structuredClone(SHELL_WORDS)
    for (const key of Object.keys(shell.does) as (keyof typeof shell.does)[]) {
      shell.does[key] = t.raw(`shell.does.${key}`)
    }
    for (const key of Object.keys(shell) as (keyof typeof shell)[]) {
      if (key !== "does") shell[key] = t.raw(`shell.${key}`)
    }
    const words: FileWords = {
      // `t.raw` hands back the sentence as written, slots and all; the files fill them
      files: (key, values = {}) =>
        String(t.raw(`files.${key}` as "files.home")).replace(/\{(\w+)\}/g, (_, name: string) =>
          String(values[name] ?? ""),
        ),
      page: (id, part) => pages(`${id}.${part}`),
      shell,
    }
    return buildFiles(withLog, words)
  }, [withLog, t, pages])
  const [lines, setLines] = useState<LogLine[]>(() => [{ type: "text", text: t("welcome"), id: 0 }])
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

  // the newest block is always the one in view, just above the input
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

  // how many things are in the folder you are in, hidden ones left out
  const here = useMemo(() => {
    let node: unknown = system.root
    for (const part of cwd) node = (node as Record<string, unknown> | undefined)?.[part]
    return node && typeof node === "object"
      ? Object.keys(node).filter((name) => !name.startsWith(".")).length
      : 0
  }, [system, cwd])

  function run(raw: string) {
    // what the field may send: one line, trimmed, of a sane length
    const checked = commandSchema.safeParse(raw)
    const line = checked.success ? checked.data : ""
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
      <CardTerminalBody className="flex min-h-0 flex-1 flex-col p-0">
        <div
          ref={output}
          role="log"
          aria-label={t("output")}
          // a click on the empty part only puts the cursor back in the field: not a control
          data-sound="off"
          className="st-term-output flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-y-contain p-5"
          onClick={(event) => {
            if (!(event.target as Element).closest("button, a")) field.current?.focus()
          }}
        >
          {lines.map((line) => (
            <Line key={line.id} line={line} onRun={run} />
          ))}
        </div>

        <div className="st-term-shortcuts flex flex-wrap gap-1.5 px-4 pt-3">
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
        {/* The input lives at the foot, the way Warp and fish do it: a row of chips saying where
            you are, the command under it, and everything that ran stacking up above. */}
        <form
          className="st-term-input"
          onSubmit={(event) => {
            event.preventDefault()
            run(entry)
          }}
        >
          {/* where you are, as chips: the folder, the branch the site ships from, and what is in
              the folder. They are the input's label, so a screen reader hears them with it. */}
          <label htmlFor={id} className="st-term-chips text-mono-sm">
            <span className="st-term-chip" data-kind="folder">
              <FolderIcon aria-hidden size={14} />
              {path(cwd)}
            </span>
            <span className="st-term-chip" data-kind="branch">
              <GitBranchIcon aria-hidden size={14} />
              main
            </span>
            <span className="st-term-chip" data-kind="files">
              <FileIcon aria-hidden size={14} />
              {t("items", { count: here })}
            </span>
          </label>
          <div className="flex items-center gap-2">
            <span aria-hidden className="text-[var(--t-folder)]">
              ❯
            </span>
            <input
              id={id}
              ref={field}
              value={entry}
              placeholder={t("placeholder")}
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
          </div>
        </form>
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
      <p className="st-term-block">
        <Prompt path={line.path} /> <span className="text-[var(--fg-primary)]">{line.text}</span>
      </p>
    )
  }

  if (line.type === "error") {
    return <p className="text-[var(--status-error-fg)]">{line.text}</p>
  }

  if (line.type === "text") {
    return (
      // Wraps instead of scrolling sideways. Each block used to be its own scroller, so a long
      // line put a scrollbar in the middle of the output; the only scroll here is the log's own.
      <pre className="m-0 font-mono [overflow-wrap:anywhere] whitespace-pre-wrap text-[var(--fg-secondary)]">
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
