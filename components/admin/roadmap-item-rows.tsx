"use client"

/**
 * The `<tbody>` of the roadmap table. Same split and the same reasoning as
 * `log-entry-rows.tsx`: the table stays a Server Component with its `/dist/ssr` icons, and
 * only the rows go client, because only the rows need the optimistic list.
 *
 * Rows fade rather than slide — transforms do not apply to `display: table-row`.
 */

import { useOptimistic, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react"
import { PencilSimpleIcon } from "@phosphor-icons/react"
import { toast } from "@/app/components/entrepta/toast"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { EASE_OUT, revealViewport, STAGGER_LIMIT } from "@/components/ui/reveal"
import { STATUS_LABEL, type RoadmapItem, type RoadmapStatus } from "@/lib/roadmap/validation"

/** Muted for raw, brand for anything public, success for shipped. */
const STATUS_COLOR: Record<RoadmapStatus, string> = {
  raw: "var(--fg-muted)",
  todo: "var(--fg-secondary)",
  doing: "var(--fg-brand-hover)",
  done: "var(--status-success-fg)",
}

export function RoadmapItemRows({ items }: { items: RoadmapItem[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const reduce = useReducedMotion() ?? false

  const [optimistic, removeOptimistic] = useOptimistic(items, (state, id: string) =>
    state.filter((i) => i.id !== id),
  )

  function remove(id: string, title: string) {
    startTransition(async () => {
      removeOptimistic(id)
      try {
        const res = await fetch(`/api/v1/admin/roadmap/${id}`, { method: "DELETE" })
        if (!res.ok) {
          toast(`could not delete (${res.status})`)
          return
        }
        toast(`deleted "${title}"`)
        router.refresh()
      } catch {
        toast("network error — nothing was deleted")
      }
    })
  }

  const body: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce || optimistic.length > STAGGER_LIMIT ? 0 : 0.04 },
    },
  }

  const row: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: reduce ? 0 : 0.32, ease: EASE_OUT } },
    exit: { opacity: 0, transition: { duration: reduce ? 0 : 0.18, ease: EASE_OUT } },
  }

  return (
    <motion.tbody initial="hidden" whileInView="show" viewport={revealViewport} variants={body}>
      <AnimatePresence initial={false}>
        {optimistic.map((item) => (
          <motion.tr
            key={item.id}
            variants={row}
            exit="exit"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <td className="text-mono-sm px-2 py-3 font-mono whitespace-nowrap">
              <span style={{ color: STATUS_COLOR[item.status] }}>{STATUS_LABEL[item.status]}</span>
            </td>

            <td className="max-w-70 min-w-40 px-2 py-3">
              <Link
                href={`/admin/roadmap/${item.id}`}
                className="text-mono-md block truncate font-mono hover:underline"
                style={{ color: "var(--fg-primary)" }}
              >
                {item.title}
              </Link>
              {item.blurb && (
                <span
                  className="text-mono-sm block truncate font-mono"
                  style={{ color: "var(--fg-muted)" }}
                >
                  {item.blurb}
                </span>
              )}
            </td>

            <td
              className="text-mono-sm px-2 py-3 font-mono whitespace-nowrap"
              style={{ color: "var(--fg-muted)" }}
            >
              {item.position}
            </td>

            <td
              className="text-mono-sm max-w-50 px-2 py-3 font-mono"
              style={{ color: "var(--fg-muted)" }}
            >
              <span className="block truncate">{item.planUrl ?? "—"}</span>
            </td>

            <td
              className="text-mono-sm px-2 py-3 font-mono whitespace-nowrap"
              style={{ color: "var(--fg-muted)" }}
            >
              {item.shippedAt ? <time dateTime={item.shippedAt}>{item.shippedAt}</time> : "—"}
            </td>

            <td className="px-2 py-3 text-right whitespace-nowrap">
              <div className="flex items-center justify-end gap-1">
                <Link
                  href={`/admin/roadmap/${item.id}`}
                  aria-label={`Edit ${item.title}`}
                  title="Edit"
                  className="grid h-8 w-8 place-items-center rounded-md transition-colors hover:bg-(--bg-hover-soft)"
                  style={{ color: "var(--fg-muted)" }}
                >
                  <PencilSimpleIcon size={15} aria-hidden />
                </Link>
                <DeleteDialog
                  noun="item"
                  title={item.title}
                  onConfirm={() => remove(item.id, item.title)}
                />
              </div>
            </td>
          </motion.tr>
        ))}
      </AnimatePresence>
    </motion.tbody>
  )
}
