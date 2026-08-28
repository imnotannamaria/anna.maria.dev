"use client"

/**
 * A filter that lives in the URL, and the pill that sets it.
 *
 * /log and /roadmap had a line-for-line copy of this each, differing only in the query
 * param and the path. Two copies means the reasoning below has to be re-derived, and the
 * next fix has to be applied twice.
 *
 * `useSyncExternalStore` rather than `useSearchParams`: in a statically rendered route the
 * latter makes the nearest Suspense boundary emit its fallback during prerender, so every
 * card would be missing from the HTML — and the cards are the whole page for a crawler.
 *
 * The server snapshot is always null, so the first paint shows everything and the filter
 * applies right after hydration. Someone opening /log?type=film directly sees one frame of
 * the full list. That is a fair trade for server-rendered content.
 */

import { useCallback, useSyncExternalStore } from "react"
import type { Icon } from "@phosphor-icons/react"

/** Namespaced per param, so two filters on one page never wake each other up. */
const eventName = (param: string) => `urlfilter:${param}`

/** Nothing is filtered during the server render, which is what puts every card in the HTML. */
function serverSnapshot(): null {
  return null
}

export function useUrlFilter<T extends string>(
  param: string,
  allowed: readonly T[],
  basePath: string,
): [T | null, (next: T | null) => void] {
  const event = eventName(param)

  const subscribe = useCallback(
    (onChange: () => void) => {
      window.addEventListener("popstate", onChange)
      window.addEventListener(event, onChange)
      return () => {
        window.removeEventListener("popstate", onChange)
        window.removeEventListener(event, onChange)
      }
    },
    [event],
  )

  const read = useCallback((): T | null => {
    const value = new URLSearchParams(window.location.search).get(param)
    return value && (allowed as readonly string[]).includes(value) ? (value as T) : null
  }, [param, allowed])

  const active = useSyncExternalStore(subscribe, read, serverSnapshot)

  /**
   * pushState rather than replaceState, so the back button undoes a filter.
   *
   * Built from the params already in the URL rather than from `param` alone. This used to write
   * `${basePath}?${param}=${next}`, which threw away every other query param — fine while each
   * page had exactly one filter, and silently wrong the moment one has two. `/components` has
   * the view tab and the group filter side by side, and switching tabs would have dropped the
   * filter without anything appearing to go wrong.
   */
  const write = useCallback(
    (next: T | null) => {
      const params = new URLSearchParams(window.location.search)
      if (next) params.set(param, next)
      else params.delete(param)
      const query = params.toString()
      window.history.pushState(null, "", query ? `${basePath}?${query}` : basePath)
      window.dispatchEvent(new Event(event))
    },
    [basePath, param, event],
  )

  return [active, write]
}

export function FilterPill({
  label,
  count,
  active,
  onClick,
  icon: PillIcon,
}: {
  label: string
  /** Omitted where there is nothing to tally — the showcase's state pills, for one. */
  count?: number
  active: boolean
  onClick: () => void
  /**
   * Optional, and optional on purpose. /blog and /projects filter by tag and /log by type —
   * open sets with no fixed icon between them, and inventing one per tag would be noise. The
   * showcase filters by a closed set of three pages that already have icons in the nav, so
   * there it is the same glyph the sidebar uses for the same place.
   */
  icon?: Icon
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="text-mono-sm inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-3 font-mono whitespace-nowrap transition-all duration-120 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
      style={
        active
          ? {
              borderColor: "var(--fg-brand)",
              // The border can stay --fg-brand; the label cannot. Brand ink on the brand
              // tint is 4.43:1 at 12px in the default theme, and worse in five others —
              // eight of the twelve theme×mode combinations fail. See --fg-brand-on-tint
              // in globals.css for the measured table.
              color: "var(--fg-brand-on-tint)",
              background: "var(--bg-surface-brand)",
            }
          : {
              borderColor: "var(--border-subtle)",
              color: "var(--fg-muted)",
              background: "transparent",
            }
      }
    >
      {PillIcon && (
        <PillIcon
          size={12}
          weight={active ? "fill" : "regular"}
          aria-hidden
          className="shrink-0"
          // A filled glyph covers more area than the text beside it, so it reads louder at the
          // same colour. Dropping its contrast is the counterweight.
          style={{ color: active ? "currentColor" : "var(--fg-muted)" }}
        />
      )}
      {label}
      {/* Not dimmed. It carried `opacity: 0.55`, which put it at 2.2–3.0:1 in every theme,
          in both states — the count is information, not decoration, so it has to be as
          legible as the label beside it. The gap is what separates them. */}
      {count != null && (
        <span
          className="rounded-full px-1.5 tabular-nums"
          style={{
            // The count gets its own chip so the pill reads as "label · how many" rather than
            // as two words that happen to be adjacent.
            background: active ? "var(--bg-hover-strong)" : "var(--bg-surface-elevated)",
          }}
        >
          {count}
        </span>
      )}
    </button>
  )
}
