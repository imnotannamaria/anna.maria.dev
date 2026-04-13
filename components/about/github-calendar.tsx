"use client"

import { GitHubCalendar } from "react-github-calendar"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

export function GithubCalendar({ username }: { username: string }) {
  const { resolvedTheme } = useTheme()
  const hydrated = useHydrated()

  if (!hydrated) return null

  const colorScheme = resolvedTheme === "dark" ? "dark" : "light"

  return (
    <GitHubCalendar
      username={username}
      colorScheme={colorScheme}
      theme={{
        dark: ["#1a1a24", "#1e1b4b", "#312e81", "#4338ca", "#6366f1"],
        light: ["#f0f0ff", "#c7d2fe", "#818cf8", "#6366f1", "#4338ca"],
      }}
      fontSize={12}
      blockSize={11}
      blockRadius={3}
      blockMargin={4}
      style={{ fontFamily: "var(--font-space-mono)" }}
    />
  )
}
