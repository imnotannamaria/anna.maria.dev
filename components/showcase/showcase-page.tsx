"use client"

/**
 * `/components`, in three tabs.
 *
 * It was one column: seven token groups, a rules list, and seven live demos, all stacked. That
 * is a page you scroll past rather than read, and the three things on it are genuinely
 * different questions — what the site is drawn from, what is built from it, and what not to do.
 * Tabs are the editor's own answer to that, and this site is an editor.
 *
 * **Every panel is rendered; the inactive ones carry `hidden`.** Not conditional rendering —
 * that would put two thirds of the page's prose outside the HTML a crawler reads, on a page
 * whose whole job is documentation. `hidden` is `display: none`, so the hidden panels also have
 * no boxes, which means the demos' visibility observers never fire and their chunks are never
 * requested until you actually open that tab. The SEO answer and the performance answer turn
 * out to be the same answer.
 *
 * The active tab lives in the URL through `useUrlFilter`, like every other choice on this site,
 * so a tab is linkable and the back button steps through them. `/components` with no param is
 * the components tab, which keeps the canonical URL clean.
 *
 * **The strip is the titlebar's own `TabStrip`.** The first attempt traced the idea badly —
 * muted labels on a hairline, no icons, no ×, and the accent on the top edge — which is two tab
 * rows in one product that do not match. It is literally the same component now: the same icons
 * that fill and take the brand colour when active, the same travelling underline along the
 * bottom, the same ×, the same fade-edged scroller. Closing a tab here returns to the default
 * one, which is where "close" leads when there is no route to go back to.
 */

import { useId, useMemo } from "react"
import type { Icon } from "@phosphor-icons/react"
import { ListChecksIcon, PaletteIcon, SwatchesIcon } from "@phosphor-icons/react"
import { TabStrip } from "@/components/chrome/tab-strip"
import { PageOutline, type OutlineItem } from "@/components/chrome/page-outline"
import { useUrlFilter } from "@/components/ui/url-filter"
import { TOKEN_GROUPS } from "@/lib/design-tokens"
import { SHOWCASE_LIST, GROUP_LABEL, type ShowcaseEntry } from "@/lib/showcase/registry"
import { ShowcaseFeed, SHOWCASE_GROUPS } from "./showcase-feed"
import { TokensSection, RulesSection } from "./tokens-section"

/** `null` is the components tab, so `/components` needs no query param to mean the default. */
const VIEWS = ["tokens", "rules"] as const
type View = "components" | (typeof VIEWS)[number]

const TABS: {
  id: View
  label: string
  icon: Icon
  meta: (entries: ShowcaseEntry[]) => string
}[] = [
  {
    id: "components",
    label: "components/",
    icon: SwatchesIcon,
    meta: (e) => `${e.length} components`,
  },
  {
    id: "tokens",
    label: "tokens.css",
    icon: PaletteIcon,
    meta: () => `${TOKEN_GROUPS.length} groups`,
  },
  { id: "rules", label: "rules.md", icon: ListChecksIcon, meta: () => "do's and don'ts" },
]

/**
 * The rail lists whatever the open tab actually contains — there is nothing else to point at.
 *
 * `where` is the components tab's page filter, and the rail has to honour it: the filter hides
 * whole groups, so a rail built from the unfiltered list offered `home/` and `shared/` rows on
 * `/components?where=about` whose anchors were no longer in the document. They never
 * highlighted and clicking them did nothing.
 */
function outlineFor(
  view: View,
  entries: ShowcaseEntry[],
  where: (typeof SHOWCASE_GROUPS)[number] | null,
): OutlineItem[] {
  if (view === "tokens") {
    return [
      { id: "panel-tokens", label: "tokens", level: 1 },
      ...TOKEN_GROUPS.map((g) => ({ id: g.id, label: g.label, level: 2 as const })),
    ]
  }
  if (view === "rules") {
    return [{ id: "panel-rules", label: "rules", level: 1 }]
  }
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

export function ShowcasePage({ themeCount }: { themeCount: number }) {
  const [param, setParam] = useUrlFilter("view", VIEWS, "/components")
  const view: View = param ?? "components"

  /**
   * The same filter `ShowcaseFeed` owns, read a second time rather than lifted.
   *
   * `useUrlFilter` is a `useSyncExternalStore` over the URL, so two readers of one param are
   * one source of truth — they cannot disagree. Threading it down as a prop would mean the
   * feed no longer owns its own filter, for a rail that only needs to read it.
   */
  const [where] = useUrlFilter("where", SHOWCASE_GROUPS, "/components")
  const tablistId = useId()

  // Both memoised, and the outline one is not a micro-optimisation: `PageOutline` keys its
  // IntersectionObserver on `items`, and an observer fires the moment you `observe()` something
  // already on screen. A fresh array each render meant observe → setActive → render → new array
  // → tear down → observe → … a loop that left every row stuck on its `initial` variant, which
  // is a rail of invisible links. `PageOutline` now guards against this itself; memoising here
  // is the other half.
  const entries = useMemo(() => [...SHOWCASE_LIST], [])
  const outline = useMemo(() => outlineFor(view, entries, where), [view, entries, where])
  const meta = TABS.find((t) => t.id === view)?.meta(entries)

  const select = (id: View) => setParam(id === "components" ? null : (id as (typeof VIEWS)[number]))

  /**
   * Arrow keys move between tabs, which is what `role="tablist"` promises. Without this the
   * role is a claim the keyboard does not honour — worse than no role at all.
   */
  function onKeyDown(e: React.KeyboardEvent) {
    const i = TABS.findIndex((t) => t.id === view)
    const next =
      e.key === "ArrowRight"
        ? i + 1
        : e.key === "ArrowLeft"
          ? i - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? TABS.length - 1
              : null
    if (next === null) return
    e.preventDefault()
    const target = TABS[(next + TABS.length) % TABS.length]
    select(target.id)
    document.getElementById(`${tablistId}-${target.id}`)?.focus()
  }

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
            panel's, the stage's, and then the card's own. Two units here is 16px back, which
            is 5% of the component's width. */}
        <div className="mx-auto max-w-[880px] px-3 py-12 sm:px-8 lg:px-12">
          <h1
            className="text-display-md m-0"
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              color: "var(--fg-primary)",
            }}
          >
            Components
          </h1>
          <p
            className="text-body-lg mt-3 max-w-[62ch] font-sans"
            style={{ color: "var(--fg-secondary)" }}
          >
            The tokens this site is drawn from, and the components built out of them. Every card
            here is the real thing running, in each state it can actually be in. That includes the
            states you only see when something has gone wrong.
          </p>

          <TabStrip
            role="tablist"
            label="Components view"
            layoutId="showcase-active-tab"
            activeSurface="var(--bg-card)"
            onKeyDown={onKeyDown}
            className="mt-10 border-b border-[var(--border-subtle)]"
            tabs={TABS.map((tab) => ({
              key: tab.id,
              id: `${tablistId}-${tab.id}`,
              name: tab.label,
              icon: tab.icon,
              active: view === tab.id,
              controls: `panel-${tab.id}`,
              onSelect: () => select(tab.id),
              // Closing a panel tab has nowhere to navigate, so it returns to the default one —
              // which is what the × means here.
              onClose: tab.id === "components" ? undefined : () => select("components"),
            }))}
          >
            <span
              className="text-mono-xs hidden shrink-0 self-center pr-2 pl-4 font-mono tracking-[0.08em] whitespace-nowrap uppercase sm:block"
              style={{ color: "var(--fg-muted)" }}
            >
              {meta}
            </span>
          </TabStrip>

          {/* The panel. One surface for all three tabs, so switching does not change the box —
              only what is inside it. All three are in the document with the inactive ones
              `hidden`: conditional rendering would put two thirds of the prose outside the HTML
              a crawler reads, and `hidden` is `display: none`, so those panels also have no
              boxes and their demos never trip a visibility observer. */}
          <div
            // Almost no side padding on a phone: the stage inside already draws its own inset
            // frame, so a second gutter here only narrows the component for nothing.
            className="px-1.5 py-8 sm:px-6"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderTop: "none",
              borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
            }}
          >
            <div
              id="panel-components"
              role="tabpanel"
              aria-labelledby={`${tablistId}-components`}
              hidden={view !== "components"}
              style={{ scrollMarginTop: 24 }}
            >
              <ShowcaseFeed entries={entries} />
            </div>

            <div
              id="panel-tokens"
              role="tabpanel"
              aria-labelledby={`${tablistId}-tokens`}
              hidden={view !== "tokens"}
              style={{ scrollMarginTop: 24 }}
            >
              <TokensSection themeCount={themeCount} />
            </div>

            <div
              id="panel-rules"
              role="tabpanel"
              aria-labelledby={`${tablistId}-rules`}
              hidden={view !== "rules"}
              style={{ scrollMarginTop: 24 }}
            >
              <RulesSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
