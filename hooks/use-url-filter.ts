"use client"

import * as React from "react"

/** Namespaced per param, so two filters on one page never wake each other. */
const eventName = (param: string) => `urlfilter:${param}`

/** Nothing is filtered in the server render, which keeps every item in the HTML. */
function serverSnapshot(): null {
  return null
}

/**
 * A filter kept in the URL query, such as `?type=film`.
 *
 * `useSyncExternalStore` instead of a router's search params hook: in a
 * statically rendered page those suspend during prerender, so the filtered
 * items would be missing from the HTML. The cost is one frame of the full list
 * when a filtered URL is opened directly.
 *
 * Writing uses `pushState`, so the back button undoes a filter, and it keeps
 * every other param already in the URL. Pass `{ replace: true }` for a value
 * that changes often, such as a form of options: every change replacing the
 * entry keeps the back button, and a trackpad's swipe back, from walking
 * through each click.
 *
 * @param param   the query param, such as `"type"`
 * @param allowed the values it may take; anything else reads as no filter
 * @param path    the path to write to. Defaults to the current path
 * @param options `replace` writes with replaceState instead of pushState
 */
function useUrlFilter<T extends string>(
  param: string,
  allowed: readonly T[],
  path?: string,
  options: { replace?: boolean } = {},
): [T | null, (next: T | null) => void] {
  const replace = options.replace ?? false
  const event = eventName(param)

  const subscribe = React.useCallback(
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

  const read = React.useCallback((): T | null => {
    const value = new URLSearchParams(window.location.search).get(param)
    return value && (allowed as readonly string[]).includes(value) ? (value as T) : null
  }, [param, allowed])

  const active = React.useSyncExternalStore(subscribe, read, serverSnapshot)

  const write = React.useCallback(
    (next: T | null) => {
      const params = new URLSearchParams(window.location.search)
      if (next) params.set(param, next)
      else params.delete(param)
      const query = params.toString()
      const base = path ?? window.location.pathname
      const url = query ? `${base}?${query}` : base
      if (replace) window.history.replaceState(null, "", url)
      else window.history.pushState(null, "", url)
      window.dispatchEvent(new Event(event))
    },
    [path, param, event, replace],
  )

  return [active, write]
}

export { useUrlFilter }
