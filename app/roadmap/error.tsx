"use client"

import { useEffect } from "react"
import { Button } from "@/app/components/entrepta/button"

/**
 * The database is the only thing here that can fail at request time.
 *
 * Deliberately not an empty board: `getPublicItems` returning `[]` means "nothing on the
 * board yet", and showing that when Postgres is unreachable would be a lie — the same call
 * /log made.
 */
export default function RoadmapError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[roadmap] page failed", error)
  }, [error])

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 py-12 sm:px-8 lg:px-11">
      <div
        className="mb-3 font-mono text-xs tracking-[0.08em] uppercase"
        style={{ color: "var(--fg-muted)" }}
      >
        <span style={{ color: "var(--status-error-fg)" }}>$</span> roadmap --all
      </div>

      <h1
        className="font-serif text-[40px] leading-none font-normal tracking-[-0.02em]"
        style={{ color: "var(--fg-primary)" }}
      >
        Roadmap
      </h1>

      <p className="mt-4 font-mono text-[13px]" style={{ color: "var(--fg-muted)" }}>
        {"// couldn't reach the board. it's the database, not you."}
      </p>

      <div className="mt-6">
        <Button onClick={reset} variant="secondary">
          try again
        </Button>
      </div>
    </div>
  )
}
