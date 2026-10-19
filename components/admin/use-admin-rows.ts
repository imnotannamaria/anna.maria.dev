"use client"

import { useReducedMotion } from "motion/react"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import { toast } from "@/app/components/entrepta/toast"
import { playSoundEffect } from "@/components/ui/sound-feedback"
import { useOptimisticRemoval } from "@/hooks/use-optimistic-removal"
import { EASE_OUT, STAGGER_LIMIT } from "@/lib/motion"

/** Shared deletion policy and row fades. Each table still owns its columns and decisions. */
export function useAdminRows<T extends { id: string }>(rows: T[], endpoint: string) {
  const router = useRouter()
  const reduce = useReducedMotion() ?? false
  const { visible, hide, restore } = useOptimisticRemoval(rows)
  const pending = useRef(new Set<string>())

  async function remove(id: string, name: string) {
    if (pending.current.has(id)) return
    pending.current.add(id)
    hide(id)
    try {
      const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" })
      if (!res.ok) {
        restore(id)
        toast(`could not delete (${res.status})`)
        playSoundEffect("error")
        return
      }
      toast(`deleted ${name}`)
      playSoundEffect("success")
      router.refresh()
    } catch {
      restore(id)
      toast("network error — nothing was deleted")
      playSoundEffect("error")
    } finally {
      pending.current.delete(id)
    }
  }

  // Each row owns its entrance, so a later row also appears after the table was observed.
  // Exit has its own transition: the entrance delay must not delay a deletion.
  const stagger = reduce || visible.length > STAGGER_LIMIT ? 0 : 0.04
  const enter = (index: number) => ({
    opacity: 1,
    transition: { duration: reduce ? 0 : 0.32, ease: EASE_OUT, delay: index * stagger },
  })
  const leave = { opacity: 0, transition: { duration: reduce ? 0 : 0.18, ease: EASE_OUT } }
  return { visible, remove, enter, leave }
}
