"use client"

/**
 * The body of the wall's admin list. Same split and the same optimistic delete as
 * `log-entry-rows.tsx`: the row leaves the moment the dialog is confirmed and comes back if
 * the request fails. Rows fade, because a table row does not take transforms.
 */

import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, useReducedMotion } from "motion/react"
import { PencilSimpleIcon } from "@phosphor-icons/react"
import { TableBody, TableCell } from "@/app/components/entrepta/table"
import { toast } from "@/app/components/entrepta/toast"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { MotionTableRow } from "@/components/admin/motion-table-row"
import { Tip } from "@/components/ui/tip"
import { useOptimisticRemoval } from "@/hooks/use-optimistic-removal"
import { EASE_OUT, revealViewport, STAGGER_LIMIT } from "@/lib/motion"
import type { WallLang } from "@/lib/wall/constants"
import type { StatusKey } from "@/lib/wall/describe"
import { playSoundEffect } from "@/components/ui/sound-feedback"
import { LangTag } from "@/components/wall/flag"
import { WallStatusBadge } from "./wall-status-badge"

export interface WallRow {
  id: string
  name: string
  company: string
  lang: WallLang
  status: StatusKey
  /** The counts above zero, as text: "🫶 3  👏 1". Empty when there are none. */
  reactions: string
  /** Formatted on the server. */
  when: string
}

export function WallEntryRows({ rows }: { rows: WallRow[] }) {
  const router = useRouter()
  const reduce = useReducedMotion() ?? false
  const { visible, hide, restore } = useOptimisticRemoval(rows)

  async function remove(id: string, name: string) {
    hide(id)
    try {
      const res = await fetch(`/api/v1/admin/wall/${id}`, { method: "DELETE" })
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
    }
  }

  // The same entrance as the other two admin lists, and the same reason it lives on the row.
  const stagger = reduce || visible.length > STAGGER_LIMIT ? 0 : 0.04
  const enter = (index: number) => ({
    opacity: 1,
    transition: { duration: reduce ? 0 : 0.32, ease: EASE_OUT, delay: index * stagger },
  })
  const leave = { opacity: 0, transition: { duration: reduce ? 0 : 0.18, ease: EASE_OUT } }

  return (
    <TableBody>
      <AnimatePresence>
        {visible.map((row, i) => (
          <MotionTableRow
            key={row.id}
            initial={{ opacity: 0 }}
            whileInView={enter(i)}
            viewport={revealViewport}
            exit={leave}
          >
            <TableCell>
              <WallStatusBadge status={row.status} />
            </TableCell>

            <TableCell className="max-w-70 min-w-40 py-2.5">
              <Link
                href={`/admin/wall/${row.id}`}
                className="text-mono-md block truncate font-mono text-[var(--fg-primary)] hover:underline"
              >
                {row.name}
              </Link>
              <span className="text-mono-sm block truncate font-mono text-[var(--fg-muted)]">
                {row.company}
              </span>
            </TableCell>

            <TableCell className="text-[var(--fg-muted)]">
              <LangTag lang={row.lang} />
            </TableCell>

            <TableCell className="whitespace-nowrap text-[var(--fg-secondary)] tabular-nums">
              {row.reactions || <span className="text-[var(--fg-muted)]">none</span>}
            </TableCell>

            <TableCell className="text-[var(--fg-muted)]">{row.when}</TableCell>

            <TableCell align="end">
              <div className="flex items-center justify-end gap-1">
                <Tip label="Open">
                  <Link
                    href={`/admin/wall/${row.id}`}
                    aria-label={`Open ${row.name}`}
                    className="grid h-8 w-8 place-items-center rounded-md text-[var(--fg-muted)] transition-colors hover:bg-(--bg-hover-soft)"
                  >
                    <PencilSimpleIcon size={15} aria-hidden />
                  </Link>
                </Tip>
                <DeleteDialog
                  noun="testimonial"
                  title={row.name}
                  onConfirm={() => remove(row.id, row.name)}
                />
              </div>
            </TableCell>
          </MotionTableRow>
        ))}
      </AnimatePresence>
    </TableBody>
  )
}
