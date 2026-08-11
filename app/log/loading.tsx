/**
 * `/log` is force-dynamic and reads Postgres, so there is a moment with nothing on screen.
 *
 * Shaped like the real page rather than a spinner: the outline rail, the header, the filter
 * pills and a grid of poster tiles at the same 300px track the feed uses. What it is for is
 * the layout not jumping when the rows land — a centred spinner guarantees it will.
 *
 * The rail comes from `OutlineSkeleton` rather than being traced here. It was traced here,
 * and a hand copy of a sticky box is exactly the thing that drifts from the real one and
 * makes the layout jump anyway.
 */
import { OutlineSkeleton } from "@/components/chrome/page-outline"

export default function LogLoading() {
  return (
    <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 min-[1100px]:grid-cols-[200px_minmax(0,1fr)]">
      <OutlineSkeleton file="log.tsx" />

      <div className="min-w-0">
        <div className="mx-auto max-w-[880px] px-5 py-12 sm:px-8 lg:px-12">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 font-mono text-xs"
            style={{ color: "var(--fg-muted)" }}
          >
            <span>~</span>
            <span aria-hidden style={{ opacity: 0.5, margin: "0 6px" }}>
              /
            </span>
            <span style={{ color: "var(--fg-primary)" }}>log</span>
          </nav>

          <div
            className="mb-3 font-mono text-xs tracking-[0.08em] uppercase"
            style={{ color: "var(--fg-muted)" }}
          >
            <span aria-hidden style={{ color: "var(--fg-brand)" }}>
              #
            </span>{" "}
            log --all --sort=albums,favorites
          </div>

          <h1
            className="m-0 font-serif leading-none font-normal tracking-[-0.02em]"
            style={{ color: "var(--fg-primary)", fontSize: "clamp(48px, 6vw, 72px)" }}
          >
            Log.
          </h1>

          <p className="mt-4 font-mono text-xs" style={{ color: "var(--fg-muted)" }}>
            {"// loading…"}
          </p>

          <div aria-hidden className="mt-8 flex flex-wrap gap-2">
            {[52, 68, 60].map((w, i) => (
              <span
                key={i}
                className="h-7 rounded-md border"
                style={{ width: w, borderColor: "var(--border-subtle)" }}
              />
            ))}
          </div>

          <div
            aria-hidden
            className="mt-10 grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-3.5 border-t pt-8"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="bento-card bento-card-sm" style={{ minHeight: 148 }}>
                <div className="flex gap-3.5">
                  <span
                    className="aspect-[2/3] w-[92px] shrink-0 rounded-[7px]"
                    style={{ background: "var(--bg-surface-elevated)" }}
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                    <span className="h-2.5 w-16 rounded bg-(--bg-surface-elevated)" />
                    <span className="h-5 w-4/5 rounded bg-(--bg-surface-elevated)" />
                    <span className="h-3 w-2/3 rounded bg-(--bg-surface-elevated)" />
                    <span className="mt-auto h-3.5 w-24 rounded bg-(--bg-surface-elevated)" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <span className="sr-only" role="status">
            Loading the log
          </span>
        </div>
      </div>
    </div>
  )
}
