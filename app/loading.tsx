/**
 * The home page is force-dynamic — the wristkit rings and the log shelf are supposed to read
 * as live — so it waits on Postgres before anything paints.
 *
 * Only the first row is drawn: the profile card and the tree beside it, at the real grid and
 * the real 420px minimum. Everything below the fold can arrive with the page. A skeleton is
 * worth having where it holds the layout still, and worth stopping where it would just be a
 * second, dimmer copy of the site to keep in step.
 */
export default function HomeLoading() {
  return (
    <div
      className="mx-auto flex flex-col gap-14 px-4 py-6 sm:gap-16 sm:px-6 md:px-8 lg:gap-20 lg:px-12 lg:py-8"
      style={{ maxWidth: 1280 }}
    >
      <section aria-hidden>
        <div
          className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-dashed pb-3"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <span className="font-mono text-xs tracking-[0.08em] uppercase">
            <span style={{ color: "var(--fg-brand)" }}>$</span>{" "}
            <span style={{ color: "var(--fg-muted)" }}>whoami</span>
          </span>
          <span className="font-mono text-[11px]" style={{ color: "var(--fg-muted)" }}>
            {"// loading…"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.5fr_1fr]">
          <div
            className="flex flex-col items-center gap-6 p-6 sm:p-8"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-xl)",
              minHeight: 420,
            }}
          >
            <span
              className="rounded-[14px]"
              style={{ width: 96, height: 96, background: "var(--bg-surface-elevated)" }}
            />
            <span className="h-9 w-48 rounded bg-(--bg-surface-elevated)" />
            <span className="h-3 w-40 rounded bg-(--bg-surface-elevated)" />
            <div className="flex w-full max-w-110 flex-col gap-2">
              <span className="h-16 w-full rounded-[var(--radius-lg)] bg-(--bg-surface-elevated)" />
              <span className="h-2.5 w-3/4 rounded bg-(--bg-surface-elevated)" />
            </div>
            <span className="mt-auto h-10 w-56 rounded-[var(--radius-md)] bg-(--bg-surface-elevated)" />
          </div>

          <div className="bento-card" style={{ minHeight: 420 }}>
            <span className="h-2.5 w-20 rounded bg-(--bg-surface-elevated)" />
            {Array.from({ length: 8 }, (_, i) => (
              <span
                key={i}
                className="h-3 rounded bg-(--bg-surface-elevated)"
                style={{ width: `${72 - i * 5}%` }}
              />
            ))}
          </div>
        </div>
      </section>

      <span className="sr-only" role="status">
        Loading the page
      </span>
    </div>
  )
}
