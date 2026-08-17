import { LogEntryForm } from "@/components/admin/log-entry-form"

export default function NewLogEntryPage() {
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
