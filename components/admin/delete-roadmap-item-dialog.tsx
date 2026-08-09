"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { TrashIcon } from "@phosphor-icons/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/entrepta/dialog"
import { Button } from "@/app/components/entrepta/button"
import { toast } from "@/app/components/entrepta/toast"

/** Radix handles focus trapping, Escape and returning focus to the trigger. */
export function DeleteRoadmapItemDialog({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function confirm() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/v1/admin/roadmap/${id}`, { method: "DELETE" })
      if (!res.ok) {
        toast(`could not delete (${res.status})`)
        return
      }
      toast(`deleted "${title}"`)
      setOpen(false)
      router.refresh()
    } catch {
      toast("network error — nothing was deleted")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`Delete ${title}`}
          title="Delete"
          className="grid h-8 w-8 cursor-pointer place-items-center rounded-md transition-colors hover:bg-(--bg-hover-soft) hover:text-(--status-error-fg)"
          style={{ color: "var(--fg-muted)" }}
        >
          <TrashIcon size={15} aria-hidden />
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this item?</DialogTitle>
          <DialogDescription>
            {`"${title}" will be removed for good. There is no undo.`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={deleting}>
            cancel
          </Button>
          <Button onClick={confirm} disabled={deleting}>
            {deleting ? "deleting…" : "delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
