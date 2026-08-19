"use client"

/**
 * The `<tbody>` of the log table, and the only client part of it.
 *
 * The table around this stays a Server Component — it keeps `<table>`, `<thead>` and the
 * `@phosphor-icons/react/dist/ssr` icons, which is the whole reason not to convert the file
 * wholesale. What has to be on the client is the optimistic list: a delete used to fire, toast,
 * and then sit there until `router.refresh()` came back from the server, at which point the row
 * vanished in one frame. Now it leaves the moment you confirm and comes back if the request
 * fails, which is what `useOptimistic` reverting on transition end does for free.
 *
 * **Rows fade, they do not slide.** CSS transforms do not apply to `display: table-row`, so
 * Motion's `layout` prop and any `x`/`y` on a `<tr>` are inert — animating a row's height is no
 * better. Opacity is the one property that behaves, so that is the whole vocabulary here. The
 * alternative was animating a wrapper inside every `<td>`, which animates the cells rather than
 * the row and looks exactly like that.
 */

import { useOptimistic, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react"
import { PencilSimpleIcon } from "@phosphor-icons/react"
import { toast } from "@/app/components/entrepta/toast"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { StarRating } from "@/components/log/star-rating"
import { EASE_OUT, revealViewport, STAGGER_LIMIT } from "@/components/ui/reveal"
import { formatLoggedAt } from "@/lib/log/date"
import { TYPE_LABEL, type LogEntry } from "@/lib/log/validation"

export function LogEntryRows({ entries }: { entries: LogEntry[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const reduce = useReducedMotion() ?? false

  const [optimistic, removeOptimistic] = useOptimistic(entries, (state, id: string) =>
    state.filter((e) => e.id !== id),
  )

  /**
   * The optimistic removal has to happen *inside* the transition, or React has nothing to
   * revert it against. On a failure we simply do not refresh: the transition ends, the
   * optimistic state is discarded, and the row reappears where it was.
   */
  function remove(id: string, title: string) {
    startTransition(async () => {
      removeOptimistic(id)
      try {
        const res = await fetch(`/api/v1/admin/log/${id}`, { method: "DELETE" })
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
        {optimistic.map((entry) => (
          <motion.tr
            key={entry.id}
            variants={row}
            exit="exit"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <td className="px-2 py-3">
              <span
                className="text-mono-xs inline-flex h-5 items-center rounded-[5px] px-2 font-mono uppercase"
                style={{
                  background: "var(--bg-surface-brand)",
                  color: "var(--fg-brand-on-tint)",
                }}
              >
                {TYPE_LABEL[entry.type]}
              </span>
            </td>

            <td className="max-w-70 min-w-40 px-2 py-3">
              <Link
                href={`/admin/log/${entry.id}`}
                className="text-mono-md block truncate font-mono hover:underline"
                style={{ color: "var(--fg-primary)" }}
              >
                {entry.title}
              </Link>
              {entry.creator && (
                <span
                  className="text-mono-sm block truncate font-mono"
                  style={{ color: "var(--fg-muted)" }}
                >
                  {entry.creator}
                </span>
              )}
            </td>

            <td className="px-2 py-3 whitespace-nowrap">
              <span className="flex items-center">
                {entry.rating == null ? (
                  <span style={{ color: "var(--fg-muted)" }}>—</span>
                ) : (
                  <StarRating rating={entry.rating} size={15} />
                )}
                {entry.favorite && (
                  <>
                    <span
                      aria-hidden
                      className="ml-1.5 leading-none"
                      style={{ color: "var(--fg-brand)", fontSize: 15 }}
                    >
                      ♥
                    </span>
                    <span className="sr-only">favorite</span>
                  </>
                )}
              </span>
            </td>

            <td
              className="text-mono-sm px-2 py-3 font-mono whitespace-nowrap"
              style={{ color: "var(--fg-muted)" }}
            >
              <time dateTime={entry.loggedAt}>{formatLoggedAt(entry.loggedAt)}</time>
            </td>

            <td className="text-mono-sm px-2 py-3 font-mono whitespace-nowrap">
              <span
                style={{
                  color: entry.published ? "var(--status-success-fg)" : "var(--fg-muted)",
                }}
              >
                {entry.published ? "published" : "draft"}
              </span>
            </td>

            <td className="px-2 py-3 text-right whitespace-nowrap">
              <div className="flex items-center justify-end gap-1">
                <Link
                  href={`/admin/log/${entry.id}`}
                  aria-label={`Edit ${entry.title}`}
                  title="Edit"
                  className="grid h-8 w-8 place-items-center rounded-md transition-colors hover:bg-(--bg-hover-soft)"
                  style={{ color: "var(--fg-muted)" }}
                >
                  <PencilSimpleIcon size={15} aria-hidden />
                </Link>
                <DeleteDialog
                  noun="entry"
                  title={entry.title}
                  onConfirm={() => remove(entry.id, entry.title)}
                />
              </div>
            </td>
          </motion.tr>
        ))}
      </AnimatePresence>
    </motion.tbody>
  )
}
