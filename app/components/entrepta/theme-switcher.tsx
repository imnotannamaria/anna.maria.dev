"use client"

import { Moon, Sun } from "lucide-react"
import * as React from "react"
import type { ThemeMode } from "@/hooks/use-mode"
import { type ThemeOption, type UseThemeOptions, useTheme } from "@/hooks/use-theme"
import { cn } from "@/lib/utils"

type SwitcherPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left"

interface ThemeSwitcherProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onChange">, UseThemeOptions {
  /** Where the floating button anchors. Default `"bottom-right"`. */
  position?: SwitcherPosition
  /** Hide the dark/light section. Default `false`. */
  hideModeToggle?: boolean
  /** Label for the screen-reader-only live region. Default `"Active theme"`. */
  liveLabel?: string
}

// Both icons stay mounted and stacked so the swap can cross-fade. They turn in
// opposite directions, which reads like a dial. The globals.css reduced-motion
// block flattens the transition for anyone who asks for less movement.
const ICON_BASE =
  "col-start-1 row-start-1 text-[var(--fg-primary)] transition-[opacity,rotate,scale] duration-[var(--motion-base)] ease-[var(--ease-out)]"
const ICON_IN = "opacity-100 rotate-0 scale-100"
const ICON_STYLE = { width: 14, height: 14, strokeWidth: 1.5 }

/** Sun in light mode, moon in dark mode. Shows the mode you are in, not the one you get. */
function ModeIcon({ mode }: { mode: ThemeMode }) {
  return (
    <span aria-hidden className="relative inline-grid h-4 w-4 shrink-0 place-items-center">
      <Moon
        className={cn(ICON_BASE, mode === "dark" ? ICON_IN : "scale-50 rotate-90 opacity-0")}
        style={ICON_STYLE}
      />
      <Sun
        className={cn(ICON_BASE, mode === "light" ? ICON_IN : "scale-50 -rotate-90 opacity-0")}
        style={ICON_STYLE}
      />
    </span>
  )
}

const POSITION_CLASS: Record<SwitcherPosition, string> = {
  "bottom-right": "bottom-12 right-5",
  "bottom-left": "bottom-12 left-5",
  "top-right": "top-5 right-5",
  "top-left": "top-5 left-5",
}

const ThemeSwitcher = React.forwardRef<HTMLDivElement, ThemeSwitcherProps>(
  (
    {
      themes,
      defaultTheme,
      defaultMode,
      storageKey,
      disableMode,
      position = "bottom-right",
      hideModeToggle,
      liveLabel = "Active theme",
      className,
      ...divProps
    },
    ref,
  ) => {
    const { theme, mode, current, setTheme, toggleMode } = useTheme({
      themes,
      defaultTheme,
      defaultMode,
      storageKey,
      disableMode,
    })

    const [open, setOpen] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)
    React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement)

    React.useEffect(() => {
      if (!open) return
      function onPointerDown(event: PointerEvent) {
        if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
      }
      function onKey(event: KeyboardEvent) {
        if (event.key === "Escape") setOpen(false)
      }
      window.addEventListener("pointerdown", onPointerDown)
      window.addEventListener("keydown", onKey)
      return () => {
        window.removeEventListener("pointerdown", onPointerDown)
        window.removeEventListener("keydown", onKey)
      }
    }, [open])

    function handleSelectTheme(id: string) {
      setTheme(id)
      setOpen(false)
    }

    const currentColor = mode === "light" ? (current.lightColor ?? current.color) : current.color
    const showModeToggle = !hideModeToggle && !disableMode

    return (
      <div
        ref={containerRef}
        className={cn("fixed z-50 font-mono text-[11px]", POSITION_CLASS[position], className)}
        data-theme-switcher
        {...divProps}
      >
        <span aria-live="polite" className="sr-only">
          {liveLabel}: {current.label}
          {showModeToggle ? `, ${mode} mode.` : "."}
        </span>

        {open && (
          <div
            aria-label="Theme settings"
            className="absolute right-0 bottom-[calc(100%+8px)] flex min-w-[180px] flex-col gap-1 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
          >
            {showModeToggle && (
              <>
                <div className="mb-1 border-b border-[var(--border-subtle)] px-2 py-1 text-[10px] tracking-[0.08em] text-[var(--fg-muted)] uppercase">
                  mode
                </div>
                <button
                  type="button"
                  aria-pressed={mode === "light"}
                  data-mode={mode}
                  onClick={toggleMode}
                  className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-left transition-colors hover:bg-[var(--bg-hover-soft)] focus-visible:bg-[var(--bg-hover-soft)] focus-visible:outline-none"
                >
                  <span className="flex items-center gap-2.5">
                    <span aria-hidden className="inline-grid h-4 w-4 shrink-0 place-items-center">
                      <ModeIcon mode={mode} />
                    </span>
                    <span className="text-[var(--fg-primary)]">{mode}</span>
                  </span>
                  <span className="text-[10px] tracking-[0.08em] text-[var(--fg-muted)] uppercase">
                    {mode === "dark" ? "→ light" : "→ dark"}
                  </span>
                </button>

                <div className="mt-2 mb-1 border-b border-[var(--border-subtle)] px-2 py-1 text-[10px] tracking-[0.08em] text-[var(--fg-muted)] uppercase">
                  theme
                </div>
              </>
            )}
            {themes.map((t: ThemeOption) => {
              const isActive = t.id === theme
              const dotColor = mode === "light" ? (t.lightColor ?? t.color) : t.color
              return (
                <button
                  type="button"
                  aria-pressed={isActive}
                  key={t.id}
                  onClick={() => handleSelectTheme(t.id)}
                  className="group flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-left transition-colors hover:bg-[var(--bg-hover-soft)] focus-visible:bg-[var(--bg-hover-soft)] focus-visible:outline-none"
                >
                  <span
                    aria-hidden
                    className="inline-block h-4 w-4 shrink-0 rounded-full border border-[var(--border-subtle)]"
                    style={{ background: dotColor }}
                  />
                  <span
                    className={
                      isActive
                        ? "flex-1 text-[var(--fg-primary)]"
                        : "flex-1 text-[var(--fg-secondary)] transition-colors group-hover:text-[var(--fg-primary)]"
                    }
                  >
                    {t.label}
                  </span>
                  {isActive && (
                    <span aria-hidden className="text-[10px] leading-none text-[var(--fg-brand)]">
                      ◆
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        <button
          type="button"
          aria-label={
            showModeToggle
              ? `Theme: ${current.label}, ${mode} mode. Click to change.`
              : `Theme: ${current.label}. Click to change.`
          }
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-colors hover:border-[var(--border-strong)] focus-visible:border-[var(--fg-brand)] focus-visible:shadow-[0_0_0_3px_var(--bg-surface-brand)] focus-visible:outline-none"
        >
          <span
            aria-hidden
            className="inline-block h-3.5 w-3.5 rounded-full border border-[var(--border-subtle)]"
            style={{ background: currentColor }}
          />
          {showModeToggle && (
            <span className="text-[10px] tracking-[0.08em] text-[var(--fg-muted)] uppercase">
              {mode}
            </span>
          )}
        </button>
      </div>
    )
  },
)
ThemeSwitcher.displayName = "ThemeSwitcher"

interface ThemeScriptProps {
  /** Must match the `storageKey` passed to `ThemeSwitcher` / `useTheme`. */
  storageKey?: string
}

/**
 * Inline script that runs before React hydrates so the saved theme + mode
 * are applied before first paint. Drop this in your root `<head>` to avoid
 * a flash of the default look on every page load.
 */
function ThemeScript({ storageKey = "entrepta" }: ThemeScriptProps) {
  const themeKey = JSON.stringify(`${storageKey}:theme`)
  const modeKey = JSON.stringify(`${storageKey}:mode`)
  const script = `(function(){try{var t=localStorage.getItem(${themeKey});if(t)document.documentElement.setAttribute('data-theme',t);var m=localStorage.getItem(${modeKey});if(m==='light')document.documentElement.setAttribute('data-mode','light');}catch(e){}})();`
  // biome-ignore lint/security/noDangerouslySetInnerHtml: static string we control; no user input is interpolated.
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}

export { ThemeScript, ThemeSwitcher }
export type { SwitcherPosition, ThemeScriptProps, ThemeSwitcherProps }
