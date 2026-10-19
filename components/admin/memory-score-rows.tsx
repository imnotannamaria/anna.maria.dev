"use client"

/**
 * The body of the memory game's admin list. A name is approved or rejected right on its row,
 * since there is nothing more to read than the name itself; a delete leaves at once and comes
 * back if the request fails, like the other admin lists.
 */

import { CheckIcon, XIcon } from "@phosphor-icons/react"
import { AnimatePresence } from "motion/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Badge, type BadgeProps } from "@/app/components/entrepta/badge"
import { Button } from "@/app/components/entrepta/button"
import { TableBody, TableCell } from "@/app/components/entrepta/table"
import { toast } from "@/app/components/entrepta/toast"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { MotionTableRow } from "@/components/admin/motion-table-row"
import { playSoundEffect } from "@/components/ui/sound-feedback"
import { useAdminRows } from "./use-admin-rows"
import { formatMs, MIN_MS, type MemoryStatus } from "@/lib/memory/constants"
import { revealViewport } from "@/lib/motion"

type Row = { id: string; name: string; ms: number; moves: number; status: MemoryStatus }

const BADGE: Partial<Record<MemoryStatus, { color: BadgeProps["color"]; label: string }>> = {
  submitted: { color: "brand", label: "to review" },
  approved: { color: "success", label: "on the board" },
  rejected: { color: "error", label: "rejected" },
}

export function MemoryScoreRows({ rows }: { rows: Row[] }) {
  const router = useRouter()
  const { visible, remove, enter, leave } = useAdminRows(rows, "/api/v1/admin/memory")
  const [busy, setBusy] = useState<string | null>(null)

  async function decide(id: string, status: "approved" | "rejected") {
    setBusy(id)
    try {
      const res = await fetch(`/api/v1/admin/memory/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        toast(`request failed (${res.status})`)
        playSoundEffect("error")
        return
      }
      toast(status === "approved" ? "on the board" : "rejected")
      playSoundEffect("success")
      router.refresh()
    } catch {
      toast("network error — nothing changed")
      playSoundEffect("error")
    } finally {
      setBusy(null)
    }
  }

  return (
    <TableBody>
      <AnimatePresence>
        {visible.map((row, i) => {
          const badge = BADGE[row.status]
          // a time this close to the floor is worth a second look before it goes up
          const suspicious = row.ms < MIN_MS * 2
          return (
            <MotionTableRow
              key={row.id}
              initial={{ opacity: 0 }}
              whileInView={enter(i)}
              viewport={revealViewport}
              exit={leave}
            >
              <TableCell>
                {badge ? (
                  <Badge dot color={badge.color}>
                    {badge.label}
                  </Badge>
                ) : null}
              </TableCell>
              <TableCell className="text-mono-md max-w-60 truncate font-mono text-[var(--fg-primary)]">
                {row.name}
              </TableCell>
              <TableCell className="whitespace-nowrap text-[var(--fg-secondary)] tabular-nums">
                {formatMs(row.ms)}
                {suspicious ? <span className="text-[var(--fg-muted)]"> · very fast</span> : null}
              </TableCell>
              <TableCell className="text-[var(--fg-secondary)] tabular-nums">{row.moves}</TableCell>
              <TableCell align="end">
                <div className="flex items-center justify-end gap-2">
                  {row.status !== "approved" ? (
                    <Button
                      type="button"
                      size="sm"
                      loading={busy === row.id}
                      onClick={() => decide(row.id, "approved")}
                    >
                      <CheckIcon aria-hidden size={14} weight="bold" />
                      approve
                    </Button>
                  ) : null}
                  {row.status !== "rejected" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={busy === row.id}
                      onClick={() => decide(row.id, "rejected")}
                    >
                      <XIcon aria-hidden size={14} weight="bold" />
                      {row.status === "approved" ? "take down" : "reject"}
                    </Button>
                  ) : null}
                  <DeleteDialog
                    noun="score"
                    title={row.name}
                    onConfirm={() => remove(row.id, row.name)}
                  />
                </div>
              </TableCell>
            </MotionTableRow>
          )
        })}
      </AnimatePresence>
    </TableBody>
  )
}
