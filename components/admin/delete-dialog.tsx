"use client"

import { useState } from "react"
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

/**
 * The confirmation in front of every admin delete. Radix handles focus trapping, Escape and
 * returning focus to the trigger.
 *
 * There were two of these — `delete-entry-dialog` and `delete-roadmap-item-dialog` — whose diff
 * was the word "entry" versus "item" and the URL they posted to. They were folded together when
 * the same change had to be applied to both at once, which is the signal the rule in CLAUDE.md
 * describes: the second copy is a warning.
 *
 * It confirms and nothing else. Each list owns its own request now, because the row has to
 * disappear optimistically and only the thing holding the list can do that. Which also means
 * there is no pending state to show here: by the time this closes the row is already gone, and
 * if the request fails it comes back with a toast saying so.
 */
export function DeleteDialog({
  title,
  noun,
  onConfirm,
}: {
  title: string
  /** What is being deleted, for the heading: "entry", "item". */
  noun: string
  onConfirm: () => void
}) {
  const [open, setOpen] = useState(false)

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
          <DialogTitle>{`Delete this ${noun}?`}</DialogTitle>
          <DialogDescription>
            {`"${title}" will be removed for good. There is no undo.`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            cancel
          </Button>
          <Button
            onClick={() => {
              setOpen(false)
              onConfirm()
            }}
          >
            delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
