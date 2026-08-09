"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogLabel,
  DialogTitle,
} from "@/app/components/entrepta/dialog"
import { groupByStatus } from "@/lib/roadmap/counts"
import { STATUS_LABEL, type PublicStatus, type RoadmapItem } from "@/lib/roadmap/validation"
import { RoadmapItemCard } from "./roadmap-card"
import { RoadmapProgressCard } from "./roadmap-progress"

/** In progress first here, not on the board: a dialog is read top-down, not scanned. */
const ORDER: PublicStatus[] = ["doing", "todo", "done"]

/**
 * Held for the rest of the session. The sidebar is in the root layout, so this component
 * mounts on every page — refetching the same handful of rows each time someone reopens the
 * panel would be traffic for nothing.
 */
let cachedItems: RoadmapItem[] | null = null

async function loadItems(): Promise<RoadmapItem[]> {
  if (cachedItems) return cachedItems
  const res = await fetch("/api/v1/roadmap")
  if (!res.ok) throw new Error(`roadmap request failed (${res.status})`)
  const body = (await res.json()) as { items: RoadmapItem[] }
  cachedItems = body.items
  return cachedItems
}

/**
 * The tab that gives the sidebar something to hold.
 *
 * It fetches on open rather than on render, and that is the whole reason the public
 * `/api/v1/roadmap` route exists: reading Postgres from the layout would drag every page
 * on the site into force-dynamic to serve a panel most visitors never open.
 */
export function RoadmapTab() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="rm-tab mt-auto mb-1 self-end"
      >
        <span aria-hidden className="rm-tab-diamond">
          ◆
        </span>
        Roadmap
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[86vh] w-[calc(100vw-24px)] max-w-[880px] flex-col !gap-0 overflow-hidden !p-0">
          <RoadmapDialogBody open={open} onNavigate={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}

function RoadmapDialogBody({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const reduce = useReducedMotion() ?? false
  const [items, setItems] = useState<RoadmapItem[] | null>(cachedItems)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!open || items) return
    let alive = true
    loadItems()
      .then((rows) => alive && setItems(rows))
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [open, items])

  const groups = items ? groupByStatus(items) : null

  return (
    <>
      <div
        className="flex flex-col gap-2 border-b px-6 pt-6 pb-5"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <DialogHeader className="gap-1.5">
          <DialogLabel>roadmap</DialogLabel>
          <DialogTitle>
            What&apos;s <em>next</em>
          </DialogTitle>
          <DialogDescription>
            Loose ideas for this site. Nothing here has a date and not all of it will get built — an
            item is a thought I had, not a promise.
          </DialogDescription>
        </DialogHeader>
      </div>

      {/* `animate`, not `whileInView`: this mounts with the modal, it does not scroll into
          view — an observer is the wrong question here. */}
      <motion.div
        className="flex flex-col gap-7 overflow-y-auto px-6 py-6"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.04 } } }}
      >
        {failed && (
          <p className="m-0 font-mono text-[13px]" style={{ color: "var(--status-error-fg)" }}>
            {"// couldn't load the roadmap. it's the database, not you."}
          </p>
        )}

        {!failed && !groups && <DialogSkeleton />}

        {groups && items && (
          <>
            <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}>
              <RoadmapProgressCard items={items} animateIn={false} />
            </motion.div>

            {ORDER.map((status) => {
              const list = groups[status]
              if (list.length === 0) return null

              return (
                <motion.section layout key={status} className="flex flex-col gap-3">
                  <motion.div
                    layout
                    className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.08em] uppercase"
                    style={{ color: "var(--fg-secondary)" }}
                  >
                    <span
                      className="rm-dot"
                      aria-hidden
                      data-live={status === "doing"}
                      data-muted={status === "done"}
                    />
                    <h4 className="m-0 text-[11px] font-normal tracking-[0.08em] uppercase">
                      {STATUS_LABEL[status]}
                    </h4>
                    <span
                      className="h-px flex-1"
                      style={{ background: "var(--border-subtle)" }}
                      aria-hidden
                    />
                    <span style={{ color: "var(--fg-muted)" }}>{list.length}</span>
                  </motion.div>

                  {/* Two per row is what makes this read as bento rather than as a block
                      of text. */}
                  <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 py-1 sm:grid-cols-2">
                    {list.map((item, i) => (
                      <RoadmapItemCard key={item.id} surface="rm-dialog" item={item} index={i} />
                    ))}
                  </ul>
                </motion.section>
              )
            })}
          </>
        )}
      </motion.div>

      <div
        className="flex items-center justify-between border-t px-6 py-3.5"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <span className="font-mono text-[11px]" style={{ color: "var(--fg-muted)" }}>
          <span style={{ opacity: 0.6 }}>{"// "}</span>
          an idea that grows up becomes a plan in docs/
        </span>
        <Link
          href="/roadmap"
          onClick={onNavigate}
          className="group inline-flex items-center gap-1.5 font-mono text-[11px] no-underline"
          style={{ color: "var(--fg-brand)" }}
        >
          open the board
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </>
  )
}

/** Card-shaped, so nothing jumps when the rows land. */
function DialogSkeleton() {
  return (
    <>
      <div aria-hidden className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="bento-card rm-item" style={{ minHeight: 150 }}>
            <div className="flex flex-col gap-3">
              <span className="h-2.5 w-24 rounded bg-(--bg-surface-elevated)" />
              <span className="h-5 w-3/4 rounded bg-(--bg-surface-elevated)" />
              <span className="h-3 w-full rounded bg-(--bg-surface-elevated)" />
              <span className="h-3 w-2/3 rounded bg-(--bg-surface-elevated)" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only" role="status">
        Loading the roadmap
      </span>
    </>
  )
}
