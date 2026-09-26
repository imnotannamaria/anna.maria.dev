"use client"

import { CheckIcon, CopyIcon, WarningIcon } from "@phosphor-icons/react"
import * as React from "react"
import { cn } from "@/lib/utils"

interface CodeBlockProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Raw code copied to clipboard. Required for the copy button. */
  code: string
  /** Optional language label shown on the right of the chrome (e.g. "tsx", "bash"). */
  language?: string
  /** Optional filename or label shown on the left of the chrome. */
  filename?: string
  /** Optional secondary text shown between the filename and the language label. */
  meta?: string
  /** `terminal` renders macOS-style window dots; `default` keeps a clean chrome. */
  variant?: "default" | "terminal"
  /** Hide the copy button if false. Default true. */
  showCopy?: boolean
  /** Milliseconds the "copied" state stays visible after a successful copy. */
  copyTimeout?: number
  /** Wrap long lines instead of scrolling sideways, for prose such as Markdown. */
  wrap?: boolean
  /** `sm` for a compact block inside a card or a narrow panel. */
  size?: "sm" | "md"
}

const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  (
    {
      code,
      language,
      filename,
      meta,
      variant = "default",
      showCopy = true,
      copyTimeout = 1500,
      wrap = false,
      size = "md",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [copyState, setCopyState] = React.useState<"idle" | "copied" | "error">("idle")
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

    React.useEffect(() => {
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    }, [])

    const handleCopy = React.useCallback(async () => {
      try {
        if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
          throw new Error("Clipboard unavailable")
        }
        await navigator.clipboard.writeText(code)
        setCopyState("copied")
      } catch {
        // No clipboard on an insecure origin, or permission denied. Say so instead
        // of claiming a copy that did not happen.
        setCopyState("error")
      } finally {
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => setCopyState("idle"), copyTimeout)
      }
    }, [code, copyTimeout])

    const hasChrome = variant === "terminal" || Boolean(filename) || Boolean(meta) || showCopy

    return (
      <div
        ref={ref}
        className={cn(
          // a column, so a block given a height scrolls its body and keeps its header
          "relative flex flex-col rounded-[var(--radius-md)] border border-[var(--border-subtle)]",
          "sheen overflow-hidden bg-[var(--bg-overlay)] shadow-[var(--shadow-card)]",
          className,
        )}
        {...props}
      >
        {hasChrome && (
          <div
            className={cn(
              // the halves shrink before the copy button does, so it never leaves the block
              "flex min-w-0 items-center gap-3 px-4 py-2",
              "border-b border-[var(--border-subtle)]",
              "text-mono-sm font-mono text-[var(--fg-secondary)]",
            )}
          >
            {variant === "terminal" && (
              <div aria-hidden className="flex shrink-0 items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--status-error)] opacity-60" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--status-warning)] opacity-60" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--status-success)] opacity-60" />
              </div>
            )}
            {filename && (
              <span className="min-w-0 truncate text-[var(--fg-muted)]">{filename}</span>
            )}
            <div className="ml-auto flex min-w-0 items-center gap-3">
              {meta && (
                <span className="hidden min-w-0 truncate text-[var(--fg-muted)] sm:inline">
                  {meta}
                </span>
              )}
              {language && (
                <span className="text-mono-xs tracking-[0.08em] text-[var(--fg-brand-text)] uppercase">
                  {language}
                </span>
              )}
              {showCopy && (
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label={
                    copyState === "copied"
                      ? "Copied"
                      : copyState === "error"
                        ? "Copy failed"
                        : "Copy code"
                  }
                  data-state={copyState}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-1.5 py-1",
                    "text-mono-xs rounded-[var(--radius-sm)] tracking-[0.08em] uppercase",
                    "border border-[var(--border-subtle)] bg-[var(--bg-canvas)]",
                    "text-[var(--fg-muted)] hover:border-[var(--border-strong)] hover:text-[var(--fg-primary)]",
                    "transition-colors duration-150",
                    "focus-ring",
                  )}
                >
                  {copyState === "copied" ? (
                    <>
                      <CheckIcon aria-hidden size={11} className="text-[var(--status-success)]" />
                      <span>copied</span>
                    </>
                  ) : copyState === "error" ? (
                    <>
                      <WarningIcon aria-hidden size={11} className="text-[var(--status-error)]" />
                      <span>copy failed</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon aria-hidden size={11} />
                      <span>copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
          {children ? (
            <div
              className={cn(
                "p-4 font-mono leading-relaxed text-[var(--fg-secondary)]",
                size === "sm" ? "text-mono-sm" : "text-mono-md",
                wrap ? "[overflow-wrap:anywhere] whitespace-pre-wrap" : "whitespace-pre",
              )}
            >
              {children}
            </div>
          ) : (
            <pre
              className={cn(
                "m-0 p-4 font-mono leading-relaxed text-[var(--fg-secondary)]",
                size === "sm" ? "text-mono-sm" : "text-mono-md",
                wrap ? "[overflow-wrap:anywhere] whitespace-pre-wrap" : "whitespace-pre",
              )}
            >
              <code>{code}</code>
            </pre>
          )}
        </div>
      </div>
    )
  },
)
CodeBlock.displayName = "CodeBlock"

export { CodeBlock }
export type { CodeBlockProps }
