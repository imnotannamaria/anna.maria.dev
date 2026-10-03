import { Table, TableHead, TableHeader, TableRow } from "@/app/components/entrepta/table"
import { RoadmapItemRows } from "@/components/admin/roadmap-item-rows"
import type { RoadmapItem } from "@/lib/roadmap/validation"

const COLUMNS = ["status", "title", "pos", "plan", "shipped", ""]

/**
 * entrepta's `Table`, matching the log's admin list. It scrolls sideways in its own box on a
 * phone rather than reflowing — six columns have nowhere useful to go.
 *
 * Server half: the table, its head and the empty state. Only the body is a client component —
 * see `roadmap-item-rows.tsx`.
 */
export function RoadmapItemTable({ items }: { items: RoadmapItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-mono-md mt-12 text-center font-mono" style={{ color: "var(--fg-muted)" }}>
        {"// nothing captured yet."}
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
      <RoadmapItemRows items={items} />
    </Table>
  )
}
