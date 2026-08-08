import { LogEntryForm } from "@/components/admin/log-entry-form"

export default function NewLogEntryPage() {
  return (
    <>
      <h1
        className="mb-6 font-serif text-4xl leading-none font-normal tracking-[-0.02em]"
        style={{ color: "var(--fg-primary)" }}
      >
        New entry
      </h1>
      <LogEntryForm />
    </>
  )
}
