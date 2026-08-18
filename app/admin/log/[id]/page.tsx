import { notFound } from "next/navigation"
import { LogEntryForm } from "@/components/admin/log-entry-form"
import { getEntryById } from "@/lib/log/queries"

export const dynamic = "force-dynamic"

export default async function EditLogEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const entry = await getEntryById(id)
  if (!entry) notFound()

  return (
    <>
      <h1
        className="text-display-md mb-1 font-serif leading-none font-normal tracking-[-0.02em]"
        style={{ color: "var(--fg-primary)" }}
      >
        Edit
      </h1>
      <p className="text-mono-sm mb-6 font-mono" style={{ color: "var(--fg-muted)" }}>
        {entry.slug}
      </p>
      <LogEntryForm entry={entry} />
    </>
  )
}
