"use client"

import { GitHubCalendar } from "react-github-calendar"
import { useState, useEffect } from "react"

export function GithubCalendar({ username }: { username: string }) {
  const [mode, setMode] = useState<"dark" | "light">("dark")

  useEffect(() => {
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

  return (
    <GitHubCalendar
      username={username}
      colorScheme={mode}
      theme={{
        dark: ["#18181b", "#2e1f7a", "#4338ca", "#6b5bff", "#9b8eff"],
        light: ["#f0f0ff", "#c7d2fe", "#818cf8", "#6b5bff", "#4338ca"],
      }}
      fontSize={12}
      blockSize={11}
      blockRadius={3}
      blockMargin={4}
    />
  )
}
