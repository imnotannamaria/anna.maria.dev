"use client"

import { useCallback, useSyncExternalStore } from "react"

/**
 * A media query as React state.
 *
 * It exists because CSS can hide a component but cannot stop React from mounting it, and a
 * mounted component is what makes `next/dynamic` fetch its chunk. `/about` hid the stack
 * graph below `md` with `hidden md:block` and phones downloaded 180 KB of React Flow to
 * paint nothing. Hiding pixels is not the same as not building the thing.
 *
 * `useSyncExternalStore` rather than `useState` + an effect, for the same reason
 * `components/ui/url-filter.tsx` uses it: the server snapshot is explicit — always `false`
 * here, so nothing that depends on a viewport is claimed during SSR — and the subscription
 * is torn down with the component instead of racing a second render.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    },
    [query],
  )

  const read = useCallback(() => window.matchMedia(query).matches, [query])

  return useSyncExternalStore(subscribe, read, () => false)
}
