import Link from "next/link"
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr"
import { DeleteRoadmapItemDialog } from "@/components/admin/delete-roadmap-item-dialog"
import { STATUS_LABEL, type RoadmapItem, type RoadmapStatus } from "@/lib/roadmap/validation"

const COLUMNS = ["status", "title", "pos", "plan", "shipped", ""]

/** Muted for raw, brand for anything public, success for shipped. */
const STATUS_COLOR: Record<RoadmapStatus, string> = {
  raw: "var(--fg-muted)",
  todo: "var(--fg-secondary)",
  doing: "var(--fg-brand-hover)",
  done: "var(--status-success-fg)",
}

/**
 * A real `<table>` with `<th scope="col">`, matching the log's admin list. It scrolls
 * sideways on a phone rather than reflowing — six columns have nowhere useful to go.
 */
export function RoadmapItemTable({ items }: { items: RoadmapItem[] }) {
  if (items.length === 0) {
    return (
      <p className="mt-12 text-center font-mono text-[13px]" style={{ color: "var(--fg-muted)" }}>
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
                className="px-2 py-2 font-mono text-[10px] tracking-[0.08em] whitespace-nowrap uppercase"
                style={{ color: "var(--fg-muted)" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <td className="px-2 py-3 font-mono text-[11px] whitespace-nowrap">
                <span style={{ color: STATUS_COLOR[item.status] }}>
                  {STATUS_LABEL[item.status]}
                </span>
              </td>

              <td className="max-w-70 min-w-40 px-2 py-3">
                <Link
                  href={`/admin/roadmap/${item.id}`}
                  className="block truncate font-mono text-[13px] hover:underline"
                  style={{ color: "var(--fg-primary)" }}
                >
                  {item.title}
                </Link>
                {item.blurb && (
                  <span
                    className="block truncate font-mono text-[11px]"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {item.blurb}
                  </span>
                )}
              </td>

              <td
                className="px-2 py-3 font-mono text-[11px] whitespace-nowrap"
                style={{ color: "var(--fg-muted)" }}
              >
                {item.position}
              </td>

              <td
                className="max-w-50 px-2 py-3 font-mono text-[11px]"
                style={{ color: "var(--fg-muted)" }}
              >
                <span className="block truncate">{item.planUrl ?? "—"}</span>
              </td>

              <td
                className="px-2 py-3 font-mono text-[11px] whitespace-nowrap"
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
                  <DeleteRoadmapItemDialog id={item.id} title={item.title} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
