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
 */

import dynamic from "next/dynamic"
import { Skeleton } from "@/app/components/entrepta/skeleton"
import { useMediaQuery } from "@/hooks/use-media-query"

const StackFlow = dynamic(() => import("./stack-flow").then((m) => m.StackFlow), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
})

export function StackGraph() {
  // Matches the `md` the page hides this at. Below it, and before hydration, the pane is
  // never rendered — so its chunk is never requested.
  const wide = useMediaQuery("(min-width: 768px)")

  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-lg)] border"
      style={{
        borderColor: "var(--border-subtle)",
        background: "var(--bg-card)",
        height: "clamp(420px, 62vh, 620px)",
      }}
    >
      {wide ? <StackFlow /> : <Skeleton className="h-full w-full" />}

      <span
        className="text-mono-xs pointer-events-none absolute top-3 right-3 font-mono"
        style={{ color: "var(--fg-muted)" }}
      >
        {"// click a category · drag to pan"}
      </span>
    </div>
  )
}
