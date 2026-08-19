"use client"

/**
 * The showcase grid: the filter row, and one card per component.
 *
 * It is not drawn in `FeedShell`. That shell's own doc comment says what it is — "the shell the
 * three index pages are drawn in: /blog, /projects and /log" — and a tabbed documentation page
 * is not that shape: the rail belongs to the page rather than to this list, and two of the three
 * tabs are not feeds at all. What it does reuse is every *piece* that makes those pages look
 * like this site: `FilterPill`, `.bento-card`, `CardHead`/`CardFoot`, the same section-head
 * rhythm and the same 880px column. Standardization is about the vocabulary, not about routing
 * a different problem through one component.
 */

import { CardFoot, CardHead } from "@/components/ui/card-parts"
import { ArrowLink } from "@/components/ui/arrow-link"
import { FilterPill, useUrlFilter } from "@/components/ui/url-filter"
import { GROUP_LABEL, type ShowcaseEntry } from "@/lib/showcase/registry"
import { sourceUrl } from "@/lib/showcase/source"
import { StateCarousel } from "./state-carousel"

export const SHOWCASE_GROUPS = ["home", "about", "shared"] as const

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

export function ShowcaseFeed({ entries }: { entries: ShowcaseEntry[] }) {
  // useUrlFilter, never useSearchParams: on a statically rendered route the latter makes
  // prerender emit the nearest Suspense fallback, and every card would be missing from the HTML
  // a crawler reads — on the one tab whose job is listing components.
  const [active, setFilter] = useUrlFilter("where", SHOWCASE_GROUPS, "/components")

  const visible = active ? entries.filter((e) => e.group === active) : entries

  const pills = SHOWCASE_GROUPS.map((g) => ({
    key: g,
    label: GROUP_LABEL[g],
    count: entries.filter((e) => e.group === g).length,
  })).filter((p) => p.count > 0)

  return (
    <div>
      <div role="group" aria-label="Filter by page" className="flex flex-wrap gap-2">
        <FilterPill
          label="all"
          count={entries.length}
          active={!active}
          onClick={() => setFilter(null)}
        />
        {pills.map((pill) => (
          <FilterPill
            key={pill.key}
            label={pill.label}
            count={pill.count}
            active={active === pill.key}
            onClick={() => setFilter(active === pill.key ? null : pill.key)}
          />
        ))}
      </div>

      {SHOWCASE_GROUPS.filter((g) => visible.some((e) => e.group === g)).map((group) => {
        const items = visible.filter((e) => e.group === group)
        return (
          <section
            key={group}
            id={`group-${group}`}
            className="mt-10 border-t pt-8"
            style={{ borderColor: "var(--border-subtle)", scrollMarginTop: 24 }}
          >
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3
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
                {GROUP_LABEL[group]}
              </h3>
              <span
                className="text-mono-sm font-mono tracking-[0.08em] uppercase"
                style={{ color: "var(--fg-muted)" }}
              >
                {items.length} {items.length === 1 ? "component" : "components"}
              </span>
            </div>

            <div className="flex flex-col gap-6">
              {items.map((entry) => (
                <ShowcaseCard key={entry.slug} entry={entry} />
              ))}
            </div>
          </section>
        )
      })}

      {visible.length === 0 && (
        <p className="text-mono-md mt-12 font-mono" style={{ color: "var(--fg-muted)" }}>
          {entries.length === 0 ? "nothing documented yet." : "nothing on that page yet."}
        </p>
      )}
    </div>
  )
}
