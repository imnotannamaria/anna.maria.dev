import { RoadmapItemRows } from "@/components/admin/roadmap-item-rows"
import type { RoadmapItem } from "@/lib/roadmap/validation"

const COLUMNS = ["status", "title", "pos", "plan", "shipped", ""]

/**
 * A real `<table>` with `<th scope="col">`, matching the log's admin list. It scrolls
 * sideways on a phone rather than reflowing — six columns have nowhere useful to go.
 *
 * Server half: `<table>`, `<thead>` and the empty state. Only `<tbody>` is a client
 * component — see `roadmap-item-rows.tsx`.
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
        <RoadmapItemRows items={items} />
      </table>
    </div>
  )
}
