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

  /** pushState rather than replaceState, so the back button undoes a filter. */
  const write = useCallback(
    (next: T | null) => {
      window.history.pushState(null, "", next ? `${basePath}?${param}=${next}` : basePath)
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
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-3 font-mono text-xs whitespace-nowrap transition-all duration-120 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
      style={
        active
          ? {
              borderColor: "var(--fg-brand)",
              color: "var(--fg-brand)",
              background: "var(--bg-surface-brand)",
            }
          : {
              borderColor: "var(--border-subtle)",
              color: "var(--fg-muted)",
              background: "transparent",
            }
      }
    >
      {label}
      <span style={{ opacity: 0.55 }}>{count}</span>
    </button>
  )
}
