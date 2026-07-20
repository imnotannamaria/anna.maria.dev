"use client"

import * as React from "react"

type ThemeMode = "dark" | "light"

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

function applyModeAttribute(mode: ThemeMode) {
  if (typeof document === "undefined") return
  if (mode === "light") document.documentElement.setAttribute("data-mode", "light")
  else document.documentElement.removeAttribute("data-mode")
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
  const modeKey = `${storageKey}:mode`

  const initialTheme = React.useMemo(() => {
    const fallback = defaultTheme ?? themes[0].id
    return themes.some((t) => t.id === fallback) ? fallback : themes[0].id
  }, [defaultTheme, themes])

  const [theme, setThemeState] = React.useState<string>(initialTheme)
  const [mode, setModeState] = React.useState<ThemeMode>(defaultMode)

  // Hydrate from storage once on mount, syncing BOTH React state and the DOM
  // attributes. The ThemeScript applies them pre-paint, but if it ever fails to
  // stick (script timing on a cold mobile refresh) the switcher would show the
  // saved theme while the page rendered the default. Re-applying here keeps the
  // two from diverging: state and visual always come from the same read.
  React.useEffect(() => {
    const storedTheme = safeRead(themeKey)
    if (storedTheme && themes.some((t) => t.id === storedTheme)) {
      setThemeState(storedTheme)
      applyThemeAttribute(storedTheme)
    }
    if (!disableMode) {
      const storedMode = safeRead(modeKey)
      if (storedMode === "dark" || storedMode === "light") {
        setModeState(storedMode)
        applyModeAttribute(storedMode)
      }
    }
  }, [themeKey, modeKey, themes, disableMode])

  const setTheme = React.useCallback(
    (id: string) => {
      if (!themes.some((t) => t.id === id)) return
      setThemeState(id)
      applyThemeAttribute(id)
      safeWrite(themeKey, id)
    },
    [themes, themeKey],
  )

  const setMode = React.useCallback(
    (next: ThemeMode) => {
      if (disableMode) return
      setModeState(next)
      applyModeAttribute(next)
      safeWrite(modeKey, next)
    },
    [modeKey, disableMode],
  )

  const toggleMode = React.useCallback(() => {
    setMode(mode === "dark" ? "light" : "dark")
  }, [mode, setMode])

  const current = React.useMemo(
    () => themes.find((t) => t.id === theme) ?? themes[0],
    [theme, themes],
  )

  return { theme, mode, themes, current, setTheme, setMode, toggleMode }
}

export { useTheme }
export type { ThemeMode, ThemeOption, UseThemeOptions, UseThemeReturn }
