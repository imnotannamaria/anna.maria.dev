"use client"

import { useEffect } from "react"
import { Button } from "@/app/components/entrepta/button"

/**
 * Covers every admin page. Postgres is the only thing here that fails at request time, and
 * without this the default Next error screen shows up instead — white, unstyled, and
 * nothing like the rest of the site.
 *
 * Only I ever see this, so it says what actually helps: what broke, and the digest to
 * search the Vercel logs with.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[admin] page failed", error)
  }, [error])

  return (
    <div>
      <div
        className="mb-3 font-mono text-xs tracking-[0.08em] uppercase"
        style={{ color: "var(--fg-muted)" }}
      >
        <span style={{ color: "var(--status-error-fg)" }}>$</span> log --admin
      </div>

      <h1
        className="font-serif text-4xl leading-none font-normal tracking-[-0.02em]"
        style={{ color: "var(--fg-primary)" }}
      >
        Something broke
      </h1>

      <p className="mt-4 font-mono text-[13px]" style={{ color: "var(--fg-muted)" }}>
        {"// probably the database. nothing was saved."}
      </p>

      {error.digest && (
        <p className="mt-1 font-mono text-[11px]" style={{ color: "var(--fg-muted)" }}>
          {`// digest: ${error.digest}`}
        </p>
      )}

      <div className="mt-6">
        <Button onClick={reset} variant="secondary">
          try again
        </Button>
      </div>
    </div>
  )
}
