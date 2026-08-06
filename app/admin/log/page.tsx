import Link from "next/link"
import { Button } from "@/app/components/entrepta/button"
import { DeleteEntryDialog } from "@/components/admin/delete-entry-dialog"
import { formatLoggedAt } from "@/lib/log/date"
import { getAllEntries } from "@/lib/log/queries"
import { starString } from "@/lib/log/stars"
import { TYPE_LABEL } from "@/lib/log/validation"

/** Drafts included — seeing them is the point of this screen. */
export const dynamic = "force-dynamic"

export default async function AdminLogPage() {
  const entries = await getAllEntries()

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div
            className="mb-2 font-mono text-xs tracking-[0.08em] uppercase"
            style={{ color: "var(--fg-muted)" }}
          >
            <span style={{ color: "var(--fg-brand)" }}>$</span> log --admin
          </div>
          <h1
            className="font-serif text-4xl leading-none font-normal tracking-[-0.02em]"
            style={{ color: "var(--fg-primary)" }}
          >
            Entries
          </h1>
          <p className="mt-2 font-mono text-[11px]" style={{ color: "var(--fg-muted)" }}>
            {entries.length} total · {entries.filter((e) => !e.published).length} draft
          </p>
        </div>

        <Link href="/admin/log/new">
          <Button>new entry</Button>
        </Link>
      </div>

      {entries.length === 0 ? (
        <p className="mt-12 text-center font-mono text-[13px]" style={{ color: "var(--fg-muted)" }}>
          {"// nothing logged yet."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                {["type", "title", "rating", "logged", "status", ""].map((h) => (
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
              {entries.map((entry) => (
                <tr key={entry.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td className="px-2 py-3">
                    <span
                      className="inline-flex h-5 items-center rounded-[5px] px-2 font-mono text-[10px] uppercase"
                      style={{
                        background: "var(--bg-surface-brand)",
                        color: "var(--fg-brand-hover)",
                      }}
                    >
                      {TYPE_LABEL[entry.type]}
                    </span>
                  </td>

                  <td className="max-w-[280px] px-2 py-3">
                    <Link
                      href={`/admin/log/${entry.id}`}
                      className="block truncate font-mono text-[13px] hover:underline"
                      style={{ color: "var(--fg-primary)" }}
                    >
                      {entry.title}
                    </Link>
                    {entry.creator && (
                      <span
                        className="block truncate font-mono text-[11px]"
                        style={{ color: "var(--fg-muted)" }}
                      >
                        {entry.creator}
                      </span>
                    )}
                  </td>

                  <td className="px-2 py-3 whitespace-nowrap">
                    <span className="text-[13px]" style={{ color: "var(--fg-brand)" }}>
                      {starString(entry.rating) || "—"}
                    </span>
                    {entry.favorite && (
                      <>
                        <span aria-hidden className="ml-1.5" style={{ color: "var(--fg-brand)" }}>
                          ♥
                        </span>
                        <span className="sr-only">favorite</span>
                      </>
                    )}
                  </td>

                  <td
                    className="px-2 py-3 font-mono text-[11px] whitespace-nowrap"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    <time dateTime={entry.loggedAt}>{formatLoggedAt(entry.loggedAt)}</time>
                  </td>

                  <td className="px-2 py-3 font-mono text-[11px] whitespace-nowrap">
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
                      <Link href={`/admin/log/${entry.id}`}>
                        <Button variant="ghost" size="sm">
                          edit
                        </Button>
                      </Link>
                      <DeleteEntryDialog id={entry.id} title={entry.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
