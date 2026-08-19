"use client"

/**
 * The client half of `/components`: the filter, and the cards.
 *
 * `FeedShell` does the layout, as it does for /blog, /projects and /log. This is the fourth
 * index page on the site and inventing a fourth arrangement is the divergence the
 * Standardization check is about.
 *
 * The tokens section arrives as `children` — server-rendered, above the filter — and its
 * outline rows come in through `preOutline`, so the rail is one list rather than two.
 */

import { FeedShell, groupInOrder, type FeedGroup } from "@/components/chrome/feed-shell"
import { useUrlFilter } from "@/components/ui/url-filter"
import { CardFoot, CardHead } from "@/components/ui/card-parts"
import { ArrowLink } from "@/components/ui/arrow-link"
import type { OutlineItem } from "@/components/chrome/page-outline"
import { GROUP_LABEL, type ShowcaseEntry } from "@/lib/showcase/registry"
import { sourceUrl } from "@/lib/showcase/source"
import { StateCarousel } from "./state-carousel"

const GROUPS = ["home", "about", "shared"] as const

/** Roughly how tall each card ends up, so a frame reserves the right box before it mounts. */
const MIN_HEIGHT: Record<string, number> = {
  tree: 420,
  stack: 340,
  playlist: 240,
  piano: 260,
  contributions: 240,
  "stack-graph": 460,
  wristkit: 440,
}

function ShowcaseCard({ entry }: { entry: ShowcaseEntry }) {
  return (
    <article className="bento-card">
      <CardHead label={entry.name} as="h3" meta={entry.where.join(" · ")} />

      <p className="text-body-md m-0 font-sans" style={{ color: "var(--fg-secondary)" }}>
        {entry.blurb}
      </p>

      <div className="mt-4">
        <StateCarousel
          slug={entry.slug}
          name={entry.name}
          states={entry.states}
          minHeight={MIN_HEIGHT[entry.slug] ?? 240}
        />
      </div>

      <CardFoot
        comment={entry.source}
        className="mt-4 border-t border-dashed border-(--border-subtle) pt-3"
      >
        <div className="flex items-center gap-4">
          <ArrowLink href={sourceUrl(entry.source)} external className="text-mono-xs">
            source
          </ArrowLink>
          {entry.external ? (
            <ArrowLink href={entry.external.href} external className="text-mono-xs">
              {entry.external.label}
            </ArrowLink>
          ) : (
            <ArrowLink href={`/components/${entry.slug}`} className="text-mono-xs">
              read
            </ArrowLink>
          )}
        </div>
      </CardFoot>
    </article>
  )
}

export function ShowcaseFeed({
  entries,
  preOutline,
  children,
}: {
  entries: ShowcaseEntry[]
  preOutline: OutlineItem[]
  children: React.ReactNode
}) {
  // useUrlFilter, never useSearchParams: on a statically rendered route the latter makes
  // prerender emit the nearest Suspense fallback, and every card would be missing from the
  // HTML a crawler reads — on the one page whose job is listing components.
  const [active, setFilter] = useUrlFilter("where", GROUPS, "/components")

  // FeedShell's onFilter is typed for any string, since it does not know the union each page
  // allows. Narrowing here rather than widening useUrlFilter keeps the filter's own type
  // honest — a value that is not one of GROUPS clears the filter, which is what a junk
  // ?where= in the URL should do anyway.
  const onFilter = (next: string | null) =>
    setFilter(
      next && (GROUPS as readonly string[]).includes(next)
        ? (next as (typeof GROUPS)[number])
        : null,
    )

  const visible = active ? entries.filter((e) => e.group === active) : entries

  const groups: FeedGroup<ShowcaseEntry>[] = groupInOrder(visible, (e) => e.group).map(
    ({ key, items }) => ({
      id: `group-${key}`,
      label: GROUP_LABEL[key as ShowcaseEntry["group"]],
      items,
    }),
  )

  const pills = GROUPS.map((g) => ({
    key: g,
    label: GROUP_LABEL[g],
    count: entries.filter((e) => e.group === g).length,
  })).filter((p) => p.count > 0)

  return (
    <FeedShell
      file="components/"
      root={{ id: "showcase", label: "components" }}
      preOutline={preOutline}
      filterLabel="Filter by page"
      pills={pills}
      totalCount={entries.length}
      active={active}
      onFilter={onFilter}
      groups={groups}
      groupMeta={(g) => `${g.items.length} ${g.items.length === 1 ? "component" : "components"}`}
      empty={{
        all: "nothing documented yet.",
        filtered: "nothing on that page yet.",
      }}
      listClassName="flex flex-col gap-6"
      renderItem={(entry) => <ShowcaseCard key={entry.slug} entry={entry} />}
      footer={
        <>
          <div className="flex justify-between">
            <span>{"// components"}</span>
            <span>{entries.length}</span>
          </div>
          <div>{"// every state, every deploy"}</div>
        </>
      }
    >
      {children}
    </FeedShell>
  )
}
