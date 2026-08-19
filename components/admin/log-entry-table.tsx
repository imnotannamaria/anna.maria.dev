import { LogEntryRows } from "@/components/admin/log-entry-rows"
import type { LogEntry } from "@/lib/log/validation"

const COLUMNS = ["type", "title", "rating", "logged", "status", ""]

/**
 * A real `<table>` with `<th scope="col">`, not a grid of divs, so screen readers can
 * navigate it. It scrolls sideways below roughly 700px rather than trying to reflow — a
 * six-column table has nowhere useful to go on a phone, and a scroll is honest about that.
 *
 * This half stays on the server, which is what keeps the `/dist/ssr` icon entry point and the
 * empty state out of the client bundle. Only `<tbody>` is a client component, because only the
 * rows need the optimistic list — see `log-entry-rows.tsx`.
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
        <LogEntryRows entries={entries} />
      </table>
    </div>
  )
}
