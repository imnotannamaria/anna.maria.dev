/**
 * The board is force-dynamic and reads Postgres, so there is a moment with nothing on
 * screen. Skeletons shaped like the progress card and three columns of cards, so the
 * layout doesn't jump when the rows land.
 */
export default function RoadmapLoading() {
  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 py-12 sm:px-8 lg:px-11">
      <nav
        aria-label="Breadcrumb"
        className="text-mono-sm mb-6 font-mono"
        style={{ color: "var(--fg-muted)" }}
      >
        <span>~</span>
        <span aria-hidden style={{ opacity: 0.5, margin: "0 6px" }}>
          /
        </span>
        <span style={{ color: "var(--fg-primary)" }}>roadmap</span>
      </nav>

      <header className="mb-8 border-b pb-7" style={{ borderColor: "var(--border-subtle)" }}>
        <div
          className="text-mono-sm mb-3 font-mono tracking-[0.08em] uppercase"
          style={{ color: "var(--fg-muted)" }}
        >
          <span style={{ color: "var(--fg-brand)" }}>$</span> roadmap --all --group=status
        </div>
        <h1
          className="text-display-md lg:text-display-lg font-serif leading-none font-normal tracking-[-0.02em]"
          style={{ color: "var(--fg-primary)" }}
        >
          Roadmap
        </h1>
        <p className="text-mono-sm mt-4 font-mono" style={{ color: "var(--fg-muted)" }}>
          {"// loading…"}
        </p>
      </header>

      <div aria-hidden className="bento-card mb-6" style={{ minHeight: 172 }}>
        <span className="h-2.5 w-24 rounded bg-(--bg-surface-elevated)" />
        <span className="h-7 w-40 rounded bg-(--bg-surface-elevated)" />
        <span className="h-4 w-full rounded bg-(--bg-surface-elevated)" />
      </div>

      <div aria-hidden className="grid gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, col) => (
          <div key={col} className="flex flex-col gap-4">
            <span className="h-3 w-32 rounded bg-(--bg-surface-elevated)" />
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="bento-card rm-item" style={{ minHeight: 150 }}>
                <div className="flex flex-col gap-3">
                  <span className="h-2.5 w-24 rounded bg-(--bg-surface-elevated)" />
                  <span className="h-5 w-3/4 rounded bg-(--bg-surface-elevated)" />
                  <span className="h-3 w-full rounded bg-(--bg-surface-elevated)" />
                  <span className="h-3 w-2/3 rounded bg-(--bg-surface-elevated)" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <span className="sr-only" role="status">
        Loading the roadmap
      </span>
    </div>
  )
}
