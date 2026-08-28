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
import { GithubCard } from "@/components/home/github-card"
import { TreeCard, TreeCardSkeleton } from "@/components/home/tree-card"
import { StackCard } from "@/components/home/stack-card"
import { MiniPianoCard } from "@/components/home/mini-piano-card"
import {
  SleeveCard,
  SleeveEmpty,
  SleeveError,
  SleeveLoading,
} from "@/components/spotify/sleeve-card"
import { TodayActivityCard } from "@/components/wristkit/today-activity-card"
import { siteTreeRouteCount } from "@/lib/site-tree"

/** Exactly the kinds each registry entry declares — no more, no fewer. */
export type DemoMap = {
  [S in ShowcaseSlug]: {
    [K in (typeof SHOWCASE)[S]["states"][number]]: () => ReactNode
  }
}

/**
 * The heavy one. Requested when its frame scrolls into view, never before.
 *
 * Its own loading and error frames come from the same module, so they arrive with the chunk —
 * which is fine, because both are only reachable once someone has picked them, and picking one
 * means the frame is already on screen. Importing them statically would drag React Flow into
 * this module and make the gating decoration.
 */
const StackGraph = dynamic(
  () => import("@/components/about/stack-graph").then((m) => m.StackGraph),
  { ssr: false },
)
const StackGraphLoading = dynamic(
  () => import("@/components/about/stack-graph").then((m) => m.StackGraphLoading),
  { ssr: false },
)
const StackGraphError = dynamic(
  () => import("@/components/about/stack-graph").then((m) => m.StackGraphError),
  { ssr: false },
)

/** The playlist card takes callbacks; on a documentation page they do nothing. */
const noop = () => {}

export const DEMOS: DemoMap = {
  tree: {
    // The card's own skeleton, which is what `WhoamiRowFallback` in `app/(home)/page.tsx`
    // renders too. One copy, so the demo cannot show a frame the home page doesn't.
    loading: () => <TreeCardSkeleton routeCount={siteTreeRouteCount()} />,
    empty: () => <TreeCard items={TREE_FIXTURE_EMPTY} routeCount={siteTreeRouteCount()} />,
    ok: () => <TreeCard items={TREE_FIXTURE} routeCount={siteTreeRouteCount()} />,
  },

  stack: {
    ok: () => <StackCard />,
  },

  playlist: {
    // The card's own frames, not lookalikes. The `empty` one used to be a generic card frame
    // printing "$ loading…", so this page drew a loading state under the label "empty".
    loading: () => <SleeveLoading />,
    empty: () => <SleeveEmpty />,
    error: () => <SleeveError />,
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
    loading: () => <GithubCard username="imnotannamaria" state={{ kind: "loading" }} />,
    empty: () => <GithubCard username="imnotannamaria" state={{ kind: "empty" }} />,
    error: () => <GithubCard username="imnotannamaria" state={{ kind: "error" }} />,
    ok: () => (
      <GithubCard username="imnotannamaria" state={{ kind: "ok", data: CONTRIBUTIONS_FIXTURE }} />
    ),
  },

  "stack-graph": {
    // The real pane in both cases: this card is not a `.bento-card`, it is a bordered canvas
    // with a fixed height, and a card-shaped skeleton claimed a shape it never has.
    loading: () => <StackGraphLoading />,
    error: () => <StackGraphError />,
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
