"use client"

/**
 * The showcase list: one specimen per component, meta on the left and the demo on the right.
 *
 * **No card wraps an entry.** It used to be a `.bento-card` containing a `.bento-card` — a frame
 * inside a frame, the thing CLAUDE.md explicitly exempts `/piano` from — and that is precisely
 * why the demo did not read first: it was boxed inside something identical to itself. Now the
 * component's own card is the only card in the entry, and it sits on a recessed stage so it
 * rises out of the page instead of nesting into it.
 *
 * The meta column carries everything that is *about* the component — name, blurb, which states
 * it has, where to read more — at a quieter weight than the specimen beside it. Hierarchy is
 * made as much by suppressing the secondary as by promoting the primary, and here the primary is
 * the running component.
 *
 * It is not drawn in `FeedShell`. That shell's own comment says what it is — "the shell the three
 * index pages are drawn in" — and this is not that shape. What it reuses is every *piece* that
 * makes those pages look like this site: `FilterPill`, `CardHead`/`CardFoot`, the same
 * section-head rhythm. Standardization is about the vocabulary, not about routing a different
 * problem through one component.
 */

import { useState } from "react"
import { ArrowLink } from "@/components/ui/arrow-link"
import { FilterPill, useUrlFilter } from "@/components/ui/url-filter"
import {
  HouseLineIcon,
  ShareNetworkIcon,
  SquaresFourIcon,
  UserSquareIcon,
  type Icon,
} from "@phosphor-icons/react"
import { GROUP_LABEL, type ShowcaseEntry } from "@/lib/showcase/registry"
import { sourceUrl } from "@/lib/showcase/source"
import { defaultState, type CardStateKind } from "@/lib/showcase/state"
import { DemoStage, StateList } from "./demo-viewer"

export const SHOWCASE_GROUPS = ["home", "about", "shared"] as const

/** The same glyph the sidebar uses for the same place, so a filter names somewhere real. */
const GROUP_ICON: Record<(typeof SHOWCASE_GROUPS)[number], Icon> = {
  home: HouseLineIcon,
  about: UserSquareIcon,
  shared: ShareNetworkIcon,
}

/** Roughly how tall each demo ends up, so the stage reserves the right box before it mounts. */
const MIN_HEIGHT: Record<string, number> = {
  tree: 440,
  stack: 360,
  playlist: 260,
  piano: 280,
  contributions: 260,
  "stack-graph": 480,
  wristkit: 460,
}

function Specimen({ entry }: { entry: ShowcaseEntry }) {
  const [active, setActive] = useState<CardStateKind>(defaultState(entry.states))

  return (
    <article className="grid grid-cols-1 gap-x-6 gap-y-4 min-[900px]:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
      {/* ── meta ── */}
      <div className="min-w-0">
        <h4
          className="text-heading-lg m-0 font-serif leading-tight font-normal"
          style={{ color: "var(--fg-primary)" }}
        >
          {entry.name}
        </h4>

        <p className="text-body-md mt-2 font-sans" style={{ color: "var(--fg-secondary)" }}>
          {entry.blurb}
        </p>

        <div className="mt-4">
          <StateList
            states={entry.states}
            active={active}
            onSelect={setActive}
            label={entry.name}
          />
        </div>

        <div
          className="text-mono-xs mt-4 flex flex-col gap-1.5 pt-3 font-mono"
          style={{ borderTop: "1px dashed var(--border-subtle)", color: "var(--fg-muted)" }}
        >
          <div className="flex flex-wrap justify-between gap-x-3">
            <span>{"// used on"}</span>
            <span style={{ color: "var(--fg-secondary)" }}>{entry.where.join(" · ")}</span>
          </div>

          <ArrowLink href={sourceUrl(entry.source)} external className="text-mono-xs">
            source
          </ArrowLink>

          {entry.external ? (
            <ArrowLink href={entry.external.href} external className="text-mono-xs">
              {entry.external.label}
            </ArrowLink>
          ) : (
            <ArrowLink href={`/components/${entry.slug}`} className="text-mono-xs">
              read the doc
            </ArrowLink>
          )}
        </div>
      </div>

      {/* ── the specimen ── */}
      <DemoStage
        slug={entry.slug}
        name={entry.name}
        active={active}
        minHeight={MIN_HEIGHT[entry.slug] ?? 260}
        className="min-w-0"
      />
    </article>
  )
}

export function ShowcaseFeed({ entries }: { entries: ShowcaseEntry[] }) {
  // useUrlFilter, never useSearchParams: on a statically rendered route the latter makes
  // prerender emit the nearest Suspense fallback, and every specimen would be missing from the
  // HTML a crawler reads — on the one tab whose job is listing components.
  const [active, setFilter] = useUrlFilter("where", SHOWCASE_GROUPS, "/components")

  const visible = active ? entries.filter((e) => e.group === active) : entries

  const pills = SHOWCASE_GROUPS.map((g) => ({
    key: g,
    label: GROUP_LABEL[g],
    icon: GROUP_ICON[g],
    count: entries.filter((e) => e.group === g).length,
  })).filter((p) => p.count > 0)

  return (
    <div>
      <div role="group" aria-label="Filter by page" className="flex flex-wrap gap-2">
        <FilterPill
          label="all"
          icon={SquaresFourIcon}
          count={entries.length}
          active={!active}
          onClick={() => setFilter(null)}
        />
        {pills.map((pill) => (
          <FilterPill
            key={pill.key}
            label={pill.label}
            icon={pill.icon}
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
            className="mt-12"
            style={{ scrollMarginTop: 24 }}
          >
            <div
              className="mb-8 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b pb-2"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              {/* A quiet label, not a headline. The group is scaffolding for scanning; the
                  specimens under it are the content. */}
              <h3
                className="text-mono-sm m-0 font-mono tracking-[0.08em] uppercase"
                style={{ color: "var(--fg-secondary)" }}
              >
                {GROUP_LABEL[group]}
              </h3>
              <span
                className="text-mono-xs font-mono tracking-[0.08em] uppercase"
                style={{ color: "var(--fg-muted)" }}
              >
                {items.length} {items.length === 1 ? "component" : "components"}
              </span>
            </div>

            {/* A hairline between specimens rather than a card around each: with the meta
                column giving every entry its own left edge, a rule is enough to say where one
                ends. Delete the borders first, add back only what separation genuinely needs. */}
            <div className="flex flex-col">
              {items.map((entry, i) => (
                <div
                  key={entry.slug}
                  className={i === 0 ? "" : "mt-10 border-t pt-10"}
                  style={i === 0 ? undefined : { borderColor: "var(--border-subtle)" }}
                >
                  <Specimen entry={entry} />
                </div>
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
