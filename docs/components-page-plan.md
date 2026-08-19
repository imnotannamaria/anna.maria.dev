# The components page — implementation plan

Two roadmap items, folded into one page.

**The objective:** every component on this site that isn't static — anything that reads a
database, fetches over the network, loads a chunk, touches a device API, or writes something —
has a loading state, an empty state, an error state, and a transition between them that looks
like the rest of the site. All of them. Not the interesting ones.

**The deliverable:** `/components`, one route. It opens on the design tokens — colour, type,
space, radius, motion, and the do's and don'ts behind them — and continues into a showcase that
lists the components built from those tokens, each shown in every state it can be in, linking
through to an MDX page explaining how to build it.

The page is the deliverable because it is the only way the objective stays true. A state that
exists but is never rendered outside a broken production database rots — nobody sees it, nobody
notices when a refactor drops it, and the first time it appears is the day something is already
wrong. `/components` renders every state of every card on every deploy. A missing frame is a
hole on a page anyone can look at, and a unit test can fail on it.

This absorbs two roadmap items. The first:

> **A state for every card**
> Some of the cards read the database, so the page can be fine while one card has nothing.
> Each of those wants its own skeleton while it loads and its own error state when the query
> fails. A card that broke should say it broke, not sit there looking empty. Right now the
> home page has neither.

That item was about the home page. The objective above is the same sentence with the scope it
should always have had. The second:

> **Add brand page**
> Brand of the site, colour, typography, tokens, do's and dont's, ...

Both are the same audience — a developer reading this repo as a template, which `CLAUDE.md`
says it is — and keeping them as two pages meant building the outline rail, the `FeedShell`
wiring, the nav entry, and the review pass twice for that one reader. One route: `/components`
opens on what the site is drawn from, then shows what's built from it. The outline rail does
double duty as the table of contents for both halves.

A reference came along for the shape of the tokens half — a numbered console readout of colour
and type — and what it lent is exactly that: numbered sections, swatch grids, a type scale
table, meta badges in the header. None of the content transfers, because it described a single
dark theme with radius 0 and no shadows and this site is six themes across two modes, five
radii and three shadow tokens. Everything in the tokens section is read straight out of
`app/globals.css` — see "The tokens section" for what that means in practice.

---

## Why

**A card that fails silently is worse than one that fails loudly.** The home page currently
does `getPublishedEntries().catch(() => null)` and renders an empty shelf. `getContributions()`
returns `null` for a missing token, a failed request, a GraphQL error and an empty calendar
alike. Now playing returns `null` outright when the playlist is empty, so the card vanishes and
leaves a hole in the bento grid. In all three the page looks fine, which is the problem.

**One page-level `loading.tsx` is the wrong unit.** `Home()` awaits a single `Promise.all` of
three queries before anything paints. One slow query holds the entire home page behind a
loading screen. Per-card states are what turn that into a shell that paints immediately and
fills in.

**The repo claims to be a template.** First line of `CLAUDE.md`: "personal portfolio and open
source template for full-stack devs". There is no page documenting any of it, and the parts
worth documenting are exactly the ones that took longest to get right.

**Real accessibility work is sitting in a comment nobody outside this repo reads.**
`app/globals.css` carries a hand-measured WCAG table for `--fg-brand-on-tint` across all twelve
theme×mode combinations — eight of twelve failed with the obvious token, and the fix took a
dedicated one. That is exactly the kind of decision a "do's and don'ts" page exists to publish,
and right now it is invisible unless someone opens the CSS file and scrolls to line 985.

---

## The rule

> If a component can be in a state other than "it worked", that state is a component, and it
> lives beside the others.

Three consequences, and they are what the phases are built on.

1. **Data loading and rendering are separate.** A component that fetches its own data cannot be
   forced into a state from outside, so its states cannot be demoed, tested, or reviewed. The
   split is `load.ts` → a discriminated state → a pure component that takes it.
2. **The non-ok frames are shared, not invented per card.** Fifteen hand-rolled skeletons is
   the Duplication rule broken fifteen times. There are three shared frames and each card
   passes strings.
3. **A state change is not an entrance.** They are different animations with different triggers
   and mixing them is how you get a card that replays its arrival every time data refreshes.

---

## The audit

Every component under `components/`, classified. This is the scope of the objective, and the
useful finding is how much of it is already right.

### Already correct — states and motion both

| Component                                                                          | Why it is fine                                                   |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `wristkit/today-activity-card/`                                                    | `load.ts` + `states.tsx` + a `switch`. Five states. The template |
| `home/tree-card.tsx`                                                               | Takes items as a prop; a null count renders without a number     |
| `home/stack-card.tsx`                                                              | Static data. One honest state                                    |
| `contact/contact-form.tsx`                                                         | Submitting state, network failure told apart from a rejection    |
| `log/log-card.tsx`                                                                 | Poster `onError` → a real fallback frame, not an edge case       |
| `roadmap/roadmap-board.tsx`                                                        | Empty column says "nothing here"                                 |
| `admin/*-table.tsx`                                                                | Both have `// nothing logged yet` empty states                   |
| `admin/*-form.tsx`, `*-dialog.tsx`, `quick-add`                                    | `submitting`/`deleting` + a `finally`, network vs rejection      |
| `chrome/feed-shell.tsx`                                                            | Two-branch empty state: nothing published vs nothing filtered    |
| `chrome/page-outline.tsx`                                                          | Has its own `OutlineSkeleton`, sharing the real rail's constants |
| `blog/`, `projects/`, `about/timeline`, `about/interest-card`, `piano/keymap-card` | Static. Entrance animation, nothing to load                      |

### Gaps — states

| Component                            | Gap                                                                                                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `spotify/now-playing-widget.tsx`     | Takes no props, fetches in a `useEffect`, branches on the store inline at `:163-165`. Undemoable. `empty` returns `null`, so the card disappears       |
| `lib/github/contributions.ts`        | Four different failures all return `null` (`:53`, `:68`, `:78`, `:82`); `github-calendar.tsx:218` has one `if (!data)` doing all four jobs             |
| `app/(home)/page.tsx`                | One `Promise.all`, one page-level `loading.tsx`. No per-card boundary                                                                                  |
| `about/stack-graph.tsx`              | `next/dynamic` gives it a loading `Skeleton` but **no error state** — a chunk that fails to load leaves a permanently blank pane with nothing to retry |
| `home/mini-piano-card.tsx`, `/piano` | Web Audio can be unsupported or suspended by autoplay policy. No state for it — the keys just do nothing                                               |
| `log/log-card.tsx`                   | Has a failed state, has no **loading** state. The poster proxy is a network hop and the box is empty until it lands                                    |

### Gaps — motion

| Area                             | Gap                                                                                                                                 |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `components/admin/*` (10 files)  | **Zero entrance animation anywhere.** The one part of the site with no motion at all                                                |
| Admin mutations                  | `router.refresh()` after a toast. The deleted row sits there until the server re-renders, then snaps out. No pending phase, no exit |
| `admin/roadmap-quick-add.tsx`    | A captured item appears by full refresh. Nothing arrives, the list is just different                                                |
| `about/stack-flow.tsx`           | The React Flow pane has no entrance and no arrival — it pops in when its chunk lands                                                |
| Every state change on every card | There is no crossfade anywhere. States swap instantly because nothing has ever swapped between two of them                          |

Admin having no motion is defensible on its own — it is a private tool. It is not defensible
under the objective as stated, and the fix is cheap: these are the same cards and the same
`useReveal` as everywhere else.

---

## What we decided

| Topic         | Choice                                                                            |
| ------------- | --------------------------------------------------------------------------------- |
| Contract      | `CardState<T>` — wristkit's `TodayState`, generalised                             |
| Non-ok frames | Three shared components in `components/ui/card-states.tsx`                        |
| Entrance      | On the wrapper, once. Never on a state frame                                      |
| State change  | `AnimatePresence` crossfade keyed on `kind`, `min-height` reserved                |
| Routes        | `/components` index, `/components/[slug]` doc pages                               |
| Rendering     | Fully static. No database, no network, no `force-dynamic`                         |
| Demos         | The real components, forced into a state through a prop                           |
| Fixtures      | Deterministic, module scope, no `Math.random()` and no `new Date()`               |
| Content       | New velite collection at `content/components/*.mdx`                               |
| Source links  | `sourceUrl(path)`, pinned to `main`, path checked at build                        |
| wristkit      | No page here — links out to wristkit-web's own docs                               |
| Tokens        | Hand-written manifest, `lib/design-tokens.ts` — no CSS parsing                    |
| Token values  | Read through a probe element; `color-mix()` is not evaluated in a custom property |
| Contrast      | Computed live, compositing each ink's declared backdrop chain                     |
| Demo map      | Enforced by a mapped type at `tsc` time, not by a runtime test                    |
| Nav           | Ninth tab, ninth sidebar icon, a tree node, a palette entry                       |

### Decisions I made without asking, and why

**Static, not `force-dynamic`.** Every other page reading Postgres is dynamic and that
reasoning is good; it does not apply here. This page is documentation, and documentation whose
demos break when the database does is the worst version of it. Nothing on `/components` reads
a live anything.

**Fixtures, not live data.** Follows from the above, and it is the only way an error frame
exists at all — you cannot ask a healthy database to fail. Second benefit: the fixtures become
the closest thing this repo has to visual regression material.

**Shared frames, not per-card skeletons.** Under "TODOS" this is the difference between a
weekend and a month. Fifteen bespoke loading states also drift fifteen ways.

**Pills, not a literal carousel.** The raw note sketched frames side by side. At 375px minus
the 56px sidebar there are 319px and these cards are drawn at ~500px, so side-by-side is a
horizontal scroller of interactive widgets — every hidden card still in the tab order. The site
already has a vocabulary for "pick one of these": `FilterPill`, on four pages.

**Doc pages are velite, not registry fields.** Prose lives with the prose, gets the same Shiki
highlighting, and is editable without touching a `.ts` file.

**`components/showcase/` and `lib/showcase/`, not `components/components/`.**

**`app/components/entrepta/` stays.** Adding `app/components/page.tsx` beside it is confusing
to read but not broken — a folder with no `page.tsx` is not a route. Moving it to
`components/entrepta/` touches 24 files' imports and is a rename with no behaviour in it; it
does not ride along with a feature.

---

## The contract

`lib/showcase/state.ts`:

```ts
/**
 * What a component knows about its own data. This is the shape wristkit's `TodayState`
 * already had, lifted so everything else can share one vocabulary.
 *
 * `stale` is wristkit's alone — data that arrived but is a day old. It stays in the shared
 * union rather than becoming an extension: a member nobody uses costs nothing, a second
 * parallel union costs a reader.
 */
export type CardState<T> =
  | { kind: "loading" }
  | { kind: "empty" }
  | { kind: "error"; message?: string }
  | { kind: "stale"; data: T }
  | { kind: "ok"; data: T }

export type CardStateKind = CardState<unknown>["kind"]
```

`message` is developer-facing and **must never reach the DOM**. wristkit already gets this
right — its error frame renders a fixed line and the message goes nowhere. A connection string
in an error card is the leak the Security check is about.

### The three frames

`components/ui/card-states.tsx`. Built from what already exists — `.bento-card`, `CardHead`,
the entrepta `Skeleton` — so a card's non-ok states are three components with different strings.

```tsx
/** Grey bars in the card's own shape. `rows` and `media` describe the layout being stood in for. */
export function CardLoading({ label, meta, rows, media, minHeight }: …)

/** Not a failure. "Nothing yet" is a fact, and it reads in the site's voice: `// nothing logged yet.` */
export function CardEmpty({ label, note, minHeight }: …)

/** Says it broke, and offers a retry when there is something to retry. */
export function CardError({ label, note, onRetry, minHeight }: …)
```

Two things they are not allowed to do:

**No live regions.** `role="alert"` or `role="status"` inside a card frame fires on
`/components`, where nothing is wrong, announcing seven fake errors to a screen reader. wristkit
already uses `role="img"` with an `aria-label`, which is the right call — keep it.

**No grey caricature of a bespoke card.** `app/(home)/loading.tsx` already argues this at
length and it is right: a skeleton works when the thing behind it is a uniform repeating shape.
For a card that is a photo, a serif name, an odometer and three buttons, grey blocks read as
broken rather than loading. Those cards get a `CardEmpty`-shaped "loading" with a `$` line, not
a skeleton. `rows`/`media` on `CardLoading` exist so this is a per-card decision, made once.

### Motion for a state change

This is the part with no precedent on the site, because nothing has ever swapped between two
states before. Three rules, each following from one already in Cards and motion.

**The entrance belongs to the wrapper, not the frame.** `useReveal` goes on the card shell,
which mounts once. Put it on the frames and every state change replays the arrival — the same
failure as "one variant label per element", one level up.

**The swap is `AnimatePresence`, not `whileInView`.** A state change is not an entrance and has
no viewport question in it. `mode="wait"` with a short crossfade, and `useReducedMotion()` asked
directly — the global `prefers-reduced-motion` block only zeroes CSS, and Motion walks past it.

**Reserve the height.** `loading` and `ok` are different heights, so the swap shifts everything
below it — CLS on the home page's own bento grid. Each card declares a `minHeight` and the three
frames honour it. This is the one number that has to be per-card, and getting it wrong is
visible on `/components` immediately, which is rather the point.

---

## The registry

`lib/showcase/registry.ts` — metadata only, serializable, **no React and no JSX**. Same
discipline `lib/site-tree.ts` keeps, and here it pays off specifically: `velite.config.ts` can
import it to validate frontmatter against it.

```ts
export type ShowcaseEntry = {
  slug: string
  name: string
  /** Repo-relative. Checked with existsSync at build. Also the source link. */
  source: string
  /** Routes it is used on. */
  where: string[]
  /** Which frames the carousel offers, in order. */
  states: readonly CardStateKind[]
  /** External docs instead of a page here. wristkit is the only one. */
  external?: { href: string; label: string }
}

export const SHOWCASE = {
  tree: { states: ["ok", "empty"], … },
  "now-playing": { states: ["loading", "empty", "error", "ok"], … },
} as const satisfies Record<string, ShowcaseEntry>
```

`components/showcase/demos.tsx` is the client half — a map from slug and kind to a rendered
frame, holding the fixtures. It is the only file importing the demoed components, which keeps
the index page's server half free of them.

**The demo map is enforced by the type system, not by a test.** The first draft of this plan
said a unit test would assert the map has a renderer for every kind every entry declares. It
cannot: `vitest.config.mts:29-40` runs the unit project as `environment: "node"` with
`include: ["…/**/*.test.ts"]` — no `.tsx` in the glob, no DOM, and there is not one `.test.tsx`
in the repo. Importing a `"use client"` module full of JSX there needs a jsdom project added for
a single assertion.

A mapped type does it better and costs nothing, because `as const satisfies` above keeps the
literal `states` tuples:

```ts
export type ShowcaseSlug = keyof typeof SHOWCASE

/** Exactly the kinds each entry declares — no more, no fewer. */
export type DemoMap = {
  [S in ShowcaseSlug]: {
    [K in (typeof SHOWCASE)[S]["states"][number]]: () => React.ReactNode
  }
}
```

`demos.tsx` declares `export const DEMOS: DemoMap = { … }`. A missing kind is a `tsc --noEmit`
error naming the slug and the kind; an extra one is an excess-property error. That is what makes
"TODOS" mechanical instead of aspirational, and it runs on every commit rather than in one test
file — `npx tsc --noEmit` is already in the review pass.

Where a runtime check is still wanted, the precedent is not jsdom: `lib/type-scale.test.ts:20-31`
shells out to `grep` from a node test and that is the shape to copy.

### Source links

```ts
const REPO = "https://github.com/imnotannamaria/anna.maria.dev"
export const sourceUrl = (path: string) => `${REPO}/blob/main/${path}`
```

Pinned to `main`, not a SHA — a SHA is always correct and always old. The path is validated at
build with an `existsSync` refinement on the frontmatter field, the same way `cover` is in
`velite.config.ts`. A docs page linking to a 404 is the one thing it must not do, and component
files get renamed every other refactor. The `wirstkit.mdx` story at `velite.config.ts:42` is the
same failure with the letters in a different order.

---

## Content

```ts
// Relative, not "@/lib/…". Every import in velite.config.ts is a bare package or a node:
// builtin — the file has no path-alias precedent, velite bundles its config with esbuild, and
// whether tsconfig `paths` resolve in that pass is version-dependent. A relative path always
// works and matches the file's existing style.
import { SHOWCASE } from "./lib/showcase/registry"

const componentDocs = defineCollection({
  name: "ComponentDoc",
  pattern: "components/**/*.mdx",
  schema: s.object({
    title: s.string(),
    description: s.string(),
    entry: s.string().refine((k) => k in SHOWCASE, "no showcase entry with that key"),
    source: s.string().refine((p) => existsSync(join(process.cwd(), p)), "source file not found"),
    deps: s.array(s.string()).default([]),
    published: s.boolean().default(true),
    slug: s.path(),
    body: s.mdx(),
  }),
})
```

That import is the reason `lib/showcase/registry.ts` must stay free of React and of anything with
a `"use client"` in its import graph: the config is evaluated in a plain Node bundle at build
time, so a stray component import there breaks `velite build`, which runs before `next build`.

Checked in both directions. Velite catches an MDX file pointing at a registry key that does not
exist; a unit test catches a registry entry with no MDX file, because velite cannot notice an
absence, and an entry with no doc renders a card whose link 404s. That test is plain data on both
sides — `SHOWCASE` keys against the `.velite` output — so it lives in the node unit project with
no environment work, unlike the demo map, which types cover instead.

Query helpers go in `lib/velite.ts` beside the existing ones, reusing the `extractToc` that
already serves blog and projects.

## Fixtures

`lib/showcase/fixtures.ts`, module scope, frozen. Two rules that are not optional:

**No `new Date()`.** A fixture computed from the current date renders one string on the server
and another on the client the moment a render straddles midnight — the trap
`latest-log-card.tsx:20-25` documents for the log strip. Every date is a literal.

**No `Math.random()`.** The contributions fixture is 53 × 7 and checking in 371 objects is
unreadable, so it is generated — with a seeded PRNG, because `Math.random()` gives a different
grid on each side of the boundary and a hydration mismatch across the whole calendar.

```ts
/** xorshift32. Deterministic, six lines, same grid on both sides of the boundary. */
function seeded(seed: number) {
  let s = seed
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return (s >>> 0) / 4294967296
  }
}
```

---

## The pages

### The tokens section

`/components` opens on this, above the showcase grid.

**Manifest, not a CSS parser.** `lib/design-tokens.ts` is a hand-written, typed list of which
custom properties to show, grouped, with a one-line editorial note per token — the call
`lib/site-tree.ts` already makes for the same reason: `globals.css` carries well over a hundred
custom properties, most of them component-local (`--piano-*`, `--tree-*`), and deciding which
forty matter to a visitor reading this as a template is an editorial act a parser cannot make.

```ts
export type TokenEntry = { token: string; note: string }
export type TokenGroup = { id: string; label: string; entries: TokenEntry[] }

export const TOKEN_GROUPS: TokenGroup[] = [
  {
    id: "surface",
    label: "surface",
    entries: [
      { token: "--bg-canvas", note: "global background" },
      { token: "--bg-surface", note: "cards and panels" },
      { token: "--bg-card", note: "the bento surface, one step darker" },
      { token: "--bg-overlay", note: "dialogs, dropdowns, the command palette" },
    ],
  },
  // ink, line, accent-derived, type, space, radius, motion — same shape
]
```

**Swatches render `var(--token)`, never a captured hex.** A colour cell's background is
`style={{ background: "var(--bg-surface)" }}`, so the page repaints when the real
`ThemeSwitcher` — already sitting bottom-right on every route — changes the theme or the mode.
There is no second switcher built for this page and no frozen row of six themes side by side;
flipping the real one _is_ the demo. The value printed under each swatch is read after mount and
re-read on a `MutationObserver` watching `data-theme`/`data-mode` on `<html>` — cheap, since it
fires on an attribute change, not a timer. Note that `hooks/use-mode.ts:27-28` sets
`data-mode="light"` or **removes** the attribute; the observer still fires on removal, but
anything deriving a label from it reads absent as dark, not as light.

**Reading a token's value needs a probe element, not `getPropertyValue`.** This is the one piece
of the section with a real trap in it. Unregistered custom properties are _substituted_ at
computed-value time but not _evaluated_: `--bg-canvas: var(--zinc-950)` does read back as
`#09090b`, so the flat tokens behave as expected — but `--border-brand` is
`color-mix(in srgb, var(--fg-brand) 35%, transparent)` and reads back as the literal string
`color-mix(in srgb, #7c6bff 35%, transparent)`, the inner `var()` substituted and the mix not
run. That is eleven tokens in this manifest's scope: five `color-mix()` and six `rgba()`.

Assigning the token to a real colour property forces the engine to resolve it:

```ts
/**
 * Custom properties are substituted, not evaluated — reading `--border-brand` directly hands
 * back `color-mix(…)` as text. Assigning it to a real `color` and reading *that* back makes the
 * engine resolve the mix, the alpha and the colour space, and return `rgb(r g b / a)`.
 */
function resolveToken(token: string): string {
  const probe = document.createElement("span")
  probe.style.cssText = "position:absolute;opacity:0;pointer-events:none"
  probe.style.color = `var(${token})`
  document.body.appendChild(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  return value
}
```

This is a better outcome than reading the source text would have been: `rgb(169 139 245 / 0.35)`
under `--border-brand` is what someone copying it actually wants, and it is the same shape the
reference screenshot prints under its own line tokens. (`getPropertyValue` also preserves leading
whitespace — `.trim()` anything printed.)

**Contrast ratios are computed live, not hand-measured and pasted.** `globals.css` already
carries that hand-measured, twelve-row table for `--fg-brand-on-tint` — real work, done once,
sitting in a comment. The page does not copy it in: a copied number is exactly the kind of fact
that goes stale the day a theme's brand hex changes and the comment doesn't get updated to
match, the same drift the `existsSync` refinements in `velite.config.ts` exist to catch, one
level removed, where nothing can throw a build error to catch it. Instead, `lib/color-contrast.ts`
exports a small WCAG relative-luminance formula (no dependency — it's arithmetic on three
channels), and each ink prints the real ratio for whichever theme and mode happen to be active.

**Each ink declares what it actually sits on, and the helper composites.** "Measure against
`--bg-canvas`" is only true for three of them. The token the whole argument rests on —
`--fg-brand-on-tint` — is ink on a `--bg-surface-brand` fill, which is `rgba(…, 0.15)` over the
canvas, and `globals.css:996` says so in as many words: "measured against the composited pill
background". Measuring it against the raw canvas prints a number that contradicts the table this
page cites two paragraphs earlier. So:

```ts
/** The backdrop chain, composited right to left. Only the last entry may be opaque. */
type InkEntry = { token: string; on: string[]; note: string }
// { token: "--fg-brand-on-tint", on: ["--bg-surface-brand", "--bg-canvas"], … }

/** Straight-alpha compositing. A 15% brand tint over the canvas is a third colour, and it is
 *  the one the pill's text is really on. */
function composite(fg: Rgba, bg: Rgb): Rgb
```

It's a smaller table than the CSS comment's — one row instead of twelve — but it cannot go
stale, and clicking through the six themes in the real switcher walks the other eleven rows for
free.

**The do's and don'ts are the site's own rules, not invented ones.** `CLAUDE.md` already carries
two sections written for exactly this purpose — Conventions and Cards and motion — a couple
dozen rules earned from real bugs: `whileInView` on a zero-size element, a stagger delay left on
the wrong transition, a brand hex hardcoded instead of derived. The tokens section's closing
block is a curated subset of those, credited to nothing external. This is also why it's plain
TSX and not another MDX collection: it's page furniture with a short, hand-maintained list, the
same choice `about/interest-card.tsx` and `about/timeline.tsx` already made for their own
hand-written content.

**The type table dogfoods its own classes — and a test already requires it to.** Each row's `Aa`
sample renders with the actual Tailwind utility it documents — `className="text-display-md"` on
the row naming `--text-display-md` — so the row is generated by the thing it claims to be, not a
facsimile of it in an inline `fontSize`. Three faces, not the reference's two: Newsreader for
display, JetBrains Mono as the UI default, Inter for long prose — the table already in
`CLAUDE.md`'s Typography section, rendered instead of just written down.

That is not only tidier, it is the only version that builds. `lib/type-scale.test.ts` fails on
arbitrary sizes (`text-[80px]`), on Tailwind's own steps (`text-xs`, `text-4xl`), and on inline
`fontSize:` above 18px — so writing an 80px sample the obvious way trips a test that already
exists. Worth knowing before fighting CI over it.

**The meta badges are counts, not adjectives.** `THEMES.length` (moved from `app/layout.tsx`
into `siteConfig`, so a server component can read it), `TOKEN_GROUPS.length`, and each group's
`entries.length` supply the numbers in the header line — `6 THEMES · 2 MODES`, `9 SPACE STEPS`,
`5 RADII`. A count that comes off data already in memory can't drift from the manifest the way a
typed sentence could — the same reasoning behind the tree's and the roadmap tab's counts.

**`FeedShell` gains one optional prop, and one `useMemo` it should already have had.** Its
outline rail builds `items` from `root` plus the showcase `groups`; the token subsections need
rows above those, with nothing else about the shell touched. `preOutline?: OutlineItem[]`,
prepended before the generated rows and undefined everywhere else — `/blog`, `/projects` and
`/log` don't pass it and render exactly as they do today. This is the one shared component the
plan modifies rather than only consumes, because the alternative was a second, parallel outline
component built for one page — the failure mode `page-outline.tsx`'s own doc comment already
tells the story of.

While in the file: `feed-shell.tsx:106` builds `outline` inline, so it is a new array identity on
every render, and `page-outline.tsx:80-110` has `useEffect(…, [items])` — the IntersectionObserver
is torn down and rebuilt on every render, including every filter-pill click. Harmless enough
today; this page will have the most outline rows on the site, token subsections _plus_ showcase
groups, so the assembled array gets a `useMemo` in the same diff that adds the prop.

### `/components` — the index

The showcase grid, below the tokens section, on the same route. `FeedShell` does the layout:
outline rail, 880px column, filter pills, grouped sections, two-branch empty state. This is the
fourth index page on the site and should not invent a fourth arrangement.

- `file="components/"`, groups by where the component lives — `home/`, `about/`, `shared/` — so
  the outline rail has something to point at, the job years do on `/blog`
- Pills mirror to `?where=` through `useUrlFilter`, **not** `useSearchParams`, which on a static
  route makes prerender emit the Suspense fallback and strips every card from the crawler's HTML
- Header server-rendered and passed in as `children`, like the other three

Each item is a `.bento-card`: `CardHead` (`◆ name`, meta = the route), the state pills, the live
frame, `CardFoot` with a `//` comment and an `ArrowLink` to the doc.

**The heavy demos are gated, and the gate has to be inside `demos.tsx`.** Seven live cards
includes React Flow — the largest dependency on the site — and a Web Audio piano.
`about/stack-graph.tsx:20-33` already solves this twice: `next/dynamic` with `ssr: false` for the
chunk, and a `useMediaQuery` gate so a phone never mounts what it will never show. Showcase
frames use both plus a visibility gate.

The `dynamic()` calls must live in `demos.tsx` itself. If that module imports the seven
components at the top, they all land in one chunk and the gating is decoration — the map's values
are already functions, so each heavy one returns a `dynamic()` component rather than closing over
a statically imported one. This is also why `demos.tsx` staying `"use client"` is load-bearing
rather than incidental: `next/dynamic` with `ssr: false` is not permitted in a Server Component
in Next 16.

### `/components/[slug]` — the doc page

Modelled on `app/projects/[slug]/page.tsx`, because a component doc is a case study of a
component. `generateStaticParams` from the registry skipping `external` entries; `PageOutline`
from the MDX headings; the carousel above the prose; a metadata column with where it is used,
its dependencies, and the source link.

**What actually 404s is `notFound()`, not `generateStaticParams`.** Next's default
`dynamicParams = true` renders an unlisted slug on demand, so listing only the non-external
entries is not what turns wristkit away. The existing pattern already handles it —
`app/blog/[slug]/page.tsx:50` looks the post up and calls `notFound()` on a miss — and this page
gets it free from `getComponentDocBySlug`, since wristkit has no MDX file. Worth knowing before
somebody reaches for `dynamicParams = false` and finds it changes nothing.

The same mechanism is what handles a second-order effect of keeping `app/components/entrepta/`
where it is: `[slug]` sits beside it, and `entrepta/` has no `page.tsx`, so `/components/entrepta`
falls through to `[slug]`, misses the lookup, and 404s. Correct, and non-obvious enough to earn a
comment in the route file.

### wristkit

No page. `external: { href: "https://wristkit-web.vercel.app/docs" }`, the index card links
there, `generateStaticParams` skips it. A page whose content is "the real docs are over there"
is a thin page competing with the real one for the same queries — the argument `CLAUDE.md`
makes for why there is no `/log/[slug]`. `target="_blank" rel="noreferrer"`, screen-reader text
saying it opens in a new tab, and no two links sharing a name pointing elsewhere.

---

## Phases

Phases 0–3 are the objective — the state-for-every-card item. Phase 6 is the brand-page item,
standing on its own. Phases 4, 5, 7, 8, 9 are what turns both into one page. Each of 0–3 and 6
ships independently and is worth having if the rest never happens.

### Phase 0 — the contract and the three frames

`lib/showcase/state.ts` and `components/ui/card-states.tsx`. No consumers yet.
`components/wristkit/today-activity-card/load.ts` re-types `TodayState` as
`CardState<TodayData>` — behaviour unchanged, the union moving house — and its five frames are
the reference the three shared ones are extracted against.

**Checks.** `npx tsc --noEmit`. wristkit renders identically in all five states.

### Phase 1 — the cards that read data

1. `lib/github/contributions.ts` returns `CardState<ContributionYear>`. The four null returns
   split into `error` (no token, request failed, GraphQL error) and `empty` (no weeks).
   `github-calendar.tsx:218`'s single branch becomes two.
2. Now playing splits: `NowPlayingCard({ state })` pure, `NowPlayingWidget()` the thin connected
   wrapper subscribing to the store. `empty` renders a card instead of `null`.
3. **`getPublishedEntries()` is wrapped in React's `cache()` — do this first, or the phase is a
   regression.** `app/(home)/page.tsx:91` fetches it once and feeds four consumers: `logList` →
   `LatestLogCard` (`:259`), `logCount` → `buildSiteTree` (`:119`), the `logged` stat (`:144`),
   and the null-vs-empty distinction the existing comment argues for. Four independent Suspense
   boundaries each awaiting their own call is four queries per request — the exact shape the
   Performance check names, "queries whose result is derivable from data already fetched in the
   same render". `cache()` is request-scoped memoisation, not `revalidate`-style caching: it
   dedupes within one render pass and does not outlive the request, so the force-dynamic
   argument in Conventions is untouched.
4. `app/(home)/page.tsx` stops awaiting one `Promise.all`. Each DB-reading card becomes its own
   async server component behind its own `<Suspense fallback={…}>`. `force-dynamic` stays —
   streaming and dynamic rendering are not in tension. `Home()` itself must await nothing, or
   everything sits behind the page-level boundary again and the phase buys nothing.
5. `app/(home)/loading.tsx` now covers only the shell; its doc comment gets the paragraph
   saying so.
6. The `AnimatePresence` crossfade goes on the shared wrapper, once, and every card inherits it.

**Checks.** Home renders with `DATABASE_URL` unset and every affected card says what is wrong.
With `GITHUB_TOKEN` unset the calendar says it could not reach GitHub, not that there are no
contributions. Nothing below a card moves when its state resolves. **Count the queries** — one
`getPublishedEntries` per request, not four; log them or watch the pooler. `npm run test:all`.

### Phase 2 — admin gets its motion, and its transitions

The largest single gap, and less cheap to close than it looks — two facts about the tables
change the shape of the work.

**Both tables are Server Components.** `log-entry-table.tsx:1-3` and `roadmap-item-table.tsx:1-3`
have no `"use client"`, and they import `@phosphor-icons/react/dist/ssr` — the server-safe entry
point, picked deliberately. `useReveal`, `useOptimistic`, `useTransition` and `AnimatePresence`
are all client-only. Rather than converting the whole table and shipping the icon set, the
`<tbody>` contents move into a client child that owns the optimistic list, while `<table>`,
`<thead>` and the column headers stay on the server with their `/dist/ssr` icons.

**Rows fade; they do not slide.** Both are real `<table>`/`<tbody>`/`<tr>` markup, on purpose —
`log-entry-table.tsx:11` says so, for screen readers, and it stays. But CSS transforms do not
apply to `display: table-row`, so Motion's `layout` prop and any `x`/`y` on a `<tr>` are inert,
and animating a row's `height` is no better. Only `opacity` is dependable. A fade is what this
phase promises; anything else means animating a wrapper inside every `<td>`, which animates the
cells rather than the row and looks like it.

1. `useReveal` on the forms, the quick-add, and the new client row-list — the same entrance every
   other card has.
2. Mutations get a pending phase and an exit. `useOptimistic` + `useTransition` so a deleted row
   leaves immediately and comes back if the request fails, instead of sitting there until
   `router.refresh()` lands and then snapping out.
3. `AnimatePresence` on the rows, opacity only, so a captured item arrives rather than the list
   simply being different.

**Checks.** Delete with the network throttled: the row leaves at once, the toast is honest, and
a forced 500 puts it back. Reduced motion turns all of it off. The tables still render with JS
off — the server half is what holds the `<table>` semantics.

### Phase 3 — chunks and devices

1. `about/stack-graph.tsx` gets an error frame. `next/dynamic` has no error UI of its own — a
   failed chunk is a blank pane forever — so it needs an error boundary around it with a retry.
   The `narrow` case below `md` stays what it is: an honest state, not a failure.
2. Web Audio gets a state. `AudioContext` unsupported, or suspended by autoplay policy until the
   first gesture, is currently silent keys. `home/mini-piano-card.tsx` and `/piano` say so.
3. `log/log-card.tsx` gets a poster loading state to go with the failed one it already has.

**Checks.** DevTools offline, reload `/about`: the graph says it could not load and the retry
works. Safari with autoplay locked down: the piano says why.

### Phase 4 — registry, source links, fixtures

No UI. The registry is `as const satisfies Record<string, ShowcaseEntry>`, which is what keeps
the literal `states` tuples that `DemoMap` maps over in Phase 7 — drop the `as const` and the
type check silently degrades to `CardStateKind[]` and stops catching anything.

A unit test asserts every `source` exists and every `states` array is non-empty. Grep the registry
for React imports — it must have none, both because `velite.config.ts` imports it in a plain Node
bundle and because that is what keeps it serializable for the server half of the index page.

### Phase 5 — the collection

Velite collection, both refinements, `lib/velite.ts` helpers, then one MDX file all the way
through before the other five.

**Checks.** `npm run build`. Break a `source` path on purpose and confirm the build fails naming
the file. If it does not, the refinement is decoration and the link-integrity argument is void.

### Phase 6 — the tokens section

`lib/design-tokens.ts` (the manifest, including each ink's `on` backdrop chain),
`lib/color-contrast.ts` (relative luminance, the contrast ratio, and straight-alpha
compositing), and `components/showcase/tokens-section.tsx` (the probe-element reader and the
`MutationObserver`). No velite, no registry — this phase doesn't touch Phase 4 or 5 and could
ship before either of them.

`lib/color-contrast.ts` is pure arithmetic on numbers, so it unit tests in the node project with
no environment work: black on white is 21:1, white on white is 1:1, and a 15% brand tint
composited over the canvas matches the corresponding row of the hand-measured table in
`globals.css:998-1010` — which is the real assertion, because it proves the live number agrees
with the one that was measured by hand rather than quietly replacing it with a different one.

**Checks.** Grep the component for a bare `#` outside a comment — it should find nothing, every
colour is a `var()`. Flip the real `ThemeSwitcher` through all six themes and both modes with the
page open: every swatch, every printed value, and every contrast number update. Confirm a
`color-mix()` token prints `rgb(…)` and not `color-mix(…)` — if it prints the function call, the
probe element is missing. `npx tsc --noEmit`.

### Phase 7 — the carousel and the index

`components/showcase/demos.tsx`, `state-carousel.tsx`, `app/components/page.tsx` on `FeedShell`
— the tokens section from Phase 6 renders first, inside the `children` slot `FeedShell` already
takes for a server-rendered header, then the showcase grid below it via the new `preOutline`
prop. The carousel is `FilterPill` for the pills, `AnimatePresence` between frames, a
`<figure>`/`<figcaption>` labelling the preview.

**Checks.** Every state of every component renders. The demo-map test passes. `?where=home`
survives a reload and the back button. Every card is in the HTML with JS off. The outline rail
shows token subsections above the showcase groups, in one list.

### Phase 8 — the doc pages

Route, `generateStaticParams`, `generateMetadata`, metadata column, MDX render.

**Checks.** Every slug 200s. The wristkit slug 404s and its index card links out.

### Phase 9 — nav

Ninth entry in four places: `NAV_TABS` (`chrome/titlebar.tsx:40-47`), `NAV_ITEMS`
(`chrome/sidebar.tsx:20-27`), `PAGES` (`chrome/command-menu.tsx:30-37`), and a node in
`SITE_TREE`. Name it `components/` with a count off the registry, which is already in memory.
One new tab, not two — the tokens section rides the same route and the same nav entry as the
showcase, which is the whole payoff of folding the two roadmap items together.

Nine tabs is a lot. The row is a scroller with fade edges and that is the argument the roadmap
tab was added on; if it is too many, the fix is deciding which tab leaves, not giving this page
a second-class entrance no other page has.

**Checks.** The underline and the sidebar `◆` both travel to it. `isNavActive` uses
`startsWith(href + "/")` so `/components/tree` keeps it active — confirm.

### Phase 10 — the review pass

`CLAUDE.md`'s checklist, plus `npm run test:all`, `npm run lint`, `npx tsc --noEmit`. What this
diff actually risks:

- **SEO** — prose in server HTML on both routes. Demos are client and that is fine; nothing that
  gates prose on a client mount. `useUrlFilter`, never `useSearchParams`.
- **Performance** — React Flow's chunk is not requested on `/components` until its frame is in
  view, and never below `md`.
- **Accessibility** — pills carry `aria-pressed`; frames are labelled; no live regions inside a
  demo; the external link's name says where it goes.
- **Responsive** — 375px minus 56px, seven of the site's widest cards. Each frame scrolls inside
  its own container; the page never scrolls sideways.
- **Motion** — every crossfade asks `useReducedMotion()`; no entrance on a state frame; no
  `whileInView` on anything that starts at zero size.
- **Standardization** — the index is the fourth `FeedShell` page and should be unmistakably a
  sibling of the other three, tokens section included.
- **Theme reactivity** — this is the one page where the check runs itself: every swatch and
  every printed number has to visibly move when the real `ThemeSwitcher` changes theme or mode.
  A colour cell that doesn't move is a hardcoded hex, caught by looking at the page, not the diff.

Visual pass is Anna's: the frames at 375px, the crossfades, the admin entrances, the tokens
section across all twelve theme×mode combinations, and whether seven demos on one page reads as
a gallery or as noise.

---

## Order

0 → 1 → 2 → 3 close the objective and are independently shippable. 4 → 5 are plumbing with
nothing to look at. 6 has no dependency on 4 or 5 and can happen any time after 0. 7 → 8 are
where it becomes real, 9 is where anyone finds it.

If the page never gets built, phases 0–3 are still the roadmap item done properly, and phase 6
is still "Add brand page" done properly, just not yet linked from anywhere. If the page does get
built, phase 7 is what stops 0–3 and 6 both from rotting unseen.

---

## What the build taught us

Four things the plan did not know, found while executing it. Each one is in the code now; they
are recorded here because they are the kind of thing that gets re-discovered otherwise.

**`velite build` exits 0 on a validation failure.** It reports schema issues, drops the offending
document, and returns success — so neither the new refinements _nor the existing `cover` one_
ever failed a build. That is precisely the `wirstkit.mdx` story CLAUDE.md tells: one typo, every
project missing from `/projects`, and a green build. The flag is `--strict`, and `build` now
carries it. Verified both directions: a broken path exits 1, a valid tree exits 0.

**A pure card module must not re-export a server-only loader.**
`components/wristkit/today-activity-card/index.tsx` re-exported `loadTodayActivity`, which imports
the Postgres client. That was invisible until a client component rendered the card from a fixture,
at which point the build failed with four errors pointing at the wrong files. The index exports the
card; callers that need the query import `./load`.

**`useSyncExternalStore`, not state synced in an effect.** The theme lives on `<html>`, which makes
it an external store — and React's `set-state-in-effect` lint says so. The subscribe/snapshot shape
`components/ui/url-filter.tsx` already uses for the URL is the same shape here, with the snapshot
being `data-theme:data-mode` as a string. It also removes the SSR question: the server snapshot is
empty, so nothing is read during prerender.

**A permissive colour parser fails silently.** The first `parseRgb` scraped numbers out of any
string, so `color-mix(in srgb, #7c6bff 35%, transparent)` parsed into a colour built from the
hex digits — quietly wrong on exactly the input it sees when someone forgets the probe element.
Its own unit test caught it. It is anchored to `rgb(`/`rgba(` now and returns null otherwise.

---

## What this plan deliberately does not do

**No component playground.** No prop editors, no live code editing, no copy-to-clipboard of a
compiled snippet. That is a design-system site; this is a portfolio with a docs page in it. The
MDX shows the code and the source link goes to the file.

**No npm package.** Nothing is extracted, published or versioned. The instruction is "copy this
file", which is what entrepta itself carries in this repo.

**No screenshots.** The demos are the components, running. A screenshot is a fixture that rots
without failing.

**No states for genuinely static components.** `tech-badge`, `star-rating`, `card-parts`,
`generated-cover`, `timeline` and the rest render from props that cannot fail. Giving them a
loading state would be ceremony, and the audit above is what says which is which.

**No borrowed claims.** "Dark only", "radius 0", "no shadows" are things other design-system
pages say about themselves, and all three are false here. The reference lent a shape — numbered
sections, a swatch grid, a type scale table, meta badges — and the content underneath is
`app/globals.css`, read straight, not a second draft of someone else's system with this site's
hex values swapped in.

**No frozen contrast table.** The twelve-row measurement already lives as a comment in
`globals.css` and stays there, unduplicated. The page prints one live number for whichever
theme and mode is active, not a pasted copy of the other eleven.
