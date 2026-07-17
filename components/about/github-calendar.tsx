"use client"

import { GitHubCalendar } from "react-github-calendar"
import { useState, useEffect } from "react"

export function GithubCalendar({ username }: { username: string }) {
  const [mode, setMode] = useState<"dark" | "light">("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only mount guard to avoid hydration mismatch
    setMounted(true)
    const update = () => {
      const m = document.documentElement.getAttribute("data-mode")
      setMode(m === "light" ? "light" : "dark")
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-mode"],
    })
    return () => observer.disconnect()
  }, [])

  // react-github-calendar fetches on the client and produces markup that can't
  // match the server render, so we render nothing until mounted to avoid a
  // hydration mismatch. A fixed-height placeholder keeps layout shift minimal.
  if (!mounted) {
    return <div aria-hidden style={{ height: 140 }} />
  }

  return (
    <GitHubCalendar
      username={username}
      colorScheme={mode}
      theme={{
        // The library writes each level straight into the SVG `fill`, so CSS
        // vars / color-mix resolve there. Deriving the whole scale from
        // --fg-brand (empty level uses --bg-surface) makes the heatmap follow
        // both the active theme and light/dark mode with no hardcoded hues.
        dark: [
          "var(--bg-surface)",
          "color-mix(in srgb, var(--fg-brand) 25%, var(--bg-surface))",
          "color-mix(in srgb, var(--fg-brand) 50%, var(--bg-surface))",
          "var(--fg-brand)",
          "var(--fg-brand-hover)",
        ],
        light: [
          "var(--bg-surface)",
          "color-mix(in srgb, var(--fg-brand) 25%, var(--bg-surface))",
          "color-mix(in srgb, var(--fg-brand) 50%, var(--bg-surface))",
          "var(--fg-brand)",
          "var(--fg-brand-hover)",
        ],
      }}
      fontSize={12}
      blockSize={11}
      blockRadius={3}
      blockMargin={4}
    />
  )
}
