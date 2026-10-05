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

// Typed here rather than taken from lib.dom, which only has it from TypeScript 5.6.
type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => {
    ready: Promise<unknown>
    finished: Promise<unknown>
  }
}

// Two switches can overlap, such as a double click. The flag stays until the last one ends.
let switching = 0

/**
 * Applies a theme or mode change to the whole page at once.
 *
 * Components ease their own colors, each on its own clock: a card over 200ms,
 * a button over 150ms, a badge not at all. Swapped under them, the mode lands
 * piece by piece. For the length of the switch, `data-theme-switching` on
 * `<html>` turns every transition off (globals.css), so the page changes in one
 * frame. Where the browser has view transitions, that frame crossfades with the
 * last one as a single picture. Reduced motion gets the instant switch.
 *
 * `useMode` and `useTheme` call it for you. Wrap your own attribute changes in
 * it if you switch the theme some other way.
 */
function transitionTheme(apply: () => void) {
  if (typeof document === "undefined") return apply()
  const root = document.documentElement
  switching += 1
  root.setAttribute("data-theme-switching", "")
  const done = () => {
    switching -= 1
    if (switching === 0) root.removeAttribute("data-theme-switching")
  }

  const doc = document as ViewTransitionDocument
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  if (!reduced && typeof doc.startViewTransition === "function") {
    const transition = doc.startViewTransition(apply)
    // a switch that starts before this one ends skips it, which rejects `ready`
    transition.ready.catch(() => {})
    transition.finished.then(done, done)
    return
  }

  try {
    apply()
  } finally {
    // The first frame paints the new colors with transitions off. Turning them
    // back on before it would let every component ease into the change again.
    requestAnimationFrame(() => requestAnimationFrame(done))
  }
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
      const next = event.newValue
      if (next !== "dark" && next !== "light") return
      setModeState(next)
      transitionTheme(() => applyModeAttribute(next))
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [modeKey, disableMode])

  const setMode = React.useCallback(
    (next: ThemeMode) => {
      if (disableMode) return
      setModeState(next)
      transitionTheme(() => applyModeAttribute(next))
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

export { transitionTheme, useMode }
export type { ThemeMode, UseModeOptions, UseModeReturn }
