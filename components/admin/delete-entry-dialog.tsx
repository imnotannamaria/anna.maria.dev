"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
export function DeleteEntryDialog({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function confirm() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/v1/admin/log/${id}`, { method: "DELETE" })
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
        <Button variant="ghost" size="sm" aria-label={`Delete ${title}`}>
          delete
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this entry?</DialogTitle>
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
