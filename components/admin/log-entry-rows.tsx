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

import Link from "next/link"
import { AnimatePresence } from "motion/react"
import { PencilSimpleIcon } from "@phosphor-icons/react"
import { TableBody, TableCell } from "@/app/components/entrepta/table"
import { useAdminRows } from "./use-admin-rows"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { Tip } from "@/components/ui/tip"
import { MotionTableRow } from "@/components/admin/motion-table-row"
import { StarRating } from "@/components/log/star-rating"
import { revealViewport } from "@/lib/motion"
import { formatLoggedAt } from "@/lib/log/date"
import { TYPE_LABEL } from "@/lib/log/constants"
import type { LogEntry } from "@/lib/log/validation"

export function LogEntryRows({ entries }: { entries: LogEntry[] }) {
  const { visible, remove, enter, leave } = useAdminRows(entries, "/api/v1/admin/log")

  return (
    <TableBody>
      {/* No `initial={false}`: the rows own their entrance now, so suppressing it on the first
          pass would mean the table never animates in at all. */}
      <AnimatePresence>
        {visible.map((entry, i) => (
          <MotionTableRow
            key={entry.id}
            initial={{ opacity: 0 }}
            whileInView={enter(i)}
            viewport={revealViewport}
            exit={leave}
          >
            <TableCell>
              <span
                className="text-mono-xs inline-flex h-5 items-center rounded-[5px] px-2 font-mono uppercase"
                style={{
                  background: "var(--bg-surface-brand)",
                  color: "var(--fg-brand-text)",
                }}
              >
                {TYPE_LABEL[entry.type]}
              </span>
            </TableCell>

            <TableCell className="max-w-70 min-w-40 py-2.5">
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
              {/* A note with no Portuguese is the one thing /pt shows in the wrong language: a
                  title is often a name and fine as it is, a sentence is not. */}
              {entry.note && !entry.notePt && (
                <span className="text-mono-xs block font-mono" style={{ color: "var(--fg-muted)" }}>
                  note not translated
                </span>
              )}
            </TableCell>

            <TableCell>
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
            </TableCell>

            <TableCell className="text-[var(--fg-muted)]">
              <time dateTime={entry.loggedAt}>{formatLoggedAt(entry.loggedAt)}</time>
            </TableCell>

            <TableCell>
              <span
                style={{
                  color: entry.published ? "var(--status-success-fg)" : "var(--fg-muted)",
                }}
              >
                {entry.published ? "published" : "draft"}
              </span>
            </TableCell>

            <TableCell align="end">
              <div className="flex items-center justify-end gap-1">
                <Tip label="Edit">
                  <Link
                    href={`/admin/log/${entry.id}`}
                    aria-label={`Edit ${entry.title}`}
                    className="grid h-8 w-8 place-items-center rounded-md transition-colors hover:bg-(--bg-hover-soft)"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    <PencilSimpleIcon size={15} aria-hidden />
                  </Link>
                </Tip>
                <DeleteDialog
                  noun="entry"
                  title={entry.title}
                  onConfirm={() => remove(entry.id, entry.title)}
                />
              </div>
            </TableCell>
          </MotionTableRow>
        ))}
      </AnimatePresence>
    </TableBody>
  )
}
