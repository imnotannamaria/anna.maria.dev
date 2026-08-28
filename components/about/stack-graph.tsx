"use client"

/**
 * The frame around the stack graph, and the two gates in front of it.
 *
 * Same split as `GithubCard`: the heavy thing loads on its own. React Flow is the largest
 * dependency on the site, the stack sits well below the fold on /about, and the pane has
 * nothing to say during SSR anyway — it measures the DOM before it can place a node, so a
 * server render produces an empty canvas. `ssr: false` states that instead of paying for it.
 *
 * The second gate is the media query, and it is not redundant with the `hidden md:block` on
 * the page. CSS hides pixels; React still mounts the component, and a mounted `next/dynamic`
 * fetches its chunk — so phones were downloading 180 KB of React Flow to render a
 * `display: none` box. The graph is only ever *built* at the width it is meant for.
 *
 * The data isn't lost by skipping either gate: the badge list on the page is `md:sr-only`,
 * so it stays in the DOM and in the accessibility tree at every width.
 *
 * `GraphPane` and the two frames below it are exported because `/components` shows this card
 * in states it is not currently in. They used to be inline here, and the showcase drew its own
 * `CardLoading` / `CardError` lookalikes instead — a documentation page claiming a frame the
 * component does not actually wear. There is one copy of each now and both callers render it.
 */

import dynamic from "next/dynamic"
import { Skeleton } from "@/app/components/entrepta/skeleton"
import { ChunkBoundary } from "@/components/ui/chunk-boundary"
import { useMediaQuery } from "@/hooks/use-media-query"

const StackFlow = dynamic(() => import("./stack-flow").then((m) => m.StackFlow), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
})

/**
 * The bordered box the canvas lives in. Its height is fixed here rather than by the content,
 * because the content is a chunk that may not have arrived — a pane that grows when React Flow
 * lands would shift everything below it on /about.
 */
export function GraphPane({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-lg)] border"
      style={{
        borderColor: "var(--border-subtle)",
        background: "var(--bg-card)",
        height: "clamp(420px, 62vh, 620px)",
      }}
    >
      {children}

      <span
        className="text-mono-xs pointer-events-none absolute top-3 right-3 font-mono"
        style={{ color: "var(--fg-muted)" }}
      >
        {"// click a category · drag to pan"}
      </span>
    </div>
  )
}

/** What the pane holds until the chunk lands — and, below `md`, what it holds for good. */
export function StackGraphLoading() {
  return (
    <GraphPane>
      <Skeleton className="h-full w-full" />
      <span className="sr-only">Loading the stack graph</span>
    </GraphPane>
  )
}

/**
 * `next/dynamic` has no error UI of its own: a dropped request left this blank forever with
 * nothing to retry. `onRetry` is optional so the showcase can render the frame with nothing
 * behind it — a retry button that reloads nothing is a worse lie than no button.
 */
export function StackGraphError({ onRetry }: { onRetry?: () => void }) {
  return (
    <GraphPane>
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-mono-sm m-0 font-mono" style={{ color: "var(--fg-secondary)" }}>
          {"// the graph didn't load"}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-mono-sm cursor-pointer font-mono transition-colors"
            style={{ color: "var(--fg-brand)" }}
          >
            try again →
          </button>
        )}
      </div>
    </GraphPane>
  )
}

export function StackGraph() {
  // Matches the `md` the page hides this at. Below it, and before hydration, the pane is
  // never rendered — so its chunk is never requested. The badge list on the page is
  // `md:sr-only`, so nothing is missing there, it is just shown a different way.
  const wide = useMediaQuery("(min-width: 768px)")

  if (!wide) return <StackGraphLoading />

  return (
    <GraphPane>
      <ChunkBoundary
        logTag="[stack-graph] chunk failed"
        fallback={(retry) => <StackGraphError onRetry={retry} />}
      >
        <StackFlow />
      </ChunkBoundary>
    </GraphPane>
  )
}
