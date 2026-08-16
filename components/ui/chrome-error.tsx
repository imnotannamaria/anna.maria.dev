"use client"

import { useEffect } from "react"
import { Button } from "@/app/components/entrepta/button"
import { ChromeMessage } from "./chrome-message"

/**
 * The client half of an `error.tsx`. Every error boundary on the site is the same thing: log
 * the error once, then render the `ChromeMessage` surface with a red prompt and a `try again`
 * that calls `reset`. This holds that boilerplate so each `error.tsx` is just its own strings.
 *
 * `logTag` is what the `console.error` is prefixed with, so the four boundaries stay
 * distinguishable in the Vercel logs. `showDigest` is admin-only — the digest is a handle for
 * searching those logs, and only I ever see the admin one.
 */
export function ChromeError({
  error,
  reset,
  command,
  title,
  note,
  logTag,
  showDigest = false,
  className,
}: {
  error: Error & { digest?: string }
  reset: () => void
  command: string
  title: string
  note: string
  logTag: string
  showDigest?: boolean
  className?: string
}) {
  useEffect(() => {
    console.error(logTag, error)
  }, [logTag, error])

  return (
    <ChromeMessage
      accent="error"
      command={command}
      title={title}
      note={note}
      className={className}
      action={
        <Button onClick={reset} variant="secondary">
          try again
        </Button>
      }
    >
      {showDigest && error.digest && (
        <p className="text-mono-sm mt-1 font-mono" style={{ color: "var(--fg-muted)" }}>
          {`// digest: ${error.digest}`}
        </p>
      )}
    </ChromeMessage>
  )
}
