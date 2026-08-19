/**
 * Which custom properties `/components` shows, grouped, with a line each on what they are for.
 *
 * Hand-written rather than parsed out of `globals.css`, which is the call `lib/site-tree.ts`
 * makes for the same kind of reason. That file carries well over a hundred custom properties
 * and most of them are component-local — every `--piano-*`, every `--tree-*`, the whole status
 * scale. Deciding which forty matter to somebody reading this repo as a template is an
 * editorial act, and a parser cannot make it. A parser would also have to be told which of the
 * twelve theme blocks to read, which is the same question again.
 *
 * Nothing here holds a value. The page reads every one of them live off the document, so what
 * it prints is whatever the active theme and mode actually resolve to — see
 * `components/showcase/tokens-section.tsx`.
 */

export type TokenEntry = {
  token: string
  note: string
  /**
   * For ink swatches: what this text actually sits on, front to back. Only the last layer may
   * be opaque. "On the canvas" is true for three of them and false for the rest — the brand ink
   * lives on a translucent tint, and measuring it against the canvas prints a number that
   * contradicts the measured table in globals.css.
   */
  on?: string[]
}

export type TokenGroup = {
  id: string
  label: string
  /** How the swatches are drawn: a filled block, a line of type, a rule, or a bare value. */
  kind: "surface" | "ink" | "line" | "value"
  note?: string
  entries: TokenEntry[]
}

export const TOKEN_GROUPS: TokenGroup[] = [
  {
    id: "tokens-surface",
    label: "surface",
    kind: "surface",
    note: "What things sit on. Four steps, and the gap between them is deliberately small.",
    entries: [
      { token: "--bg-canvas", note: "the page itself" },
      {
        token: "--bg-card",
        note: "the bento surface — a hair above the canvas, defined by its border",
      },
      {
        token: "--bg-surface",
        note: "things that sit above a card: dropdowns, code blocks, tooltips",
      },
      { token: "--bg-overlay", note: "dialogs and the command palette" },
      { token: "--bg-surface-elevated", note: "translucent, for skeletons and inset wells" },
      { token: "--bg-surface-brand", note: "the brand tint under an active pill or badge" },
    ],
  },
  {
    id: "tokens-ink",
    label: "ink",
    kind: "ink",
    note: "Ratios are computed live against what each one actually sits on, for the theme and mode you have selected right now.",
    entries: [
      { token: "--fg-primary", note: "headings, card titles", on: ["--bg-card", "--bg-canvas"] },
      { token: "--fg-secondary", note: "body copy", on: ["--bg-card", "--bg-canvas"] },
      {
        token: "--fg-muted",
        note: "labels and meta — lightened from zinc-500 to clear AA",
        on: ["--bg-card", "--bg-canvas"],
      },
      {
        token: "--fg-brand",
        note: "the accent. The only token a theme changes",
        on: ["--bg-card", "--bg-canvas"],
      },
      {
        token: "--fg-on-brand",
        note: "text on a solid brand fill. Cannot be derived — a fixed near-white fails 7 of 12 combinations",
        on: ["--fg-brand"],
      },
      {
        token: "--fg-brand-on-tint",
        note: "brand text on the brand tint. --fg-brand itself fails 8 of the 12",
        on: ["--bg-surface-brand", "--bg-canvas"],
      },
    ],
  },
  {
    id: "tokens-line",
    label: "line",
    kind: "line",
    note: "Borders and rules. The brand-derived ones are color-mix() against --fg-brand, so they follow the theme without being redefined per theme.",
    entries: [
      { token: "--border-subtle", note: "card borders, dividers, dashed rules" },
      { token: "--border-strong", note: "inputs, and anything asking to be noticed" },
      { token: "--border-brand", note: "derived — a brand edge at 35%" },
      { token: "--border-brand-strong", note: "derived — the hover edge on a linked card" },
    ],
  },
  {
    id: "tokens-type",
    label: "type",
    kind: "value",
    note: "Ten steps and no eleventh. A token sets size and leading, never family — font-serif / font-sans / font-mono stays at the call site, because mono is the default here and prose is the exception.",
    entries: [
      { token: "--text-display-xl", note: "the one hero on a page, serif" },
      { token: "--text-display-lg", note: "page titles, serif" },
      { token: "--text-display-md", note: "page titles at narrow widths, admin h1, MDX h1" },
      { token: "--text-heading-lg", note: "card titles, MDX h2, card figures" },
      { token: "--text-heading-md", note: "MDX h3, entry titles in dense cards" },
      { token: "--text-body-lg", note: "prose: posts, bios, page intros" },
      { token: "--text-body-md", note: "secondary prose: blurbs, captions" },
      { token: "--text-mono-md", note: "mono body: inputs, palette items, code" },
      { token: "--text-mono-sm", note: "the default UI label: card heads, badges, meta" },
      { token: "--text-mono-xs", note: "the smallest label: field labels, group headings" },
    ],
  },
  {
    id: "tokens-space",
    label: "space",
    kind: "value",
    note: "A 4px base, thinning out as it grows — the steps people actually reach for, not every multiple.",
    entries: [
      { token: "--space-1", note: "4" },
      { token: "--space-2", note: "8" },
      { token: "--space-3", note: "12" },
      { token: "--space-4", note: "16" },
      { token: "--space-6", note: "24 — the card's own padding" },
      { token: "--space-8", note: "32" },
      { token: "--space-12", note: "48" },
      { token: "--space-16", note: "64" },
      { token: "--space-24", note: "96 — between page sections" },
    ],
  },
  {
    id: "tokens-radius",
    label: "radius",
    kind: "value",
    entries: [
      { token: "--radius-sm", note: "badges, chips, small buttons" },
      { token: "--radius-md", note: "inputs, dropdowns, tooltips" },
      { token: "--radius-lg", note: "cards" },
      { token: "--radius-xl", note: "dialogs" },
      { token: "--radius-full", note: "pills and avatars" },
    ],
  },
  {
    id: "tokens-motion",
    label: "motion",
    kind: "value",
    note: "Three durations and two curves. Everything animated through JS asks useReducedMotion() itself — the global reset only reaches CSS.",
    entries: [
      { token: "--motion-fast", note: "colour and opacity on hover" },
      { token: "--motion-base", note: "the default: transforms, expands" },
      { token: "--motion-slow", note: "entrances, and anything crossing the viewport" },
      { token: "--ease-out", note: "arrivals — the site's default curve" },
      { token: "--ease-in-out", note: "things that leave and come back" },
    ],
  },
]

/**
 * The rules worth publishing, taken from the two sections in CLAUDE.md that were written for
 * exactly this — Conventions and Cards and motion. Every one of them is here because something
 * shipped broken first.
 */
export const RULES: { do: string; dont: string }[] = [
  {
    do: "Derive brand accents from --fg-brand with color-mix()",
    dont: "Hardcode the violet — it stops reacting the moment someone picks another theme",
  },
  {
    do: "Use --fg-on-brand for text on a brand fill",
    dont: "Reach for a fixed near-white: it fails contrast in 7 of the 12 theme × mode pairs",
  },
  {
    do: "Trigger entrances with whileInView and once, everywhere",
    dont: "Use animate for things above the fold — one trigger means no judgement call to get wrong",
  },
  {
    do: "Put the trigger on an ancestor with a real box",
    dont: "Observe an element that starts at scaleX(0) — no area means the observer never fires",
  },
  {
    do: "Ask useReducedMotion() in anything animated through JS",
    dont: "Assume the global CSS reset caught it — Motion walks straight past that block",
  },
  {
    do: "Keep the size scale to its ten steps",
    dont: "Write text-[13px] or reach for Tailwind's own steps — a test fails on both",
  },
  {
    do: "Decide what a justify-between row does when its two halves stop fitting",
    dont: "Answer 'it fits' — .bento-card clips, so overflow looks like missing data",
  },
]
