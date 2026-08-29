/**
 * Which components `/components` shows, and in which states.
 *
 * Metadata only — no React, no JSX, nothing with a `"use client"` anywhere in its import
 * graph. Two reasons, both load-bearing: `velite.config.ts` imports this to validate the MDX
 * frontmatter against it, and that config is evaluated in a plain Node bundle at build time
 * before `next build` runs; and the index page's server half reads it, so it has to stay
 * serializable. `lib/site-tree.ts` keeps the same discipline for the same kind of reason.
 */

import type { CardStateKind } from "./state"

export type ShowcaseEntry = {
  /** Matches `content/components/<slug>.mdx` and the route segment. */
  slug: string
  /** The name in the card head and the outline row. */
  name: string
  /** One line, for the index card. */
  blurb: string
  /** Repo-relative. Checked with existsSync at build, and also the source link. */
  source: string
  /** Which group it sorts into on the index: the page it lives on. */
  group: "home" | "about" | "shared"
  /** Routes it is used on, shown in the doc page's metadata column. */
  where: string[]
  /**
   * Every frame this component genuinely wears in production, in lifecycle order — loading,
   * empty, error, stale, ok. Not a wish list: a state here has to be one the component actually
   * reaches on a real page, and one the component itself renders, so `demos.tsx` can hand back
   * the real frame rather than a lookalike.
   *
   * The order is the order the picker lists them in. It is not the frame the specimen opens on
   * — see `defaultState`.
   */
  states: readonly CardStateKind[]
  /** External docs instead of a page here. wristkit is the only one. */
  external?: { href: string; label: string }
}

/**
 * `as const satisfies` rather than a plain annotation, and the difference is the whole
 * enforcement mechanism: the annotation would widen `states` to `CardStateKind[]` and the
 * mapped `DemoMap` type below would stop knowing which kinds each entry declares. With the
 * literal tuples preserved, a demo missing a state is a `tsc --noEmit` error naming the slug
 * and the kind. Drop the `as const` and the check silently degrades to nothing.
 */
export const SHOWCASE = {
  tree: {
    slug: "tree",
    name: "the tree",
    blurb: "The site's own routes as a file tree, with counts that come from the real sources.",
    source: "components/home/tree-card.tsx",
    group: "home",
    where: ["/"],
    /**
     * `loading` was missing, and the home page had one all along: the tree streams inside
     * `<Suspense>` beside the profile card, with `TreeCardSkeleton` as its fallback. The
     * registry said the card had two states while the site rendered three — which is the exact
     * failure this page exists to catch, on the page that catches it.
     *
     * `empty` is a fresh fork of this template: no posts, no projects, and no database, so the
     * structure is all there and every count is gone.
     */
    states: ["loading", "empty", "ok"],
  },
  stack: {
    slug: "stack",
    name: "the stack",
    blurb: "Every tool, grouped by layer, as a branch list that opens one branch at a time.",
    source: "components/home/stack-card.tsx",
    group: "home",
    where: ["/"],
    states: ["ok"],
  },
  playlist: {
    slug: "playlist",
    name: "me, as a playlist",
    blurb: "A record half out of its sleeve, turning while it plays.",
    source: "components/spotify/sleeve-card.tsx",
    group: "home",
    where: ["/"],
    states: ["loading", "empty", "error", "ok"],
  },
  piano: {
    slug: "piano",
    name: "the mini piano",
    blurb: "Two octaves that play themselves, and a link to the one you can actually play.",
    source: "components/home/mini-piano-card.tsx",
    group: "home",
    where: ["/", "/piano"],
    states: ["ok"],
  },
  contributions: {
    slug: "contributions",
    name: "contributions",
    blurb: "A year of GitHub activity, fetched server-side so the grid is in the served HTML.",
    source: "components/about/github-calendar.tsx",
    group: "shared",
    where: ["/", "/about"],
    states: ["loading", "empty", "error", "ok"],
  },
  "stack-graph": {
    slug: "stack-graph",
    name: "the stack graph",
    blurb: "The same stack as a React Flow canvas, loaded only at the width it is meant for.",
    source: "components/about/stack-graph.tsx",
    group: "about",
    where: ["/about"],
    states: ["loading", "error", "ok"],
  },
  wristkit: {
    slug: "wristkit",
    name: "wristkit",
    blurb:
      "Apple Watch rings from a Shortcut that posts into Postgres. Five states, and the card this whole contract came from.",
    source: "components/wristkit/today-activity-card/index.tsx",
    group: "home",
    where: ["/"],
    states: ["loading", "empty", "error", "stale", "ok"],
    external: { href: "https://wristkit-web.vercel.app/docs", label: "wristkit-web" },
  },
} as const satisfies Record<string, ShowcaseEntry>

export type ShowcaseSlug = keyof typeof SHOWCASE

export const SHOWCASE_LIST: readonly ShowcaseEntry[] = Object.values(SHOWCASE)

export const GROUP_LABEL: Record<ShowcaseEntry["group"], string> = {
  home: "home/",
  about: "about/",
  shared: "shared/",
}
