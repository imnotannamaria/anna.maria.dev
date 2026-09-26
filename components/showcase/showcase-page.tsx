"use client"

/**
 * `/components`: the cards this site is built from, each one running in every state it can be in.
 *
 * It used to be three tabs, with the site's tokens and rules beside the components. Those moved
 * into entrepta, the design system this site runs on, whose docs are the better home for them —
 * so what stays here is only what this site has and entrepta does not: its own cards, and the
 * states they fail in.
 *
 * The group filter lives in the URL through `useUrlFilter`, like every other choice on this site.
 */

import { useMemo } from "react"
import { ArrowLink } from "@/app/components/entrepta/arrow-link"
import { PageOutline, type OutlineItem } from "@/components/chrome/page-outline"
import { useUrlFilter } from "@/hooks/use-url-filter"
import { SHOWCASE_LIST, GROUP_LABEL, type ShowcaseEntry } from "@/lib/showcase/registry"
import { ShowcaseFeed, SHOWCASE_GROUPS } from "./showcase-feed"

const ENTREPTA_DOCS = "https://entrepta.vercel.app/docs"

/**
 * The rail lists the groups the filter leaves on the page. A rail built from the unfiltered list
 * offered `home/` and `shared/` rows on `/components?where=about` whose anchors were no longer in
 * the document: they never highlighted and clicking them did nothing.
 */
function outlineFor(
  entries: ShowcaseEntry[],
  where: (typeof SHOWCASE_GROUPS)[number] | null,
): OutlineItem[] {
  const shown = where ? entries.filter((e) => e.group === where) : entries
  return [
    { id: "panel-components", label: "components", level: 1 },
    ...SHOWCASE_GROUPS.filter((g) => shown.some((e) => e.group === g)).map((g) => ({
      id: `group-${g}`,
      label: GROUP_LABEL[g],
      level: 2 as const,
      count: shown.filter((e) => e.group === g).length,
    })),
  ]
}

export function ShowcasePage() {
  /**
   * The same filter `ShowcaseFeed` owns, read a second time rather than lifted. `useUrlFilter` is
   * a `useSyncExternalStore` over the URL, so two readers of one param cannot disagree.
   */
  const [where] = useUrlFilter("where", SHOWCASE_GROUPS, "/components")

  // Memoised on purpose: `PageOutline` keys its IntersectionObserver on `items`, and a fresh array
  // every render tears the observer down and sets it up again in a loop.
  const entries = useMemo(() => [...SHOWCASE_LIST], [])
  const outline = useMemo(() => outlineFor(entries, where), [entries, where])

  return (
    <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 min-[1100px]:grid-cols-[200px_minmax(0,1fr)]">
      <PageOutline
        items={outline}
        file="components/"
        footer={
          <>
            <div className="flex justify-between">
              <span>{"// components"}</span>
              <span>{entries.length}</span>
            </div>
            <div>{"// every state, every deploy"}</div>
          </>
        }
      />

      <div className="min-w-0">
        {/* `px-3` on a phone, not `px-5`. At 375px the sidebar takes 56 and this column is
            319 wide, and what sits inside it is three more paddings deep — this one, the
            panel's, the stage's, and then the card's own. */}
        <div className="mx-auto max-w-[880px] px-3 py-12 sm:px-8 lg:px-12">
          <h1 className="text-display-md m-0 font-serif font-normal tracking-[-0.02em] text-[var(--fg-primary)]">
            Components
          </h1>
          <p className="text-body-lg mt-3 max-w-[62ch] font-sans text-[var(--fg-secondary)]">
            The cards this site is built from. Each one here is the real thing running, in every
            state it can actually be in, including the ones you only see when something has gone
            wrong. The tokens, the rules and the pieces they share come from entrepta, the design
            system this site runs on.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            <ArrowLink href={`${ENTREPTA_DOCS}/foundations`} external>
              tokens
            </ArrowLink>
            <ArrowLink href={`${ENTREPTA_DOCS}/foundations/rules`} external>
              rules
            </ArrowLink>
            <ArrowLink href={`${ENTREPTA_DOCS}/components`} external>
              entrepta components
            </ArrowLink>
          </div>

          {/* Almost no side padding on a phone: the stage inside already draws its own inset
              frame, so a second gutter here only narrows the component for nothing. */}
          <div
            id="panel-components"
            className="mt-10 scroll-mt-6 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-card)] px-1.5 py-8 sm:px-6"
          >
            <ShowcaseFeed entries={entries} />
          </div>
        </div>
      </div>
    </div>
  )
}
