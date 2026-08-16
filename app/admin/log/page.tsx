import Link from "next/link"
import { PlusIcon } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/app/components/entrepta/button"
import { LogEntryTable } from "@/components/admin/log-entry-table"
import { getAllEntries } from "@/lib/log/queries"

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
          <p className="text-mono-sm mt-2 font-mono" style={{ color: "var(--fg-muted)" }}>
            {entries.length} total · {entries.filter((e) => !e.published).length} draft
          </p>
        </div>

        <Link href="/admin/log/new">
          <Button>
            <PlusIcon size={14} weight="bold" aria-hidden />
            new entry
          </Button>
        </Link>
      </div>

      <LogEntryTable entries={entries} />
    </>
  )
}
