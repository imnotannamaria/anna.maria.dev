"use client"

import { useEffect } from "react"
import { Button } from "@/app/components/entrepta/button"

/**
 * `Home()` already guards the log query with its own `.catch`, so this only fires for
 * something the page didn't expect — the wristkit or GitHub calls throwing past their own
 * null-safe returns, or a bug in the render itself. Without this the default Next error
 * screen shows up instead, same reason /log and /roadmap have one.
 */
export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[home] page failed", error)
  }, [error])

  return (
    <div
      className="mx-auto flex flex-col px-4 py-6 sm:px-6 md:px-8 lg:px-12 lg:py-8"
      style={{ maxWidth: 1280, minHeight: "60vh" }}
    >
      <div
        className="mb-3 font-mono text-xs tracking-[0.08em] uppercase"
        style={{ color: "var(--fg-muted)" }}
      >
        <span style={{ color: "var(--status-error-fg)" }}>$</span> whoami
      </div>

      <h1
        className="font-serif text-[40px] leading-none font-normal tracking-[-0.02em]"
        style={{ color: "var(--fg-primary)" }}
      >
        Something broke
      </h1>

      <p className="mt-4 font-mono text-[13px]" style={{ color: "var(--fg-muted)" }}>
        {"// couldn't load the page. it's the database, not you."}
      </p>

      <div className="mt-6">
        <Button onClick={reset} variant="secondary">
          try again
        </Button>
      </div>
    </div>
  )
}
