"use client"

import { useEffect } from "react"
import { Button } from "@/app/components/entrepta/button"

/** What a page that reads the database shows while it waits. */
export function ScreenLoading() {
  return (
    <div className="st-room st-screen" role="status">
      <p className="text-mono-sm font-mono text-[var(--fg-muted)]">loading…</p>
    </div>
  )
}

/** What it shows when it fails: an empty page would read as "nothing here", which is a lie. */
export function ScreenError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[site] page failed", error)
  }, [error])

  return (
    <div className="st-room st-screen" role="alert">
      <h1 className="text-heading-lg font-serif text-[var(--fg-primary)]">
        This page did not load.
      </h1>
      <p className="text-body-md font-sans text-[var(--fg-secondary)]">
        It is on my side, not yours. Try again in a moment.
      </p>
      <Button className="self-start" onClick={reset}>
        try again
      </Button>
    </div>
  )
}
