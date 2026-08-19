"use client"

/**
 * Every component in the showcase, in every state it declares.
 *
 * `DEMOS` is typed as `DemoMap`, a mapped type built from the registry's literal `states`
 * tuples. That is the enforcement: a slug missing one of its declared kinds is a
 * `tsc --noEmit` error naming both, and an extra one is an excess-property error. No runtime
 * test, no jsdom project — the unit project runs in node with a `*.test.ts` glob and could not
 * import this file anyway.
 *
 * The values are functions, and the heavy ones return `dynamic()` components rather than
 * closing over a static import. If this module imported React Flow and the Web Audio piano at
 * the top, all seven would land in one chunk and the gating on the index page would be
 * decoration. `"use client"` here is load-bearing for the same reason: `next/dynamic` with
 * `ssr: false` is not permitted in a Server Component.
 */

import dynamic from "next/dynamic"
import type { ReactNode } from "react"
import type { CardStateKind } from "@/lib/showcase/state"
import { SHOWCASE, type ShowcaseSlug } from "@/lib/showcase/registry"
import {
  CONTRIBUTIONS_FIXTURE,
  TODAY_FIXTURE,
  TRACK_FIXTURE,
  TREE_FIXTURE,
  TREE_FIXTURE_EMPTY,
} from "@/lib/showcase/fixtures"
import { CardError, CardLoading } from "@/components/ui/card-states"
import { GithubCard } from "@/components/home/github-card"
import { TreeCard } from "@/components/home/tree-card"
import { StackCard } from "@/components/home/stack-card"
import { MiniPianoCard } from "@/components/home/mini-piano-card"
import { SleeveCard } from "@/components/spotify/sleeve-card"
import { TodayActivityCard } from "@/components/wristkit/today-activity-card"
import { siteTreeRouteCount } from "@/lib/site-tree"

/** Exactly the kinds each registry entry declares — no more, no fewer. */
export type DemoMap = {
  [S in ShowcaseSlug]: {
    [K in (typeof SHOWCASE)[S]["states"][number]]: () => ReactNode
  }
}

// The two heavy ones. Requested when their frame scrolls into view, never before, and never at
// all below `md` — the gate lives on the index card, not here.
const StackGraph = dynamic(
  () => import("@/components/about/stack-graph").then((m) => m.StackGraph),
  { ssr: false, loading: () => <CardLoading label="stack graph" rows={0} minHeight={420} /> },
)

/** The playlist card takes callbacks; on a documentation page they do nothing. */
const noop = () => {}

export const DEMOS: DemoMap = {
  tree: {
    ok: () => <TreeCard items={TREE_FIXTURE} routeCount={siteTreeRouteCount()} />,
    empty: () => <TreeCard items={TREE_FIXTURE_EMPTY} routeCount={siteTreeRouteCount()} />,
  },

  stack: {
    ok: () => <StackCard />,
  },

  playlist: {
    loading: () => <CardLoading label="me, as a playlist" media={92} minHeight={220} />,
    empty: () => <CardLoading label="me, as a playlist" rows={0} minHeight={220} />,
    error: () => (
      <CardError
        label="me, as a playlist"
        title="playlist unavailable"
        note="spotify api didn't respond"
        minHeight={220}
      />
    ),
    ok: () => (
      <SleeveCard
        track={TRACK_FIXTURE}
        elapsedMs={74_000}
        totalMs={TRACK_FIXTURE.durationMs}
        running
        audible={false}
        onToggle={noop}
        onNext={noop}
        onPrev={noop}
      />
    ),
  },

  piano: {
    ok: () => <MiniPianoCard />,
  },

  contributions: {
    loading: () => <CardLoading label="contributions" rows={0} minHeight={220} />,
    empty: () => <GithubCard username="imnotannamaria" state={{ kind: "empty" }} />,
    error: () => <GithubCard username="imnotannamaria" state={{ kind: "error" }} />,
    ok: () => (
      <GithubCard username="imnotannamaria" state={{ kind: "ok", data: CONTRIBUTIONS_FIXTURE }} />
    ),
  },

  "stack-graph": {
    loading: () => <CardLoading label="stack graph" rows={0} minHeight={420} />,
    error: () => (
      <CardError
        label="stack graph"
        title="the graph didn't load"
        note="a dynamic chunk that never arrives has no error state of its own"
        minHeight={420}
      />
    ),
    ok: () => <StackGraph />,
  },

  wristkit: {
    loading: () => <TodayActivityCard state={{ kind: "loading" }} />,
    empty: () => <TodayActivityCard state={{ kind: "empty" }} />,
    error: () => <TodayActivityCard state={{ kind: "error" }} />,
    stale: () => <TodayActivityCard state={{ kind: "stale", data: TODAY_FIXTURE }} />,
    ok: () => <TodayActivityCard state={{ kind: "ok", data: TODAY_FIXTURE }} />,
  },
}

/** Looks a frame up without the caller having to narrow the slug/kind pair itself. */
export function renderDemo(slug: string, kind: CardStateKind): ReactNode {
  const entry = (DEMOS as Record<string, Partial<Record<CardStateKind, () => ReactNode>>>)[slug]
  return entry?.[kind]?.() ?? null
}
