import Link from "next/link"
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr"
import { DeleteEntryDialog } from "@/components/admin/delete-entry-dialog"
import { StarRating } from "@/components/log/star-rating"
import { formatLoggedAt } from "@/lib/log/date"
import { TYPE_LABEL, type LogEntry } from "@/lib/log/validation"

const COLUMNS = ["type", "title", "rating", "logged", "status", ""]

/**
 * A real `<table>` with `<th scope="col">`, not a grid of divs, so screen readers can
 * navigate it. It scrolls sideways below roughly 700px rather than trying to reflow — a
 * six-column table has nowhere useful to go on a phone, and a scroll is honest about that.
 */
export function LogEntryTable({ entries }: { entries: LogEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-mono-md mt-12 text-center font-mono" style={{ color: "var(--fg-muted)" }}>
        {"// nothing logged yet."}
      </p>
    )
  }

  return (
    <div className="-mx-2 overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            {COLUMNS.map((h) => (
              <th
                key={h}
                scope="col"
                className="text-mono-xs px-2 py-2 font-mono tracking-[0.08em] whitespace-nowrap uppercase"
                style={{ color: "var(--fg-muted)" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <td className="px-2 py-3">
                <span
                  className="text-mono-xs inline-flex h-5 items-center rounded-[5px] px-2 font-mono uppercase"
                  style={{
                    background: "var(--bg-surface-brand)",
                    color: "var(--fg-brand-hover)",
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
                  <DeleteEntryDialog id={entry.id} title={entry.title} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
