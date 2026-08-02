"use client"

import * as React from "react"

type ThemeMode = "dark" | "light"

interface UseModeOptions {
  /** Mode used when nothing is stored. Default `"dark"`. */
  defaultMode?: ThemeMode
  /**
   * localStorage key prefix. The hook stores `${storageKey}:mode`. Default
   * `"entrepta"`. Keep it in sync with `useTheme` if you use both.
   */
  storageKey?: string
  /** Lock the mode to `defaultMode`. Setters become no-ops. */
  disableMode?: boolean
}

interface UseModeReturn {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
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

// Every hook instance sharing a storage key also shares this list, so a
// ModeToggle in the nav and a ThemeSwitcher in the corner never drift apart.
const listeners = new Map<string, Set<(mode: ThemeMode) => void>>()

function subscribe(key: string, listener: (mode: ThemeMode) => void) {
  const forKey = listeners.get(key) ?? new Set<(mode: ThemeMode) => void>()
  forKey.add(listener)
  listeners.set(key, forKey)
  return () => {
    forKey.delete(listener)
    if (forKey.size === 0) listeners.delete(key)
  }
}

function broadcast(key: string, mode: ThemeMode) {
  for (const listener of listeners.get(key) ?? []) listener(mode)
}

/**
 * Dark/light mode only. Drives `data-mode` on `<html>` and persists the
 * choice. Use `useTheme` instead when you also need the color presets.
 */
function useMode(options: UseModeOptions = {}): UseModeReturn {
  const { defaultMode = "dark", storageKey = "entrepta", disableMode } = options

  const modeKey = `${storageKey}:mode`
  const [mode, setModeState] = React.useState<ThemeMode>(defaultMode)

  // Resolve the stored mode on mount and write it back to the DOM. ModeScript
  // only ever adds the attribute pre-paint, so clearing a stale one is on us:
  // without this, `disableMode` over a stored "light" leaves the page light
  // while the hook reports dark, with no way back.
  React.useEffect(() => {
    const stored = disableMode ? null : safeRead(modeKey)
    const resolved = stored === "dark" || stored === "light" ? stored : defaultMode
    setModeState(resolved)
    applyModeAttribute(resolved)
  }, [modeKey, defaultMode, disableMode])

  React.useEffect(() => {
    if (disableMode) return
    return subscribe(modeKey, setModeState)
  }, [modeKey, disableMode])

  // Another tab switching mode writes to storage but not to this document.
  React.useEffect(() => {
    if (disableMode || typeof window === "undefined") return
    function onStorage(event: StorageEvent) {
      if (event.key !== modeKey) return
      if (event.newValue !== "dark" && event.newValue !== "light") return
      setModeState(event.newValue)
      applyModeAttribute(event.newValue)
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [modeKey, disableMode])

  const setMode = React.useCallback(
    (next: ThemeMode) => {
      if (disableMode) return
      setModeState(next)
      applyModeAttribute(next)
      safeWrite(modeKey, next)
      broadcast(modeKey, next)
    },
    [modeKey, disableMode],
  )

  const toggleMode = React.useCallback(() => {
    setMode(mode === "dark" ? "light" : "dark")
  }, [mode, setMode])

  return { mode, setMode, toggleMode }
}

export { useMode }
export type { ThemeMode, UseModeOptions, UseModeReturn }
