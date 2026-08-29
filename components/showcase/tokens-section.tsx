"use client"

/**
 * What the site is drawn from: colour, type, space, radius, motion, and the rules behind them.
 *
 * Every swatch renders `var(--token)` and never a captured hex, so the whole section repaints
 * when the real `ThemeSwitcher` — already sitting bottom-right on every route — changes theme
 * or mode. There is no second switcher built for this page and no frozen row of six themes side
 * by side: flipping the real one *is* the demo, and a swatch that does not move when you do
 * that is a hardcoded colour, caught by looking rather than by reading a diff.
 */

import { useMemo, useSyncExternalStore } from "react"
import { RULES, TOKEN_GROUPS, type TokenEntry, type TokenGroup } from "@/lib/design-tokens"
import { contrastRatio, flatten, parseRgb, wcagGrade, type Rgba } from "@/lib/color-contrast"
import { Diamond } from "@/components/ui/diamond"

/**
 * Reads what a custom property actually resolves to.
 *
 * Not `getPropertyValue`, and this is the trap in the whole section. Unregistered custom
 * properties are *substituted* at computed-value time but never *evaluated*: `--bg-canvas:
 * var(--zinc-950)` does read back as `#09090b`, so the flat tokens behave — but
 * `--border-brand` is `color-mix(in srgb, var(--fg-brand) 35%, transparent)` and reads back as
 * that string with the inner var() swapped in and the mix not run. Eleven of the colour tokens
 * here are `color-mix()` or `rgba()`.
 *
 * Assigning the token to a real colour property forces the engine to resolve it, and hand back
 * `rgb(r g b / a)` — which is also the more useful thing to print under a swatch.
 */
/**
 * A single reusable off-screen element, made when this module is evaluated.
 *
 * At module scope rather than lazily inside the reader, because that reader runs during render
 * and `appendChild` is a DOM mutation — something React does not permit in the render phase and
 * concurrent rendering may interrupt halfway. A module-level cache made it idempotent enough to
 * work, which is exactly why it went unnoticed. A client module is evaluated during hydration,
 * before anything renders, so this happens once and never again.
 *
 * `document.body` is guarded rather than assumed: Next defers this script to the end of the
 * document so the body is there, but a null here would be a blank page rather than a blank
 * swatch, and that is not a trade worth making for one `?.`.
 */
const probe: HTMLSpanElement | null = (() => {
  if (typeof document === "undefined" || !document.body) return null
  const el = document.createElement("span")
  el.setAttribute("aria-hidden", "true")
  el.style.cssText = "position:absolute;opacity:0;pointer-events:none;width:0;height:0"
  document.body.appendChild(el)
  return el
})()

function resolveToken(token: string): string {
  if (!probe) return ""
  probe.style.color = `var(${token})`
  return getComputedStyle(probe).color.trim()
}

/** Non-colour tokens are plain values — those `getPropertyValue` handles fine. */
function readRaw(token: string): string {
  if (typeof document === "undefined") return ""
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim()
}

/**
 * The active theme and mode, as a string that changes when either does.
 *
 * `useSyncExternalStore` rather than state synced in an effect — the theme lives on `<html>`,
 * which is an external store, and this is the same shape `components/ui/url-filter.tsx` uses to
 * read the URL. The server snapshot is empty, so nothing is read during prerender and the
 * values fill in on hydration.
 *
 * `hooks/use-mode.ts` sets `data-mode="light"` or *removes* the attribute, so absent means
 * dark. Removal fires the observer just the same.
 */
function subscribeToTheme(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-mode"],
  })
  return () => observer.disconnect()
}

function themeSnapshot(): string {
  const el = document.documentElement
  return `${el.getAttribute("data-theme") ?? "entrepta"}:${el.getAttribute("data-mode") ?? "dark"}`
}

const themeServerSnapshot = () => ""

function useThemeKey(): string {
  return useSyncExternalStore(subscribeToTheme, themeSnapshot, themeServerSnapshot)
}

/**
 * Every token in a group, resolved, re-read whenever the theme or mode changes — and only then.
 *
 * `theme` is in the dependency list, so the `getComputedStyle` calls happen once per theme or
 * mode change rather than once per render. That matters because each one forces a style
 * recalculation, and a group is a dozen of them.
 *
 * An effect would be the textbook home for a DOM read, and it is the wrong one here: writing the
 * result to state from an effect is what `react-hooks/set-state-in-effect` exists to stop, and
 * the rule is right — the reads have no external event to be driven by, they are a pure function
 * of the theme key this already subscribes to. The mutation that genuinely did not belong in
 * render is the probe's `appendChild`, and that moved to module scope above.
 *
 * The first frame shows `—` where a value goes, which was already true: `useThemeKey`'s server
 * snapshot is empty, so nothing resolves during prerender either. Token names and their notes
 * are server-rendered, which is the half worth having in the HTML.
 *
 * Takes the token list as a `|`-joined string rather than an array, because an array literal is
 * a new identity on every render and could not be a dependency without looping.
 */
function useTokenValues(tokenKey: string, colour: boolean): Record<string, string> {
  const theme = useThemeKey()

  return useMemo(() => {
    const next: Record<string, string> = {}
    if (!theme) return next
    for (const t of tokenKey.split("|").filter(Boolean)) {
      next[t] = colour ? resolveToken(t) : readRaw(t)
    }
    return next
  }, [tokenKey, colour, theme])
}

// ─── Swatches ─────────────────────────────────────────────────────────────────

function SurfaceSwatch({ entry, value }: { entry: TokenEntry; value: string }) {
  return (
    <div
      className="overflow-hidden rounded-[var(--radius-md)] border"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div className="h-20 w-full" style={{ background: `var(${entry.token})` }} />
      <div className="border-t px-3 py-2.5" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="text-mono-sm truncate font-mono" style={{ color: "var(--fg-primary)" }}>
          {entry.token}
        </div>
        <div className="text-mono-xs mt-1 truncate font-mono" style={{ color: "var(--fg-muted)" }}>
          {value || "—"}
        </div>
        <div className="text-mono-xs mt-1 font-mono" style={{ color: "var(--fg-muted)" }}>
          {entry.note}
        </div>
      </div>
    </div>
  )
}

function InkSwatch({
  entry,
  value,
  backdrop,
}: {
  entry: TokenEntry
  value: string
  backdrop: string[]
}) {
  const ink = parseRgb(value)
  const layers = backdrop.map(parseRgb).filter((c): c is Rgba => c !== null)
  const ratio = ink && layers.length > 0 ? contrastRatio(ink, flatten(layers)) : null
  const grade = ratio ? wcagGrade(ratio) : null

  return (
    <div
      className="rounded-[var(--radius-md)] border p-3"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div
        className="mb-2.5 flex h-12 items-center justify-center rounded-[var(--radius-sm)]"
        style={{
          // The real stack this ink sits on, so the sample is the actual pairing.
          background: entry.on?.[0] ? `var(${entry.on[0]})` : "var(--bg-card)",
        }}
      >
        <span
          className="text-heading-md"
          style={{ color: `var(${entry.token})`, fontFamily: "var(--font-serif)" }}
        >
          Aa
        </span>
      </div>
      <div className="text-mono-sm truncate font-mono" style={{ color: "var(--fg-primary)" }}>
        {entry.token}
      </div>
      <div className="text-mono-xs mt-1 truncate font-mono" style={{ color: "var(--fg-muted)" }}>
        {value || "—"}
      </div>
      {ratio && (
        <div className="text-mono-xs mt-1 font-mono">
          <span style={{ color: grade === "fail" ? "var(--status-error-fg)" : "var(--fg-muted)" }}>
            {ratio.toFixed(2)}:1 · {grade}
          </span>
        </div>
      )}
      <div className="text-mono-xs mt-1 font-mono" style={{ color: "var(--fg-muted)" }}>
        {entry.note}
      </div>
    </div>
  )
}

function LineSwatch({ entry, value }: { entry: TokenEntry; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-6 w-full" style={{ borderTop: `1px solid var(${entry.token})` }} />
      <div className="text-mono-sm truncate font-mono" style={{ color: "var(--fg-primary)" }}>
        {entry.token}
      </div>
      <div className="text-mono-xs truncate font-mono" style={{ color: "var(--fg-muted)" }}>
        {value || "—"}
      </div>
      <div className="text-mono-xs font-mono" style={{ color: "var(--fg-muted)" }}>
        {entry.note}
      </div>
    </div>
  )
}

/**
 * The type rows render with the real utility class they document, not an inline `fontSize`.
 * That is not only tidier: `lib/type-scale.test.ts` fails the build on arbitrary sizes, on
 * Tailwind's own steps, and on inline numeric `fontSize` above glyph size — so writing an 80px
 * sample the obvious way trips a test that already exists.
 */
const TYPE_CLASS: Record<string, string> = {
  "--text-display-xl": "text-display-xl",
  "--text-display-lg": "text-display-lg",
  "--text-display-md": "text-display-md",
  "--text-heading-lg": "text-heading-lg",
  "--text-heading-md": "text-heading-md",
  "--text-body-lg": "text-body-lg",
  "--text-body-md": "text-body-md",
  "--text-mono-md": "text-mono-md",
  "--text-mono-sm": "text-mono-sm",
  "--text-mono-xs": "text-mono-xs",
}

function ValueRow({ entry, value }: { entry: TokenEntry; value: string }) {
  const typeClass = TYPE_CLASS[entry.token]
  const serif = entry.token.startsWith("--text-display") || entry.token === "--text-heading-lg"

  return (
    <div
      className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t py-3"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <span
        className="text-mono-sm w-44 shrink-0 font-mono"
        style={{ color: "var(--fg-brand-on-tint)" }}
      >
        {entry.token}
      </span>
      <span className="text-mono-sm w-24 shrink-0 font-mono" style={{ color: "var(--fg-muted)" }}>
        {value || "—"}
      </span>
      {typeClass ? (
        <span
          className={`${typeClass} min-w-0 flex-1 truncate ${serif ? "font-serif" : "font-mono"}`}
          style={{ color: "var(--fg-primary)" }}
        >
          {entry.note}
        </span>
      ) : (
        <span
          className="text-mono-sm min-w-0 flex-1 font-mono"
          style={{ color: "var(--fg-secondary)" }}
        >
          {entry.note}
        </span>
      )}
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Group({ group, index }: { group: TokenGroup; index: number }) {
  const isColour = group.kind !== "value"
  const values = useTokenValues(group.entries.map((e) => e.token).join("|"), isColour)

  // Ink swatches need their backdrops resolved too, not just their own colour.
  const backdropValues = useTokenValues(
    Array.from(new Set(group.entries.flatMap((e) => e.on ?? []))).join("|"),
    true,
  )

  return (
    <section id={group.id} style={{ scrollMarginTop: 24 }} className="mt-12">
      <div
        className="mb-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b pb-2"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <h3 className="text-mono-sm m-0 font-mono tracking-[0.08em] uppercase">
          <span style={{ color: "var(--fg-brand)" }}>{String(index).padStart(2, "0")} / </span>
          <span style={{ color: "var(--fg-secondary)" }}>{group.label}</span>
        </h3>
        <span className="text-mono-xs font-mono" style={{ color: "var(--fg-muted)" }}>
          {group.entries.length} {group.entries.length === 1 ? "token" : "tokens"}
        </span>
      </div>

      {group.note && (
        <p className="text-mono-sm mt-3 mb-4 font-mono" style={{ color: "var(--fg-muted)" }}>
          {`// ${group.note}`}
        </p>
      )}

      {group.kind === "surface" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {group.entries.map((e) => (
            <SurfaceSwatch key={e.token} entry={e} value={values[e.token] ?? ""} />
          ))}
        </div>
      )}

      {group.kind === "ink" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {group.entries.map((e) => (
            <InkSwatch
              key={e.token}
              entry={e}
              value={values[e.token] ?? ""}
              backdrop={(e.on ?? []).map((t) => backdropValues[t] ?? "")}
            />
          ))}
        </div>
      )}

      {group.kind === "line" && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {group.entries.map((e) => (
            <LineSwatch key={e.token} entry={e} value={values[e.token] ?? ""} />
          ))}
        </div>
      )}

      {group.kind === "value" && (
        <div className="-mx-2 overflow-x-auto px-2">
          <div className="min-w-[520px]">
            {group.entries.map((e) => (
              <ValueRow key={e.token} entry={e} value={values[e.token] ?? ""} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export function TokensSection({ themeCount }: { themeCount: number }) {
  return (
    <div>
      <p className="text-body-md m-0 font-sans" style={{ color: "var(--fg-secondary)" }}>
        Every value below is read off this document as you are looking at it. Change the theme or
        the mode with the switcher in the corner and the swatches, the values and the contrast
        ratios all follow — nothing here is a screenshot or a number someone typed in.{" "}
        <span style={{ color: "var(--fg-muted)" }}>
          {themeCount} themes × 2 modes, {TOKEN_GROUPS.length} groups.
        </span>
      </p>

      {TOKEN_GROUPS.map((group, i) => (
        <Group key={group.id} group={group} index={i} />
      ))}
    </div>
  )
}

/**
 * The do's and don'ts, on their own tab. Every one is here because something shipped broken
 * first — they are lifted from the two sections in CLAUDE.md written for exactly this.
 */
export function RulesSection() {
  return (
    /* No top margin. It had `mt-12` from when this sat under the token groups in one long
       column; alone in its own tab panel that was 48px of nothing above the first heading,
       stacked on the panel's own `py-8`. The panel owns the spacing now. */
    <section id="tokens-rules" style={{ scrollMarginTop: 24 }}>
      <div
        className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b pb-2"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <h3 className="text-mono-sm m-0 font-mono tracking-[0.08em] uppercase">
          <span style={{ color: "var(--fg-brand)" }}>
            {String(TOKEN_GROUPS.length).padStart(2, "0")} /{" "}
          </span>
          <span style={{ color: "var(--fg-secondary)" }}>rules</span>
        </h3>
        <span className="text-mono-xs font-mono" style={{ color: "var(--fg-muted)" }}>
          each one paid for
        </span>
      </div>

      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {RULES.map((rule) => (
          <li
            key={rule.do}
            className="rounded-[var(--radius-md)] border p-3.5"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <div className="text-mono-sm flex gap-2 font-mono">
              <Diamond />
              <span style={{ color: "var(--fg-primary)" }}>{rule.do}</span>
            </div>
            <div
              className="text-mono-sm mt-1.5 pl-[18px] font-mono"
              style={{ color: "var(--fg-muted)" }}
            >
              {`// not: ${rule.dont}`}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
