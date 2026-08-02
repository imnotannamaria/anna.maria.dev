"use client"

import * as React from "react"
import { type ThemeMode, useMode } from "./use-mode"

interface ThemeOption {
  /** Stable identifier written to `data-theme` and persisted. */
  id: string
  /** Human-readable name shown in the switcher. */
  label: string
  /** Brand dot color used in dark mode. */
  color: string
  /** Brand dot color used in light mode. Falls back to `color`. */
  lightColor?: string
}

interface UseThemeOptions {
  themes: readonly ThemeOption[]
  defaultTheme?: string
  defaultMode?: ThemeMode
  /**
   * localStorage key prefix. The hook stores `${storageKey}:theme` and
   * `${storageKey}:mode`. Default `"entrepta"`.
   */
  storageKey?: string
  /** Disable mode toggling. Mode stays at `defaultMode`. */
  disableMode?: boolean
}

interface UseThemeReturn {
  theme: string
  mode: ThemeMode
  themes: readonly ThemeOption[]
  current: ThemeOption
  setTheme: (id: string) => void
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
}

function applyThemeAttribute(theme: string) {
  if (typeof document === "undefined") return
  document.documentElement.setAttribute("data-theme", theme)
}

function safeRead(key: string): string | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeWrite(key: string, value: string) {
  try {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value)
  } catch {}
}

function useTheme(options: UseThemeOptions): UseThemeReturn {
  const {
    themes,
    defaultTheme,
    defaultMode = "dark",
    storageKey = "entrepta",
    disableMode,
  } = options

  if (themes.length === 0) {
    throw new Error("useTheme: `themes` must contain at least one entry")
  }

  const themeKey = `${storageKey}:theme`
  const { mode, setMode, toggleMode } = useMode({ defaultMode, storageKey, disableMode })

  const initialTheme = React.useMemo(() => {
    const fallback = defaultTheme ?? themes[0].id
    return themes.some((t) => t.id === fallback) ? fallback : themes[0].id
  }, [defaultTheme, themes])

  const [theme, setThemeState] = React.useState<string>(initialTheme)

  // Hydrate from storage once on mount. The ThemeScript already applied the
  // attribute pre-paint; this just syncs React state to match.
  React.useEffect(() => {
    const storedTheme = safeRead(themeKey)
    if (storedTheme && themes.some((t) => t.id === storedTheme)) {
      setThemeState(storedTheme)
    }
  }, [themeKey, themes])

  const setTheme = React.useCallback(
    (id: string) => {
      if (!themes.some((t) => t.id === id)) return
      setThemeState(id)
      applyThemeAttribute(id)
      safeWrite(themeKey, id)
    },
    [themes, themeKey],
  )

  const current = React.useMemo(
    () => themes.find((t) => t.id === theme) ?? themes[0],
    [theme, themes],
  )

  return { theme, mode, themes, current, setTheme, setMode, toggleMode }
}

export { useTheme }
export type { ThemeMode, ThemeOption, UseThemeOptions, UseThemeReturn }
