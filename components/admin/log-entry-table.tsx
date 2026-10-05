import { Table, TableHead, TableHeader, TableRow } from "@/app/components/entrepta/table"
import { LogEntryRows } from "@/components/admin/log-entry-rows"
import type { LogEntry } from "@/lib/log/validation"

const COLUMNS = ["type", "title", "rating", "logged", "status", ""]

/**
 * entrepta's `Table`: a real `<table>` with `<th scope="col">`, not a grid of divs, so screen
 * readers can navigate it. It scrolls sideways inside its own box below roughly 700px rather
 * than trying to reflow — a six-column table has nowhere useful to go on a phone, and a scroll
 * is honest about that.
 *
 * The head and the frame used to be drawn here, and again in the roadmap's list. They are the
 * design system's now, so the two admin lists cannot drift apart.
 *
 * This half stays on the server, which is what keeps the empty state out of the client bundle.
 * Only the body is a client component, because only the rows need the optimistic list — see
 * `log-entry-rows.tsx`.
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
    <Table>
      <TableHeader>
        <TableRow>
          {COLUMNS.map((h) => (
            // The last column holds the edit and delete buttons. It has no visible heading,
            // and a header cell with nothing in it is a column a screen reader cannot name.
            <TableHead key={h}>{h || <span className="sr-only">actions</span>}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <LogEntryRows entries={entries} />
    </Table>
  )
}
