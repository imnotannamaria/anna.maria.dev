# The components page — implementation plan

Two things, and the order matters.

**The objective:** every component on this site that isn't static — anything that reads a
database, fetches over the network, loads a chunk, touches a device API, or writes something —
has a loading state, an empty state, an error state, and a transition between them that looks
like the rest of the site. All of them. Not the interesting ones.

**The deliverable:** `/components`, a page that lists those components, shows each one in
every state it can be in, and links through to an MDX page explaining how to build it.

The page is the deliverable because it is the only way the objective stays true. A state that
exists but is never rendered outside a broken production database rots — nobody sees it, nobody
notices when a refactor drops it, and the first time it appears is the day something is already
wrong. `/components` renders every state of every card on every deploy. A missing frame is a
hole on a page anyone can look at, and a unit test can fail on it.

This absorbs the roadmap item that read:

> **A state for every card**
> Some of the cards read the database, so the page can be fine while one card has nothing.
> Each of those wants its own skeleton while it loads and its own error state when the query
> fails. A card that broke should say it broke, not sit there looking empty. Right now the
> home page has neither.

That item was about the home page. The objective above is the same sentence with the scope it
should always have had.

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

| Topic         | Choice                                                              |
| ------------- | ------------------------------------------------------------------- |
| Contract      | `CardState<T>` — wristkit's `TodayState`, generalised               |
| Non-ok frames | Three shared components in `components/ui/card-states.tsx`          |
| Entrance      | On the wrapper, once. Never on a state frame                        |
| State change  | `AnimatePresence` crossfade keyed on `kind`, `min-height` reserved  |
| Routes        | `/components` index, `/components/[slug]` doc pages                 |
| Rendering     | Fully static. No database, no network, no `force-dynamic`           |
| Demos         | The real components, forced into a state through a prop             |
| Fixtures      | Deterministic, module scope, no `Math.random()` and no `new Date()` |
| Content       | New velite collection at `content/components/*.mdx`                 |
| Source links  | `sourceUrl(path)`, pinned to `main`, path checked at build          |
| wristkit      | No page here — links out to wristkit-web's own docs                 |
| Nav           | Ninth tab, ninth sidebar icon, a tree node, a palette entry         |

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
  states: CardStateKind[]
  /** External docs instead of a page here. wristkit is the only one. */
  external?: { href: string; label: string }
}
```

`components/showcase/demos.tsx` is the client half — a map from slug and kind to a rendered
frame, holding the fixtures. It is the only file importing the demoed components, which keeps
the index page's server half free of them.

**A unit test asserts the map has a renderer for every kind every entry declares.** That test is
what makes "TODOS" mechanical instead of aspirational: adding a state to a card and forgetting
to demo it fails CI.

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

Checked in both directions. Velite catches an MDX file pointing at a registry key that does not
exist; a unit test catches a registry entry with no MDX file, because velite cannot notice an
absence, and an entry with no doc renders a card whose link 404s.

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

### `/components` — the index

`FeedShell` does the layout: outline rail, 880px column, filter pills, grouped sections,
two-branch empty state. This is the fourth index page on the site and should not invent a
fourth arrangement.

- `file="components/"`, groups by where the component lives — `home/`, `about/`, `shared/` — so
  the outline rail has something to point at, the job years do on `/blog`
- Pills mirror to `?where=` through `useUrlFilter`, **not** `useSearchParams`, which on a static
  route makes prerender emit the Suspense fallback and strips every card from the crawler's HTML
- Header server-rendered and passed in as `children`, like the other three

Each item is a `.bento-card`: `CardHead` (`◆ name`, meta = the route), the state pills, the live
frame, `CardFoot` with a `//` comment and an `ArrowLink` to the doc.

**The heavy demos are gated.** Seven live cards includes React Flow — the largest dependency on
the site — and a Web Audio piano. `about/stack-graph.tsx:20-33` already solves this twice:
`next/dynamic` with `ssr: false` for the chunk, and a `useMediaQuery` gate so a phone never
mounts what it will never show. Showcase frames use both plus a visibility gate.

### `/components/[slug]` — the doc page

Modelled on `app/projects/[slug]/page.tsx`, because a component doc is a case study of a
component. `generateStaticParams` from the registry skipping `external` entries; `PageOutline`
from the MDX headings; the carousel above the prose; a metadata column with where it is used,
its dependencies, and the source link.

### wristkit

No page. `external: { href: "https://wristkit-web.vercel.app/docs" }`, the index card links
there, `generateStaticParams` skips it. A page whose content is "the real docs are over there"
is a thin page competing with the real one for the same queries — the argument `CLAUDE.md`
makes for why there is no `/log/[slug]`. `target="_blank" rel="noreferrer"`, screen-reader text
saying it opens in a new tab, and no two links sharing a name pointing elsewhere.

---

## Phases

Phases 0–3 are the objective. Phases 4–8 are the page. Each of 0–3 ships on its own and is
worth having if the rest never happens.

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
3. `app/(home)/page.tsx` stops awaiting one `Promise.all`. Each DB-reading card becomes its own
   async server component behind its own `<Suspense fallback={…}>`. `force-dynamic` stays —
   streaming and dynamic rendering are not in tension.
4. `app/(home)/loading.tsx` now covers only the shell; its doc comment gets the paragraph
   saying so.
5. The `AnimatePresence` crossfade goes on the shared wrapper, once, and every card inherits it.

**Checks.** Home renders with `DATABASE_URL` unset and every affected card says what is wrong.
With `GITHUB_TOKEN` unset the calendar says it could not reach GitHub, not that there are no
contributions. Nothing below a card moves when its state resolves. `npm run test:all`.

### Phase 2 — admin gets its motion, and its transitions

The largest single gap and the cheapest to close.

1. `useReveal` on the tables, forms, and quick-add — the same entrance every other card has.
2. Mutations get a pending phase and an exit. `useOptimistic` + `useTransition` so a deleted row
   leaves immediately and comes back if the request fails, instead of sitting there until
   `router.refresh()` lands and then snapping out.
3. `AnimatePresence` with `layout` on the table rows, so a captured item arrives rather than the
   list simply being different.

**Checks.** Delete with the network throttled: the row leaves at once, the toast is honest, and
a forced 500 puts it back. Reduced motion turns all of it off.

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

No UI. A unit test asserts every `source` exists and every `states` array is non-empty. Grep the
registry for React imports — it must have none.

### Phase 5 — the collection

Velite collection, both refinements, `lib/velite.ts` helpers, then one MDX file all the way
through before the other five.

**Checks.** `npm run build`. Break a `source` path on purpose and confirm the build fails naming
the file. If it does not, the refinement is decoration and the link-integrity argument is void.

### Phase 6 — the carousel and the index

`components/showcase/demos.tsx`, `state-carousel.tsx`, `app/components/page.tsx` on `FeedShell`.
The carousel is `FilterPill` for the pills, `AnimatePresence` between frames, a
`<figure>`/`<figcaption>` labelling the preview.

**Checks.** Every state of every component renders. The demo-map test passes. `?where=home`
survives a reload and the back button. Every card is in the HTML with JS off.

### Phase 7 — the doc pages

Route, `generateStaticParams`, `generateMetadata`, metadata column, MDX render.

**Checks.** Every slug 200s. The wristkit slug 404s and its index card links out.

### Phase 8 — nav

Ninth entry in four places: `NAV_TABS` (`chrome/titlebar.tsx:40-47`), `NAV_ITEMS`
(`chrome/sidebar.tsx:20-27`), `PAGES` (`chrome/command-menu.tsx:30-37`), and a node in
`SITE_TREE`. Name it `components/` with a count off the registry, which is already in memory.

Nine tabs is a lot. The row is a scroller with fade edges and that is the argument the roadmap
tab was added on; if it is too many, the fix is deciding which tab leaves, not giving this page
a second-class entrance no other page has.

**Checks.** The underline and the sidebar `◆` both travel to it. `isNavActive` uses
`startsWith(href + "/")` so `/components/tree` keeps it active — confirm.

### Phase 9 — the review pass

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
  sibling of the other three.

Visual pass is Anna's: the frames at 375px, the crossfades, the admin entrances, and whether
seven demos on one page reads as a gallery or as noise.

---

## Order

0 → 1 → 2 → 3 close the objective and are independently shippable. 4 → 5 are plumbing with
nothing to look at. 6 → 7 are where it becomes real, 8 is where anyone finds it.

If the page never gets built, phases 0–3 are still the roadmap item done properly. If it does,
phase 6 is what stops 0–3 from rotting.

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
