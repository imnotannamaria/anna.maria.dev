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
 */

import { useId } from "react"
import { motion, useReducedMotion } from "motion/react"
import { PageOutline, type OutlineItem } from "@/components/chrome/page-outline"
import { useUrlFilter } from "@/components/ui/url-filter"
import { EASE_OUT } from "@/components/ui/reveal"
import { TOKEN_GROUPS } from "@/lib/design-tokens"
import { SHOWCASE_LIST, GROUP_LABEL, type ShowcaseEntry } from "@/lib/showcase/registry"
import { ShowcaseFeed, SHOWCASE_GROUPS } from "./showcase-feed"
import { TokensSection, RulesSection } from "./tokens-section"

/** `null` is the components tab, so `/components` needs no query param to mean the default. */
const VIEWS = ["tokens", "rules"] as const
type View = "components" | (typeof VIEWS)[number]

const TABS: { id: View; label: string; meta: (entries: ShowcaseEntry[]) => string }[] = [
  { id: "components", label: "components/", meta: (e) => `${e.length} components` },
  { id: "tokens", label: "tokens.css", meta: () => `${TOKEN_GROUPS.length} groups` },
  { id: "rules", label: "rules.md", meta: () => "do's and don'ts" },
]

/** The rail lists whatever the open tab actually contains — there is nothing else to point at. */
function outlineFor(view: View, entries: ShowcaseEntry[]): OutlineItem[] {
  if (view === "tokens") {
    return [
      { id: "panel-tokens", label: "tokens", level: 1 },
      ...TOKEN_GROUPS.map((g) => ({ id: g.id, label: g.label, level: 2 as const })),
    ]
  }
  if (view === "rules") {
    return [{ id: "panel-rules", label: "rules", level: 1 }]
  }
  return [
    { id: "panel-components", label: "components", level: 1 },
    ...SHOWCASE_GROUPS.filter((g) => entries.some((e) => e.group === g)).map((g) => ({
      id: `group-${g}`,
      label: GROUP_LABEL[g],
      level: 2 as const,
      count: entries.filter((e) => e.group === g).length,
    })),
  ]
}

export function ShowcasePage({ themeCount }: { themeCount: number }) {
  const entries = [...SHOWCASE_LIST]
  const [param, setParam] = useUrlFilter("view", VIEWS, "/components")
  const view: View = param ?? "components"
  const reduce = useReducedMotion() ?? false
  const tablistId = useId()

  const tabs = TABS.map((t) => ({ ...t, meta: t.meta(entries) }))

  /**
   * Arrow keys move between tabs, which is what `role="tablist"` promises. Without this the
   * role is a claim the keyboard does not honour — worse than no role at all.
   */
  function onKeyDown(e: React.KeyboardEvent) {
    const i = tabs.findIndex((t) => t.id === view)
    const next =
      e.key === "ArrowRight"
        ? i + 1
        : e.key === "ArrowLeft"
          ? i - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? tabs.length - 1
              : null
    if (next === null) return
    e.preventDefault()
    const target = tabs[(next + tabs.length) % tabs.length]
    setParam(target.id === "components" ? null : (target.id as (typeof VIEWS)[number]))
    document.getElementById(`${tablistId}-${target.id}`)?.focus()
  }

  return (
    <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 min-[1100px]:grid-cols-[200px_minmax(0,1fr)]">
      <PageOutline
        items={outlineFor(view, entries)}
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
        <div className="mx-auto max-w-[880px] px-5 py-12 sm:px-8 lg:px-12">
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
            The tokens this site is drawn from, and the components built out of them. Every card is
            the real thing running, shown in each state it can actually be in — including the ones
            you only see when something has gone wrong.
          </p>

          {/* The tab strip, in the titlebar's language: squared tabs on a rule, with a brand
              underline that travels to the active one. `layoutId` is what moves it, so the
              underline is one element sliding rather than three fading. */}
          <div
            role="tablist"
            aria-label="Components view"
            onKeyDown={onKeyDown}
            className="-mx-1 mt-8 flex overflow-x-auto border-b"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            {tabs.map((tab) => {
              const isActive = view === tab.id
              return (
                <button
                  key={tab.id}
                  id={`${tablistId}-${tab.id}`}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  // Roving tabindex: one stop for the whole strip, arrows move within it.
                  tabIndex={isActive ? 0 : -1}
                  onClick={() =>
                    setParam(tab.id === "components" ? null : (tab.id as (typeof VIEWS)[number]))
                  }
                  className="text-mono-sm relative shrink-0 cursor-pointer px-3.5 py-2.5 font-mono whitespace-nowrap transition-colors"
                  style={{ color: isActive ? "var(--fg-primary)" : "var(--fg-muted)" }}
                >
                  {tab.label}
                  {isActive && (
                    <motion.span
                      layoutId="showcase-tab-underline"
                      className="absolute inset-x-0 -bottom-px block h-px"
                      style={{ background: "var(--fg-brand)" }}
                      transition={reduce ? { duration: 0 } : { duration: 0.28, ease: EASE_OUT }}
                    />
                  )}
                </button>
              )
            })}

            <span
              className="text-mono-xs ml-auto hidden shrink-0 self-center pr-1 pl-4 font-mono tracking-[0.08em] uppercase sm:block"
              style={{ color: "var(--fg-muted)" }}
            >
              {tabs.find((t) => t.id === view)?.meta}
            </span>
          </div>

          {/* All three panels are in the document. `hidden` is what makes the inactive ones
              invisible *and* zero-area, so their demos never trip a visibility observer. */}
          <div
            id="panel-components"
            role="tabpanel"
            aria-labelledby={`${tablistId}-components`}
            hidden={view !== "components"}
            className="mt-8"
            style={{ scrollMarginTop: 24 }}
          >
            <ShowcaseFeed entries={entries} />
          </div>

          <div
            id="panel-tokens"
            role="tabpanel"
            aria-labelledby={`${tablistId}-tokens`}
            hidden={view !== "tokens"}
            className="mt-8"
            style={{ scrollMarginTop: 24 }}
          >
            <TokensSection themeCount={themeCount} />
          </div>

          <div
            id="panel-rules"
            role="tabpanel"
            aria-labelledby={`${tablistId}-rules`}
            hidden={view !== "rules"}
            className="mt-8"
            style={{ scrollMarginTop: 24 }}
          >
            <RulesSection />
          </div>
        </div>
      </div>
    </div>
  )
}
