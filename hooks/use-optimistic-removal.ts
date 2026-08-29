"use client"

import { useCallback, useState } from "react"

/**
 * Rows that leave the moment you confirm and stay gone until the server catches up.
 *
 * This was `useOptimistic` in both admin tables, and it had a bug the header comments claimed
 * it had fixed. `useOptimistic` discards its override when the transition that applied it
 * settles — and `router.refresh()` returns void and schedules its own separate transition, so
 * the outer one always finished first. The row reappeared for the length of the RSC round trip
 * and then vanished again: a flash on every delete, which is exactly the behaviour the
 * refactor was meant to remove.
 *
 * A set of ids the caller filters by has no such window. It survives until the server render
 * arrives without the row, which is the actual event being waited on. On a failure the caller
 * puts the id back and the row returns immediately, which is what a revert should feel like.
 *
 * Ids for rows the server has already dropped simply stay in the set, inert — the alternative
 * is an effect pruning them against every render's props, and a handful of strings per session
 * is not worth an effect that can loop.
 */
export function useOptimisticRemoval<T extends { id: string }>(items: T[]) {
  const [removed, setRemoved] = useState<ReadonlySet<string>>(() => new Set())

  const hide = useCallback((id: string) => {
    setRemoved((current) => new Set(current).add(id))
  }, [])

  /** Puts a row back — the request failed, so nothing was deleted. */
  const restore = useCallback((id: string) => {
    setRemoved((current) => {
      const next = new Set(current)
      next.delete(id)
      return next
    })
  }, [])

  return { visible: items.filter((item) => !removed.has(item.id)), hide, restore }
}
