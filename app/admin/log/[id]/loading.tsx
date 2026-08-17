/** Same reason as the list: the edit page reads the entry before it can render the form. */
export default function EditLogEntryLoading() {
  return (
    <>
      <h1
        className="text-display-md mb-1 font-serif leading-none font-normal tracking-[-0.02em]"
        style={{ color: "var(--fg-primary)" }}
      >
        Edit
      </h1>
      <p className="text-mono-sm mb-6 font-mono" style={{ color: "var(--fg-muted)" }}>
        {"// loading…"}
      </p>

      <div aria-hidden className="flex flex-col gap-6">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <span className="h-2.5 w-16 rounded bg-(--bg-surface-elevated)" />
            <span className="h-10 w-full rounded-md bg-(--bg-surface-elevated)" />
          </div>
        ))}
      </div>

      <span className="sr-only" role="status">
        Loading entry
      </span>
    </>
  )
}
