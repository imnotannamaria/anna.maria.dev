"use client"

/**
 * The shell the three index pages are drawn in: /blog, /projects and /log.
 *
 * It existed three times. `blog-feed`, `project-feed` and `log-feed` each spelled out the same
 * ~90 lines — the two-column grid, the outline rail and its three-row footer, the 880px column,
 * the filter row with `all` in front, the two-branch empty state, and a section head whose
 * inline style block was character-identical in all three. The sameness was deliberate and it
 * was right: the pages *do* look like one site. Writing it three times was the part that wasn't.
 * The rule in CLAUDE.md is that the second copy is a warning and the third is a bug, and the
 * skeleton in `app/log/loading.tsx` was quietly the fourth.
 *
 * What is left at each call site is the part that genuinely differs: what the thing is called,
 * what it groups by, what a group's tally says, what a card looks like, and — since /log became
 * a rail rather than a grid — what the cards sit in.
 *
 * Two things stay outside on purpose. The filter state, because `useUrlFilter` needs the param
 * and the base path and those belong to the route; and the page header, which is server-rendered
 * and arrives as `children` — the whole reason the feeds take children rather than a `title`.
 */

import { useMemo } from "react"
import { PageOutline, type OutlineItem } from "./page-outline"
import { FilterPill } from "@/components/ui/url-filter"
import { cn } from "@/lib/utils"

/** One `<section>` in the feed, one row in the outline. */
export type FeedGroup<T> = {
  /** The anchor, and what the outline row points at: `year-2026`, `type-music`. */
  id: string
  /** The section's heading, and the outline row's label: `2026`, `albums`. */
  label: string
  items: T[]
  /**
   * A second grouping level within this section — /projects nests year under kind, so the
   * outline keeps the year breakdown /blog has even though the section itself is now "Open
   * source" / "Demos" rather than a year. Optional and unused by /blog and /log, which have
   * only one axis to group by.
   *
   * A subgroup only gets its own `<h3>` in the grid when there's more than one — right now
   * every project is dated 2026, so each kind has exactly one subgroup and the grid stays a
   * single flat run. The outline still lists it; the visual split shows up on its own the day
   * a second year exists.
   */
  subgroups?: { id: string; label: string; items: T[] }[]
}

export type FeedPill = { key: string; label: string; count: number }

/**
 * Buckets in **first-appearance** order, which is what keeps a query's ordering through the
 * grouping. /blog and /projects arrive newest first, so the years descend for free; /log's
 * `TYPE_ORDER` puts music in front, so music leads and favourites still lead inside it.
 * Sorting here would quietly throw all of that away.
 */
export function groupInOrder<T>(
  items: T[],
  key: (item: T) => string,
): { key: string; items: T[] }[] {
  const buckets = new Map<string, T[]>()
  for (const item of items) {
    const k = key(item)
    const bucket = buckets.get(k)
    if (bucket) bucket.push(item)
    else buckets.set(k, [item])
  }
  return Array.from(buckets, ([key, items]) => ({ key, items }))
}

export function FeedShell<T>({
  file,
  root,
  footer,
  filterLabel,
  pills,
  totalCount,
  active,
  onFilter,
  groups,
  groupMeta,
  empty,
  list,
  renderItem,
  children,
}: {
  /** The name in the outline chip: `posts/`, `projects/`, `log.tsx`. */
  file: string
  /** The level-1 outline row. Its `id` is the one the page header carries. */
  root: { id: string; label: string }
  /** The three lines under the rail's dashed rule — the one part that is per page. */
  footer: React.ReactNode
  /** `Filter by tag`, `Filter by type`. */
  filterLabel: string
  pills: FeedPill[]
  /** The count on the `all` pill: everything, before the filter. */
  totalCount: number
  active: string | null
  /** Given a pill's key. The shell handles the toggle-to-clear itself. */
  onFilter: (next: string | null) => void
  groups: FeedGroup<T>[]
  /** The tally on the right of a section head: `3 posts`, `12 logged`. */
  groupMeta: (group: FeedGroup<T>) => string
  /** Two different facts, and they must not be one sentence: nothing published at all, versus
   *  nothing under the filter someone just applied. */
  empty: { all: string; filtered: string }
  /**
   * What the cards sit in. Exactly one of these two, and the union is the enforcement:
   * `className` for a plain wrapper — a column on /blog, a grid on /projects — or `render`
   * when the layout is a component with state of its own, which is what /log's rail is. A
   * page passing both would be describing two layouts.
   */
  list:
    | { className: string; render?: never }
    | {
        className?: never
        /**
         * Gets the group's items, the shell's own per-item renderer, and the group's label —
         * the last one so a layout needing an accessible name has the same string the
         * heading and the outline row use, instead of reaching into `items[0]` for it.
         */
        render: (
          items: T[],
          renderItem: (item: T, index: number) => React.ReactNode,
          label: string,
        ) => React.ReactNode
      }
  /** Must return a keyed element. `index` is already the staggered one. */
  renderItem: (item: T, index: number) => React.ReactNode
  /** The server-rendered page header. */
  children: React.ReactNode
}) {
  /**
   * Memoised because `PageOutline` keys its IntersectionObserver effect on `items`: a fresh
   * array identity every render tore the observer down and rebuilt it on every render,
   * including every filter-pill click.
   */
  const outline: OutlineItem[] = useMemo(
    () => [
      { id: root.id, label: root.label, level: 1 },
      ...groups.flatMap((group) => [
        { id: group.id, label: group.label, level: 2 as const, count: group.items.length },
        ...(group.subgroups ?? []).map((sub) => ({
          id: sub.id,
          label: sub.label,
          level: 3 as const,
          count: sub.items.length,
        })),
      ]),
    ],
    [root.id, root.label, groups],
  )

  return (
    <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 min-[1100px]:grid-cols-[200px_minmax(0,1fr)]">
      <PageOutline items={outline} file={file} footer={footer} />

      <div className="min-w-0">
        <div className="mx-auto max-w-[880px] px-5 py-12 sm:px-8 lg:px-12">
          {children}

          <div role="group" aria-label={filterLabel} className="mt-8 flex flex-wrap gap-2">
            <FilterPill
              label="all"
              count={totalCount}
              active={!active}
              onClick={() => onFilter(null)}
            />
            {pills.map((pill) => (
              <FilterPill
                key={pill.key}
                label={pill.label}
                count={pill.count}
                active={active === pill.key}
                onClick={() => onFilter(active === pill.key ? null : pill.key)}
              />
            ))}
          </div>

          {groups.length === 0 ? (
            <p className="text-mono-md mt-12 font-mono" style={{ color: "var(--fg-muted)" }}>
              {totalCount === 0 ? empty.all : empty.filtered}
            </p>
          ) : (
            groups.map((group, gi) => (
              <section
                key={group.id}
                id={group.id}
                className="mt-10 border-t pt-8"
                style={{ borderColor: "var(--border-subtle)", scrollMarginTop: 24 }}
              >
                <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2
                    className="m-0"
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontWeight: 400,
                      fontSize: "clamp(24px, 3vw, 32px)",
                      lineHeight: 1.1,
                      letterSpacing: "-0.02em",
                      color: "var(--fg-primary)",
                    }}
                  >
                    {group.label}
                  </h2>
                  <span
                    className="text-mono-sm font-mono tracking-[0.08em] uppercase"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {groupMeta(group)}
                  </span>
                </div>

                {group.subgroups ? (
                  group.subgroups.map((sub, si) => (
                    <div key={sub.id} id={sub.id} style={{ scrollMarginTop: 24 }}>
                      {/* Only earns its own heading once there's more than one — see the note
                          on `subgroups` above. `si > 0` for the top margin, not `first:mt-0`:
                          every subgroup is the first child of its own wrapper div, so
                          `:first-child` matched all of them and the gap between the first
                          and second year never rendered. */}
                      {group.subgroups!.length > 1 && (
                        <h3
                          className={cn(
                            "text-mono-sm mb-3 font-mono tracking-[0.08em] uppercase",
                            si > 0 && "mt-6",
                          )}
                          style={{ color: "var(--fg-muted)" }}
                        >
                          {sub.label}
                        </h3>
                      )}
                      <List
                        list={list}
                        items={sub.items}
                        label={sub.label}
                        render={renderItem}
                        stagger={gi === 0 && si === 0}
                      />
                    </div>
                  ))
                ) : (
                  <List
                    list={list}
                    items={group.items}
                    label={group.label}
                    render={renderItem}
                    stagger={gi === 0}
                  />
                )}
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * The one place a run of cards is drawn, whichever layout the page chose.
 *
 * `stagger` is the entrance's, and it belongs to the first run on the page only — past it
 * every card would be sitting out a delay before an entrance the reader scrolled to on
 * purpose.
 */
function List<T>({
  list,
  items,
  label,
  render,
  stagger,
}: {
  list: React.ComponentProps<typeof FeedShell<T>>["list"]
  items: T[]
  label: string
  render: (item: T, index: number) => React.ReactNode
  stagger: boolean
}) {
  const withIndex = (item: T, i: number) => render(item, stagger ? i : 0)

  if (list.render) return <>{list.render(items, withIndex, label)}</>
  return <div className={list.className}>{items.map(withIndex)}</div>
}
