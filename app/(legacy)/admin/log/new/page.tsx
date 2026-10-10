import { LogEntryForm } from "@/components/admin/log-entry-form"
import { requireAdmin } from "@/lib/auth/require-admin"

export default async function NewLogEntryPage() {
  // Nothing here reads the database, but the rule is unconditional for a reason: the next
  // person to add a query to this page should not also have to remember the guard.
  await requireAdmin()

  return (
    <>
      <h1
        className="text-display-md mb-6 font-serif leading-none font-normal tracking-[-0.02em]"
        style={{ color: "var(--fg-primary)" }}
      >
        New entry
      </h1>
      <LogEntryForm />
    </>
  )
}
