import { Table, TableHead, TableHeader, TableRow } from "@/app/components/entrepta/table"
import { WALL_REACTIONS } from "@/lib/wall/constants"
import { statusOf, whenOf } from "@/lib/wall/describe"
import type { WallEntry } from "@/lib/wall/validation"
import { WallEntryRows, type WallRow } from "./wall-entry-rows"

const COLUMNS = ["status", "who", "language", "reactions", "when", ""]

/**
 * Every invite and testimonial, newest first, in entrepta's `Table` like the log and the
 * roadmap lists. The server half: the head, the empty state, and the dates, formatted here in
 * São Paulo so the client rows never format one themselves. The body is client code because
 * a delete leaves at once and comes back if the request fails.
 */
export function WallEntryTable({ entries }: { entries: WallEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-mono-md mt-12 text-center font-mono" style={{ color: "var(--fg-muted)" }}>
        no invites yet.
      </p>
    )
  }

  const rows: WallRow[] = entries.map((entry) => ({
    id: entry.id,
    name: entry.name,
    company: entry.company,
    lang: entry.lang ?? entry.formLang,
    status: statusOf(entry),
    // only a letter on the wall can be reacted to; the rest have nothing to count
    reactions:
      entry.status === "approved"
        ? WALL_REACTIONS.filter(({ id }) => entry.reactions[id] > 0)
            .map(({ id, emoji }) => `${emoji} ${entry.reactions[id]}`)
            .join("  ")
        : "",
    when: whenOf(entry),
  }))

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {COLUMNS.map((h) => (
            // The last column holds the actions and has no visible heading.
            <TableHead key={h}>{h || <span className="sr-only">actions</span>}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <WallEntryRows rows={rows} />
    </Table>
  )
}
