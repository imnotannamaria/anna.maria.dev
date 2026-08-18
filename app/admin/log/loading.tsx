/**
 * The list is force-dynamic and hits Postgres, so navigating here shows nothing until the
 * query returns. Skeleton rows rather than a spinner: the header is known ahead of time,
 * and matching the table's shape keeps the layout from jumping when the data lands.
 */
export default function AdminLogLoading() {
  return (
    <>
      <div className="mb-6">
        <div
          className="text-mono-sm mb-2 font-mono tracking-[0.08em] uppercase"
          style={{ color: "var(--fg-muted)" }}
        >
          <span style={{ color: "var(--fg-brand)" }}>$</span> log --admin
        </div>
        <h1
          className="text-display-md font-serif leading-none font-normal tracking-[-0.02em]"
          style={{ color: "var(--fg-primary)" }}
        >
          Entries
        </h1>
        <p className="text-mono-sm mt-2 font-mono" style={{ color: "var(--fg-muted)" }}>
          {"// loading…"}
        </p>
      </div>

      <div aria-hidden className="flex flex-col">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-3"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <span className="h-5 w-12 shrink-0 rounded-[5px] bg-(--bg-surface-elevated)" />
            <span className="h-3.5 flex-1 rounded bg-(--bg-surface-elevated)" />
            <span className="hidden h-3.5 w-20 rounded bg-(--bg-surface-elevated) sm:block" />
          </div>
        ))}
      </div>

      <span className="sr-only" role="status">
        Loading entries
      </span>
    </>
  )
}
