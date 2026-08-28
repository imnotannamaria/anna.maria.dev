"use client"

/**
 * DISCOVERY — disposable. Delete this folder once a direction is picked.
 *
 * Three complaints, three sets of live options. Everything below uses the real tokens, the real
 * type scale and real demos, so what you pick is what lands.
 *
 * The diagnosis behind each set, from the hierarchy reference:
 *
 * 1. THE TABS don't read as tabs because nothing about them is a *surface*. Three muted mono
 *    labels on a hairline, with a 1px underline — that is "too faint", and the fix for too faint
 *    is more weight, not more contrast. Tabs also need to look like they *hold* the thing below.
 *
 * 2. THE STATES are drawn with `FilterPill`, which is the filter vocabulary. On the components
 *    tab that puts pills inside pills, and the reader has to work out that one row filters a
 *    list and the other switches a preview. States also carry meaning — error, empty, loading —
 *    and none of it is encoded.
 *
 * 3. THE COMPONENT CARDS are a `.bento-card` containing a `.bento-card`. Frame inside a frame,
 *    which CLAUDE.md already calls out for the piano. And the blurb, the controls and the demo
 *    all have the same weight, so nothing reads first. The demo is the primary; everything else
 *    is scaffolding and should be quieter.
 */

import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { EASE_OUT } from "@/components/ui/reveal"
import { Diamond } from "@/components/ui/diamond"
import { renderDemo } from "@/components/showcase/demos"
import type { CardStateKind } from "@/lib/showcase/state"

// ─── Shared bits ──────────────────────────────────────────────────────────────

/**
 * What each state *means*, as colour plus a word. Never colour alone — that is the
 * "colour independence" item on the review checklist.
 */
const STATE_TONE: Record<CardStateKind, string> = {
  loading: "var(--status-info-fg)",
  empty: "var(--fg-muted)",
  error: "var(--status-error-fg)",
  stale: "var(--status-warning-fg)",
  ok: "var(--status-success-fg)",
}

/**
 * The recessed surface a demo sits on. `--bg-canvas` is darker than `--bg-card` in dark mode
 * (#09090b vs #0b0b0e) *and* in light mode (#fafafa vs #ffffff), so "inset" reads in both
 * without inventing a token.
 */
const STAGE: React.CSSProperties = {
  background: "var(--bg-canvas)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
}

function Option({
  id,
  title,
  gets,
  costs,
  children,
}: {
  id: string
  title: string
  gets: string
  costs: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-10">
      <div
        className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b pb-2"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <span className="text-mono-sm font-mono" style={{ color: "var(--fg-brand)" }}>
          {id}
        </span>
        <h3
          className="text-heading-md m-0 font-serif font-normal"
          style={{ color: "var(--fg-primary)" }}
        >
          {title}
        </h3>
      </div>
      {children}
      <dl className="text-mono-xs mt-3 flex flex-col gap-1 font-mono">
        <div className="flex gap-2">
          <dt style={{ color: "var(--fg-brand)" }}>+</dt>
          <dd style={{ color: "var(--fg-secondary)", margin: 0 }}>{gets}</dd>
        </div>
        <div className="flex gap-2">
          <dt style={{ color: "var(--fg-muted)" }}>−</dt>
          <dd style={{ color: "var(--fg-muted)", margin: 0 }}>{costs}</dd>
        </div>
      </dl>
    </section>
  )
}

const TABS = [
  { id: "components", label: "components/", meta: "7 components" },
  { id: "tokens", label: "tokens.css", meta: "7 groups" },
  { id: "rules", label: "rules.md", meta: "do's and don'ts" },
]

// ─── A · the tab strip ────────────────────────────────────────────────────────

/** A1 — segmented control. A recessed track with the active tab raised out of it. */
function TabsSegmented() {
  const [active, setActive] = useState("components")
  const reduce = useReducedMotion() ?? false
  return (
    <div
      className="inline-flex gap-1 rounded-[var(--radius-md)] p-1"
      style={{ background: "var(--bg-canvas)", border: "1px solid var(--border-subtle)" }}
    >
      {TABS.map((t) => {
        const on = active === t.id
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className="text-mono-sm relative cursor-pointer rounded-[var(--radius-sm)] px-3.5 py-2 font-mono whitespace-nowrap"
            style={{ color: on ? "var(--fg-primary)" : "var(--fg-muted)" }}
          >
            {on && (
              <motion.span
                layoutId="seg"
                className="absolute inset-0 rounded-[var(--radius-sm)]"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-strong)",
                  boxShadow: "0 1px 2px rgba(0,0,0,.35)",
                }}
                transition={reduce ? { duration: 0 } : { duration: 0.24, ease: EASE_OUT }}
              />
            )}
            <span className="relative">{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/** A2 — editor tabs. The active one is the same surface as the panel and joins it. */
function TabsEditor({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState("components")
  return (
    <div>
      <div
        className="flex overflow-x-auto"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        {TABS.map((t) => {
          const on = active === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className="text-mono-sm relative shrink-0 cursor-pointer px-4 py-2.5 font-mono whitespace-nowrap transition-colors"
              style={{
                color: on ? "var(--fg-primary)" : "var(--fg-muted)",
                background: on ? "var(--bg-card)" : "transparent",
                borderTop: on ? "2px solid var(--fg-brand)" : "2px solid transparent",
                borderLeft: on ? "1px solid var(--border-subtle)" : "1px solid transparent",
                borderRight: on ? "1px solid var(--border-subtle)" : "1px solid transparent",
                // The active tab eats the strip's own bottom rule, so it reads as joined to
                // the panel rather than sitting on a shelf above it.
                marginBottom: -1,
                borderBottom: on ? "1px solid var(--bg-card)" : "1px solid transparent",
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      <div
        className="p-5"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderTop: "none",
          borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
        }}
      >
        {children}
      </div>
    </div>
  )
}

/** A3 — the current shape, with the faintness fixed. */
function TabsUnderline() {
  const [active, setActive] = useState("components")
  const reduce = useReducedMotion() ?? false
  return (
    <div
      className="flex overflow-x-auto"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      {TABS.map((t) => {
        const on = active === t.id
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className="text-mono-md relative shrink-0 cursor-pointer px-4 pt-1 pb-3 font-mono whitespace-nowrap transition-colors hover:text-(--fg-secondary)"
            style={{ color: on ? "var(--fg-primary)" : "var(--fg-muted)" }}
          >
            {t.label}
            {on && (
              <motion.span
                layoutId="ul"
                className="absolute inset-x-2 -bottom-px block"
                style={{ height: 2, background: "var(--fg-brand)" }}
                transition={reduce ? { duration: 0 } : { duration: 0.26, ease: EASE_OUT }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── B · the state switcher ───────────────────────────────────────────────────

const DEMO_SLUG = "playlist"
const DEMO_STATES: CardStateKind[] = ["ok", "loading", "empty", "error"]

/** B1 — segmented, with a dot carrying the state's meaning. */
function StatesSegmented() {
  const [s, setS] = useState<CardStateKind>("ok")
  const reduce = useReducedMotion() ?? false
  return (
    <div>
      <div
        className="inline-flex gap-0.5 rounded-[var(--radius-md)] p-1"
        style={{ background: "var(--bg-canvas)", border: "1px solid var(--border-subtle)" }}
      >
        {DEMO_STATES.map((k) => {
          const on = s === k
          return (
            <button
              key={k}
              type="button"
              onClick={() => setS(k)}
              className="text-mono-sm relative flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-1.5 font-mono"
              style={{ color: on ? "var(--fg-primary)" : "var(--fg-muted)" }}
            >
              {on && (
                <motion.span
                  layoutId="stateseg"
                  className="absolute inset-0 rounded-[var(--radius-sm)]"
                  style={{ background: "var(--bg-surface)" }}
                  transition={reduce ? { duration: 0 } : { duration: 0.22, ease: EASE_OUT }}
                />
              )}
              <span
                aria-hidden
                className="relative block rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  background: STATE_TONE[k],
                  opacity: on ? 1 : 0.45,
                }}
              />
              <span className="relative">{k}</span>
            </button>
          )
        })}
      </div>
      <div className="mt-4 p-4" style={STAGE}>
        {renderDemo(DEMO_SLUG, s)}
      </div>
    </div>
  )
}

/** B2 — a preview window: the stage gets a chrome bar and the states live in it. */
function StatesChrome() {
  const [s, setS] = useState<CardStateKind>("ok")
  return (
    <div style={STAGE} className="overflow-hidden">
      <div
        className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--bg-chrome)",
        }}
      >
        <span className="text-mono-xs flex items-center gap-1.5 font-mono">
          <Diamond />
          <span style={{ color: "var(--fg-secondary)" }}>sleeve-card.tsx</span>
        </span>
        <div className="flex gap-0.5">
          {DEMO_STATES.map((k) => {
            const on = s === k
            return (
              <button
                key={k}
                type="button"
                onClick={() => setS(k)}
                className="text-mono-xs flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 font-mono transition-colors"
                style={{
                  color: on ? "var(--fg-primary)" : "var(--fg-muted)",
                  background: on ? "var(--bg-surface-elevated)" : "transparent",
                }}
              >
                <span
                  aria-hidden
                  className="block rounded-full"
                  style={{
                    width: 5,
                    height: 5,
                    background: STATE_TONE[k],
                    opacity: on ? 1 : 0.4,
                  }}
                />
                {k}
              </button>
            )
          })}
        </div>
      </div>
      <div className="p-4">{renderDemo(DEMO_SLUG, s)}</div>
    </div>
  )
}

/** B3 — states as a rail down the side, demo beside them. */
function StatesRail() {
  const [s, setS] = useState<CardStateKind>("ok")
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="flex shrink-0 flex-row gap-1 sm:w-30 sm:flex-col">
        {DEMO_STATES.map((k) => {
          const on = s === k
          return (
            <button
              key={k}
              type="button"
              onClick={() => setS(k)}
              className="text-mono-sm flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left font-mono transition-colors"
              style={{
                color: on ? "var(--fg-primary)" : "var(--fg-muted)",
                background: on ? "var(--bg-surface-elevated)" : "transparent",
                borderLeft: `2px solid ${on ? STATE_TONE[k] : "transparent"}`,
              }}
            >
              {k}
            </button>
          )
        })}
      </div>
      <div className="min-w-0 flex-1 p-4" style={STAGE}>
        {renderDemo(DEMO_SLUG, s)}
      </div>
    </div>
  )
}

// ─── C · the component entry ──────────────────────────────────────────────────

const ENTRY = {
  name: "me, as a playlist",
  blurb: "A record half out of its sleeve, turning while it plays.",
  source: "components/spotify/sleeve-card.tsx",
  where: "/",
}

/** C1 — no outer card at all. Header is page text; only the demo has a surface. */
function EntryBare() {
  const [s, setS] = useState<CardStateKind>("ok")
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h4
          className="text-heading-lg m-0 font-serif font-normal"
          style={{ color: "var(--fg-primary)" }}
        >
          {ENTRY.name}
        </h4>
        <span className="text-mono-xs font-mono" style={{ color: "var(--fg-muted)" }}>
          {ENTRY.where}
        </span>
      </div>
      <p
        className="text-body-md mt-0 mb-4 max-w-[58ch] font-sans"
        style={{ color: "var(--fg-secondary)" }}
      >
        {ENTRY.blurb}
      </p>
      <div className="mb-3 flex gap-0.5">
        {DEMO_STATES.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setS(k)}
            className="text-mono-xs flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 font-mono"
            style={{
              color: s === k ? "var(--fg-primary)" : "var(--fg-muted)",
              background: s === k ? "var(--bg-surface-elevated)" : "transparent",
            }}
          >
            <span
              aria-hidden
              className="block rounded-full"
              style={{ width: 5, height: 5, background: STATE_TONE[k], opacity: s === k ? 1 : 0.4 }}
            />
            {k}
          </button>
        ))}
      </div>
      <div className="p-4" style={STAGE}>
        {renderDemo(DEMO_SLUG, s)}
      </div>
      <div
        className="text-mono-xs mt-3 flex flex-wrap justify-between gap-2 font-mono"
        style={{ color: "var(--fg-muted)" }}
      >
        <span>{`// ${ENTRY.source}`}</span>
        <span style={{ color: "var(--fg-brand)" }}>source ↗ · read →</span>
      </div>
    </div>
  )
}

/** C2 — the whole entry is one preview window: chrome bar, stage, footer. */
function EntryWindow() {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h4
          className="text-heading-lg m-0 font-serif font-normal"
          style={{ color: "var(--fg-primary)" }}
        >
          {ENTRY.name}
        </h4>
        <span className="text-mono-xs font-mono" style={{ color: "var(--fg-muted)" }}>
          {ENTRY.where}
        </span>
      </div>
      <p
        className="text-body-md mt-0 mb-4 max-w-[58ch] font-sans"
        style={{ color: "var(--fg-secondary)" }}
      >
        {ENTRY.blurb}
      </p>
      <StatesChrome />
      <div
        className="text-mono-xs mt-3 flex flex-wrap justify-between gap-2 font-mono"
        style={{ color: "var(--fg-muted)" }}
      >
        <span>{`// ${ENTRY.source}`}</span>
        <span style={{ color: "var(--fg-brand)" }}>source ↗ · read →</span>
      </div>
    </div>
  )
}

/** C3 — meta left, demo right, once there is room for two columns. */
function EntrySplit() {
  const [s, setS] = useState<CardStateKind>("ok")
  return (
    <div className="grid grid-cols-1 gap-6 min-[900px]:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
      <div>
        <h4
          className="text-heading-lg m-0 font-serif font-normal"
          style={{ color: "var(--fg-primary)" }}
        >
          {ENTRY.name}
        </h4>
        <p className="text-body-md mt-2 font-sans" style={{ color: "var(--fg-secondary)" }}>
          {ENTRY.blurb}
        </p>
        <div className="mt-4 flex flex-col gap-0.5">
          {DEMO_STATES.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setS(k)}
              className="text-mono-sm flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1 text-left font-mono"
              style={{
                color: s === k ? "var(--fg-primary)" : "var(--fg-muted)",
                background: s === k ? "var(--bg-surface-elevated)" : "transparent",
              }}
            >
              <span
                aria-hidden
                className="block rounded-full"
                style={{
                  width: 5,
                  height: 5,
                  background: STATE_TONE[k],
                  opacity: s === k ? 1 : 0.4,
                }}
              />
              {k}
            </button>
          ))}
        </div>
        <div
          className="text-mono-xs mt-4 flex flex-col gap-1 pt-3 font-mono"
          style={{ borderTop: "1px dashed var(--border-subtle)", color: "var(--fg-muted)" }}
        >
          <span style={{ color: "var(--fg-brand)" }}>source ↗</span>
          <span style={{ color: "var(--fg-brand)" }}>read the doc →</span>
        </div>
      </div>
      <div className="min-w-0 p-4" style={STAGE}>
        {renderDemo(DEMO_SLUG, s)}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ShowcaseUiDiscovery() {
  const [narrow, setNarrow] = useState(false)

  return (
    <div className="mx-auto w-full max-w-[1160px] px-6 py-10">
      <h1
        className="text-display-md m-0 font-serif font-normal"
        style={{ color: "var(--fg-primary)" }}
      >
        /components — UI options
      </h1>
      <p className="text-mono-sm mt-2 font-mono" style={{ color: "var(--fg-muted)" }}>
        {"// discovery. disposable. everything below is live — click it."}
      </p>

      <button
        type="button"
        onClick={() => setNarrow((n) => !n)}
        aria-pressed={narrow}
        className="text-mono-sm mt-6 inline-flex h-8 cursor-pointer items-center rounded-md border px-3 font-mono"
        style={{
          borderColor: narrow ? "var(--fg-brand)" : "var(--border-subtle)",
          color: narrow ? "var(--fg-brand-on-tint)" : "var(--fg-muted)",
          background: narrow ? "var(--bg-surface-brand)" : "transparent",
        }}
      >
        {narrow ? "375px phone" : "full width"}
      </button>

      <div style={{ width: narrow ? 320 : "100%", maxWidth: "100%" }}>
        {/* ── A ────────────────────────────────────────────────────────── */}
        <h2
          className="text-heading-lg mt-14 font-serif font-normal"
          style={{ color: "var(--fg-primary)" }}
        >
          A · the tab strip
        </h2>
        <p
          className="text-body-md mt-1 max-w-[62ch] font-sans"
          style={{ color: "var(--fg-muted)" }}
        >
          The current one is three muted labels on a hairline with a 1px underline. That is the
          &ldquo;too faint&rdquo; case, and the fix for too faint is more weight, not more colour.
        </p>

        <Option
          id="A1"
          title="Segmented control"
          gets="Unmistakably a switcher — a recessed track with one chip raised out of it. Reads at a glance, and at 375px."
          costs="Generic. It is the iOS/Linear control, not this site's editor language."
        >
          <TabsSegmented />
        </Option>

        <Option
          id="A2"
          title="Editor tabs"
          gets="The active tab is the same surface as the panel and joins it, with a brand top-line. It is the titlebar's own language, one level down."
          costs="Two tab strips on screen at once — this one and the real titlebar above it."
        >
          <TabsEditor>
            <p className="text-mono-sm m-0 font-mono" style={{ color: "var(--fg-muted)" }}>
              {"// the panel is the tab's own surface, so the two read as one object"}
            </p>
          </TabsEditor>
        </Option>

        <Option
          id="A3"
          title="Underline, fixed"
          gets="Smallest change from today: 14px instead of 12, a 2px rule instead of 1px, real hover, active in primary."
          costs="Still the weakest signal of the three — an underline is a smaller cue than a surface."
        >
          <TabsUnderline />
        </Option>

        {/* ── B ────────────────────────────────────────────────────────── */}
        <h2
          className="text-heading-lg mt-16 font-serif font-normal"
          style={{ color: "var(--fg-primary)" }}
        >
          B · how a state is chosen
        </h2>
        <p
          className="text-body-md mt-1 max-w-[62ch] font-sans"
          style={{ color: "var(--fg-muted)" }}
        >
          Today it borrows <code className="font-mono">FilterPill</code>, which is the filter
          vocabulary — so on the components tab there are pills inside pills. And the states carry
          meaning that nothing encodes. All three below add a dot, never colour alone.
        </p>

        <Option
          id="B1"
          title="Segmented, with a state dot"
          gets="One control, clearly not a filter. The dot gives error / empty / ok a colour without the label going away."
          costs="Wide with five states — wristkit has five and it wraps on a phone."
        >
          <StatesSegmented />
        </Option>

        <Option
          id="B2"
          title="Preview window"
          gets="The demo sits in a viewer with a chrome bar carrying the file name and the states. Strongest 'this is a specimen, not the page' signal."
          costs="More chrome. The bar competes a little with the demo's own CardHead."
        >
          <StatesChrome />
        </Option>

        <Option
          id="B3"
          title="Side rail"
          gets="Vertical list, so five states cost no horizontal room. The active one is marked by a coloured edge."
          costs="Eats ~120px of demo width, which is a lot at 880px, and stacks back to a row on a phone anyway."
        >
          <StatesRail />
        </Option>

        {/* ── C ────────────────────────────────────────────────────────── */}
        <h2
          className="text-heading-lg mt-16 font-serif font-normal"
          style={{ color: "var(--fg-primary)" }}
        >
          C · how a component is presented
        </h2>
        <p
          className="text-body-md mt-1 max-w-[62ch] font-sans"
          style={{ color: "var(--fg-muted)" }}
        >
          Today each entry is a <code className="font-mono">.bento-card</code> containing a{" "}
          <code className="font-mono">.bento-card</code> — a frame inside a frame, which is the
          thing <code className="font-mono">/piano</code> is explicitly exempt from. All three below
          drop the outer card and put the demo on a recessed stage instead, so the component is the
          only thing on the screen wearing a card.
        </p>

        <Option
          id="C1"
          title="Bare — header, stage, footer"
          gets="Fewest boxes on the page. The demo is the only card, so it reads first. Border budget: near zero."
          costs="Where one entry ends and the next begins is carried by spacing alone."
        >
          <EntryBare />
        </Option>

        <Option
          id="C2"
          title="Window — the entry is a specimen viewer"
          gets="Every entry looks like a component under glass. The chrome bar earns its place by holding the file name and the states."
          costs="Busier, and the outer window plus the demo's card is still two frames, just better differentiated."
        >
          <EntryWindow />
        </Option>

        <Option
          id="C3"
          title="Split — meta left, demo right"
          gets="Breaks the single 880px column. Name, blurb, states and links sit together as one quiet block; the demo gets the room."
          costs="Below 900px it stacks and becomes C1 with extra steps. The demo column is narrower than the cards were designed for."
        >
          <EntrySplit />
        </Option>
      </div>
    </div>
  )
}
