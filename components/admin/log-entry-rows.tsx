"use client"

/**
 * The `<tbody>` of the log table, and the only client part of it.
 *
 * The table around this stays a Server Component — it keeps `<table>`, `<thead>` and the
 * `@phosphor-icons/react/dist/ssr` icons, which is the whole reason not to convert the file
 * wholesale. What has to be on the client is the optimistic list: a delete used to fire, toast,
 * and then sit there until `router.refresh()` came back from the server, at which point the row
 * vanished in one frame. Now it leaves the moment you confirm and comes back if the request
 * fails — see `useOptimisticRemoval` for why that is a set of ids rather than `useOptimistic`,
 * which reverted a beat too early and flashed the row back on every delete.
 *
 * **Rows fade, they do not slide.** CSS transforms do not apply to `display: table-row`, so
 * Motion's `layout` prop and any `x`/`y` on a `<tr>` are inert — animating a row's height is no
 * better. Opacity is the one property that behaves, so that is the whole vocabulary here. The
 * alternative was animating a wrapper inside every `<td>`, which animates the cells rather than
 * the row and looks exactly like that.
 */

import { useRouter } from "next/navigation"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { PencilSimpleIcon } from "@phosphor-icons/react"
import { toast } from "@/app/components/entrepta/toast"
import { useOptimisticRemoval } from "@/hooks/use-optimistic-removal"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { StarRating } from "@/components/log/star-rating"
import { EASE_OUT, revealViewport, STAGGER_LIMIT } from "@/components/ui/reveal"
import { formatLoggedAt } from "@/lib/log/date"
import { TYPE_LABEL, type LogEntry } from "@/lib/log/validation"

export function LogEntryRows({ entries }: { entries: LogEntry[] }) {
  const router = useRouter()
  const reduce = useReducedMotion() ?? false

  const { visible, hide, restore } = useOptimisticRemoval(entries)

  /** Hide first, then ask. Every failure path puts the row back explicitly — there is no
   *  transition boundary doing it for us, and that is the point. */
  async function remove(id: string, title: string) {
    hide(id)
    try {
      const res = await fetch(`/api/v1/admin/log/${id}`, { method: "DELETE" })
      if (!res.ok) {
        restore(id)
        toast(`could not delete (${res.status})`)
        return
      }
      toast(`deleted "${title}"`)
      router.refresh()
    } catch {
      restore(id)
      toast("network error — nothing was deleted")
    }
  }

  /**
   * The entrance lives on the row, not on the `<tbody>` orchestrating it through variants.
   *
   * It used to: `initial="hidden" whileInView="show"` on the tbody, rows as variant children.
   * That is the arrangement that left `PageOutline` with a rail of invisible links — a
   * container's `whileInView` with `once` is spent after it fires, so a child mounting later
   * resolves `hidden` and is never told to show. In a table that is a row at `opacity: 0`,
   * which reads as missing data rather than as a broken animation. Rare here (creating an entry
   * arrives by navigation, and a delete only ever removes rows) and reachable through an edit
   * that reorders, or a refresh picking up a row written elsewhere.
   *
   * Keying the tbody would have fixed it and broken something better: a new key on every
   * removal means `AnimatePresence` never sees the row leave, and the fade on delete — the
   * whole point of the optimistic list — would not play.
   *
   * The stagger moves onto the row's own transition, which the Cards and motion rules warn
   * about: a delay left on a transition is re-applied by every later interaction. Safe here
   * because a row has exactly two states and the other one, `exit`, carries its own.
   */
  const stagger = reduce || visible.length > STAGGER_LIMIT ? 0 : 0.04
  const enter = (index: number) => ({
    opacity: 1,
    transition: { duration: reduce ? 0 : 0.32, ease: EASE_OUT, delay: index * stagger },
  })
  const leave = { opacity: 0, transition: { duration: reduce ? 0 : 0.18, ease: EASE_OUT } }

  return (
    <tbody>
      {/* No `initial={false}`: the rows own their entrance now, so suppressing it on the first
          pass would mean the table never animates in at all. */}
      <AnimatePresence>
        {visible.map((entry, i) => (
          <motion.tr
            key={entry.id}
            initial={{ opacity: 0 }}
            whileInView={enter(i)}
            viewport={revealViewport}
            exit={leave}
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
    </tbody>
  )
}
