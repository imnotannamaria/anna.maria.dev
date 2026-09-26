# entrepta v2: adoption plan

The portfolio was where entrepta v2 got built. Tokens, cards, motion, forms and editor chrome grew
here first and were then carried into the design system. entrepta 2.0.0 is published now, so the
direction flips: this site stops owning those pieces and starts consuming them.

That makes this the most affected consumer. Most of what moved into entrepta still lives here as
a local copy, with dozens of call sites pointing at it.

- **entrepta version:** `@entrepta/registry` and `@entrepta/cli` 2.0.0
- **Migration guide:** <https://entrepta.vercel.app/llms.txt> links the agent-facing version.
  This plan follows it, except where noted below.
- **Date:** 2026-09-26

---

## Outcome

Implemented on the `entrepta-v2` branch, one commit per phase. Where the work departed from the
plan below, this is why:

- **Open decision 1, the CodeBlock sounds, did not apply.** Nothing on the site rendered the
  CodeBlock (posts use rehype-pretty-code), so no sound was lost, and the unused component went.
- **Open decision 2, the easter egg, survived.** entrepta's window dots carry
  `data-window-dots`, so the titlebar catches a click on them and still shows the toast.
- **Open decision 3, spotlight on cards that glow, is left for the visual pass.** Every card
  kept its spotlight; dropping it on a given card is a one-line change.
- **Cards kept their elements.** `cardVariants()` goes on the `motion.div`, `article`, `button`
  or `dl` each card already was, instead of wrapping them in `<Card>`.
- **`PageOutline` got a thin client binding** in `components/chrome/page-outline.tsx`, because
  its `scrollContainer` is a function and most pages rendering it are server components.
- **`/piano`'s 36px headings became 40px** (`display-md`), since 36 was never on the scale.
- **`/components` lost its tab strip** rather than moving to Radix tabs: with the tokens and rules
  tabs gone there was one tab left. `lib/color-contrast.ts` went with the tokens tab, its only user.
- **The status bar's `<kbd>` stayed hand-rolled.** It sits on the brand fill, and entrepta's
  `Kbd` has no variant for that surface.
- **No native checkbox existed**, so `Checkbox` was not added.
- **`card.tsx` is ahead of 2.0.0.** The code review found the Card's CSS transition on `transform`
  fighting Motion's entrances. The fix (transition `translate` instead) is in this repo and
  committed in entrepta as a 2.0.1 patch; until 2.0.1 is published, don't
  `add card --overwrite` from 2.0.0.

## What we decided

| Question              | Decision                                                                                                                |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Who owns which CSS    | `app/entrepta.css` holds entrepta's CSS, synced by diff; `app/globals.css` keeps only the site's own CSS and imports it |
| `lib/utils.ts`        | Becomes exactly entrepta's file. The site's helpers move to `lib/format.ts`                                             |
| How it reaches `main` | One integration branch, `entrepta-v2`, merged once at the end                                                           |
| `/components`         | Trimmed to what belongs to this site. Tokens and rules link to the entrepta docs                                        |

### The one rule that makes this different from the guide

**Never run `npx @entrepta/cli init --overwrite` in this repo.** The guide's step 1 says to, and
for a typical project that is right. Here it would:

- replace `app/globals.css` with entrepta's file, deleting about 1,200 lines that belong to the
  site: the piano, the roadmap card and stepper, the log shelf and rail, the wristkit panel, the
  file tree, the loading screen timing
- replace `lib/utils.ts`, deleting `formatDate`, `slugify`, `isUuid`, `countWords` and
  `estimateReadingTime`
- bring a Google Fonts `@import` and `--font-*` declarations that fight `next/font`, which
  already sets those variables on `<html>`

Phase 1 changes the file layout so `add --overwrite` is safe from then on. `init` stays off
limits either way, and CLAUDE.md says so at the end (Phase 9).

---

## Inventory

### What moves to entrepta, and how many files point at it

| Local piece                                                   | Files that import it      | Replaced by (entrepta v2)                                                               |
| ------------------------------------------------------------- | ------------------------- | --------------------------------------------------------------------------------------- |
| `app/components/entrepta/*` (14 files)                        | 44 imports in total       | the same files, rewritten with `add --overwrite`                                        |
| `components/ui/reveal.tsx`                                    | 37                        | `reveal` + `lib/motion.ts`                                                              |
| `components/ui/card-parts.tsx`                                | 20                        | `card` (`CardHeader`, `CardLabel`, `CardMeta`, `CardFooter`, `CardComment`) and `badge` |
| `components/ui/spotlight.tsx`                                 | 20                        | `spotlight`                                                                             |
| `components/ui/arrow-link.tsx`                                | 10                        | `arrow-link`                                                                            |
| `components/ui/diamond.tsx`                                   | 10                        | `diamond`                                                                               |
| `components/chrome/page-parts.tsx`                            | 10                        | `doc-parts` and `kbd` (`MetaCol` and `MetaGrid` stay local)                             |
| `components/ui/type-in.tsx`                                   | 9                         | `type-in`                                                                               |
| `components/ui/url-filter.tsx`                                | 9                         | `use-url-filter` + `filter-pill`                                                        |
| `components/chrome/page-loading.tsx`                          | 8                         | `page-loading`                                                                          |
| `components/chrome/page-outline.tsx`                          | 7                         | `page-outline`                                                                          |
| `components/ui/rolling-number.tsx`                            | 2                         | `rolling-number`                                                                        |
| `components/ui/form-field.tsx`                                | 2                         | `field`                                                                                 |
| `components/chrome/sidebar.tsx`                               | 2                         | `sidebar`                                                                               |
| `components/chrome/titlebar.tsx`                              | 2                         | `tabs` (`TabNav` + `TabNavLink`, `variant="window"`)                                    |
| `components/chrome/tab-strip.tsx`                             | 1                         | `tabs` (`Tabs`, `TabsList`, `TabsTrigger`)                                              |
| `components/ui/chrome-message.tsx`                            | 1 (+ 4 via `ChromeError`) | `chrome-message`                                                                        |
| `components/home/section-head.tsx`                            | 1                         | `sect-head`                                                                             |
| `.bento-card`, `-sm`, `-xl`, `.featured-card`                 | 49 uses in 27 files       | `<Card>` with `size` and `variant`                                                      |
| `lib/color-contrast.ts`                                       | tests and `/components`   | `color-contrast` (a superset: it adds `parseHex` and `parseColor`)                      |
| `hooks/use-theme.ts`, `use-mode.ts`, `use-command-palette.ts` | 4                         | the same hooks (only `use-theme` differs, by 12 lines)                                  |

### What stays local, and why

| Piece                                                                  | Why it stays                                                                          |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `components/ui/chrome-error.tsx`                                       | A Next.js error boundary with a sound. It renders entrepta's `ChromeMessage` now      |
| `components/ui/sound-feedback.ts`                                      | Sounds are this site's, not the design system's                                       |
| `components/chrome/command-menu.tsx`                                   | The site's page list, built on entrepta's `CommandPalette`                            |
| `components/chrome/feed-shell.tsx`                                     | The shell of `/blog`, `/projects` and `/log`, built on `PageOutline` and `FilterPill` |
| `components/ui/generated-cover.tsx`, `chunk-boundary.tsx`, `icons.tsx` | Site-specific                                                                         |
| `MetaCol`, `MetaGrid`                                                  | Only the case study pages use them                                                    |
| All site CSS: piano, roadmap, log, wristkit, tree, vinyl               | Features, not design system                                                           |

### What gets deleted with no replacement

- `app/components/entrepta/top-nav.tsx`: no consumers
- `components/ui/blur-fade.tsx`, `components/ui/inline-arrow.tsx`: no consumers
- `numberToWord` in `lib/utils.ts`: no consumers
- `lucide-react`: the only imports are inside the local entrepta copies, which v2 replaces

### Call sites that need more than an import change

| What                                                     | Count                         |
| -------------------------------------------------------- | ----------------------------- |
| `--fg-brand` as text color                               | 96 uses across about 57 files |
| `--fg-brand-hover` as text color                         | 4                             |
| `--fg-brand-on-tint` (renamed `--fg-brand-text`)         | 7 in TSX, 18 in CSS           |
| `var(--bg-surface)`, to sort into card, overlay or field | 26                            |
| hand-rolled `<kbd>` (`app/layout.tsx`, `page-parts`)     | 2                             |

---

## Phases

| Phase | Topic                                           | Visual change | Size |
| ----- | ----------------------------------------------- | ------------- | ---- |
| 0     | Preparation                                     | none          | S    |
| 1     | File ownership: split the CSS, move the helpers | none          | M    |
| 2     | Tokens and themes                               | global        | M    |
| 3     | The existing entrepta components                | local         | M    |
| 4     | Motion and the small pieces                     | none expected | M    |
| 5     | Cards                                           | global        | L    |
| 6     | Forms, states, doc parts and editor chrome      | local         | L    |
| 7     | Brand text and surfaces                         | local         | M    |
| 8     | Trim `/components`                              | one page      | S    |
| 9     | Docs, cleanup and merge                         | none          | S    |

Every phase ends with `npm run test:all`, `npm run lint` and `npx tsc --noEmit` passing, and a
commit on `entrepta-v2`. Vercel builds a preview for each push, which is where the visual passes
happen. The tests do not measure text, and every phase marked with a visual change gets a
concrete list of what to look at.

---

## Phase 0: Preparation

- [ ] Branch `entrepta-v2` from `main`.
- [ ] Run the full suite on `main` and record the result as the baseline.
- [ ] Screenshots of `/`, `/about`, `/blog`, `/projects`, `/contact`, `/log`, `/roadmap`,
      `/piano` and `/components`, at 375px and desktop, in dark and light. Every later visual pass
      compares against these.
- [ ] Commit before every `add --overwrite` in later phases. It replaces local edits without
      asking, and `git diff` right after is how lost local changes get noticed.

---

## Phase 1: File ownership

**Why.** Today two files mix what belongs to entrepta with what belongs to the site, and that is
what makes `init --overwrite` destructive. Splitting them first means every later phase is a
file replacement, not a merge.

**This phase changes no pixels.** It only moves code.

1. **CSS split.**
   - Create `app/entrepta.css` with the entrepta-owned sections of today's `globals.css`: the
     type scale, primitives, semantic tokens, reset, focus, scrollbars, reduced motion, light
     mode, `[data-surface="dark"]`, the theme blocks, the loading and skeleton classes, the skip
     link, `.focus-ring` and autofill.
   - `app/globals.css` keeps `@import "tailwindcss"`, the typography plugin, `@source`, an
     `@import "./entrepta.css"`, and only the site's CSS below it.
   - `.bento-card` and `.featured-card` stay in `globals.css` until Phase 5 removes them.
2. **Tests that read `globals.css`.** `lib/color-contrast.test.ts`, `lib/theme-sync.test.ts` and
   `lib/type-scale.test.ts` read the theme blocks and the scale from it. Point them at
   `app/entrepta.css`.
3. **Helpers out of `lib/utils.ts`.** Move `formatDate` (5 files), `isUuid` (4), `slugify` (10),
   `countWords` (1) and `estimateReadingTime` (2) to `lib/format.ts`, and delete `numberToWord`.
   The `slugify` here is the heading-anchor one, not `lib/slug.ts`'s; keep the name and the
   file boundary makes the difference obvious. `lib/utils.test.ts` splits the same way.

**Done when** the suite is green and a screenshot diff of the nine pages shows nothing.

---

## Phase 2: Tokens and themes

**Why.** This is the change people will notice first: cards and modals get their v2 finish,
muted text shifts, and a few light-mode brands move so every ink clears AA.

1. **Replace `app/entrepta.css` with v2.** Run `init --theme=entrepta --themes=all` in an empty
   scratch project, never here, and copy its CSS over `app/entrepta.css`. Then delete two things
   from the copy: the Google Fonts `@import` and the `--font-serif`, `--font-mono` and
   `--font-sans` declarations, because `next/font` owns them in `app/layout.tsx`. What v2 brings
   that the site does not have yet: `--bg-field`, `--shadow-card`, `--edge-light`, `--sheen-tint`,
   `--pop-from`, the `.sheen`, `.motion-pop` and `.motion-fade` classes, display tracking in the
   scale, light `--fg-muted` at `#68686f`, and entrepta light at `#6656ff`.
2. **Sync test.** Add `@entrepta/registry` 2.0.0 as a devDependency, pinned. The published
   package includes `styles/`. A test compares `app/entrepta.css` with the registry's
   `globals.css` plus the six themes, ignoring only the removed font lines. From now on, updating
   entrepta means bumping that version and letting the test list what to copy.
3. **Remove duplicates from `globals.css`.** Anything the site defined that v2 now defines:
   keyframes, the `.type-*` and `.load-dot` classes, `.skeleton-sweep`, `.skip-link`,
   `.focus-ring`, the autofill block. The loading screen's site-specific timing stays.
4. **`--fg-brand-on-tint` becomes `--fg-brand-text`:** 7 uses in TSX and 18 in CSS.
5. **`THEMES` in `lib/site-config.ts`:** entrepta's `lightColor` becomes `#6656ff`. The theme
   sync test catches a mismatch.
6. **`entrepta.json`:** add `"themes": "all"`.

**Visual pass**

- Every card and dialog: v2 adds the sheen, a corner glow and `--shadow-card`. Cards still use
  `.bento-card` at this point, so check they keep a consistent surface next to the modals.
- Muted text in light mode, on every page: `#71717a` becomes `#68686f`.
- entrepta light: the brand shifts from `#6b5bff` to `#6656ff`.
- Headings at display sizes pick up the tracking now in the tokens: `/` hero, page titles.

---

## Phase 3: The existing entrepta components

**Why.** The 14 local copies are the v1 components with this site's fixes applied, and v2
carries those fixes. Replacing them is mostly mechanical. The risk is the handful of local edits
v2 does not have.

1. **Rewrite with the CLI:**

   ```bash
   npx @entrepta/cli@latest add button badge input dialog dropdown skeleton status-bar \
     switch textarea theme-switcher toast code-block command-palette \
     use-theme use-mode use-command-palette --overwrite
   ```

   This also brings `kbd`, `diamond`, `lib/icon.tsx` and `lib/overlay.ts` as dependencies,
   installs `@phosphor-icons/react` (already here) and leaves `lucide-react` unused.

2. **Delete** `top-nav.tsx` and uninstall `lucide-react`.
3. **Re-check the local edits the rewrite drops:**
   - `code-block.tsx` played a success and an error sound on copy. v2 has no copy callback. See
     Open decisions, item 1.
   - `status-bar.tsx` was `relative` with `hidden sm:flex`. It becomes `position="static"` plus
     `className="hidden sm:flex"` in `app/layout.tsx`.
   - `theme-switcher`: the site passes `THEMES`, and `ThemeScript` needs
     `suppressHydrationWarning` on `<html>`, which is already there.
4. **Call sites.** `buttonVariants` still comes from `button-variants.ts`. Toast gains a close
   button and a status icon tile; the traffic-light easter egg toast uses it as is.

**Visual pass:** the command palette (⌘K), a dropdown in `/admin`, the theme switcher, a toast
(click the titlebar dots), the contact form's Input and Textarea, the Switch in `/admin`, and a
CodeBlock in a post, copying.

---

## Phase 4: Motion and the small pieces

**Why.** Reveal alone has 37 importers. The v2 versions came from these files, so this should be
an import change with no visual change. Anything that moves is a regression in entrepta, not
here.

1. `npx @entrepta/cli@latest add reveal type-in rolling-number spotlight arrow-link diamond`
2. **Imports.** `@/components/ui/reveal` becomes `@/app/components/entrepta/reveal`, and
   `EASE_OUT`, `revealViewport` and `STAGGER_LIMIT` come from `@/lib/motion`. Twenty files import
   them from `ui/reveal` today, across home, roadmap, admin, about, chrome, wristkit and the
   showcase.
3. **ArrowLink.** The local one wraps `next/link` itself. v2 renders an `<a>`, so each of the 10
   call sites becomes `<ArrowLink asChild><Link href="…">…</Link></ArrowLink>`, or a plain
   `href` for external links. `ArrowAffordance` is unchanged.
4. **Delete** the local `reveal`, `type-in`, `rolling-number`, `spotlight`, `arrow-link`,
   `diamond`, `blur-fade` and `inline-arrow`.

**Done when** nothing imports from those paths and the screenshots match.

---

## Phase 5: Cards

**Why.** This is the biggest phase. `.bento-card` is the site's card, and v2 turned it into
`<Card>`. The overflow contract `CardHead` enforced is now inside `CardHeader`.

1. **Mapping:**

   | Before                             | After                                                                           |
   | ---------------------------------- | ------------------------------------------------------------------------------- |
   | `<div className="bento-card">`     | `<Card>`                                                                        |
   | `bento-card bento-card-sm` / `-xl` | `<Card size="sm">` / `size="xl"`                                                |
   | `bento-card featured-card`         | `<Card variant="featured">`                                                     |
   | `<CardHead label meta as id />`    | `<CardHeader><CardLabel as id>…</CardLabel><CardMeta>…</CardMeta></CardHeader>` |
   | `<CardFoot comment>…</CardFoot>`   | `<CardFooter><CardComment>…</CardComment>…</CardFooter>`                        |
   | card-parts `Badge` `default`       | `<Badge variant="soft" color="neutral">`                                        |
   | card-parts `Badge` `brand-soft`    | `<Badge variant="soft" color="brand">`                                          |
   | card-parts `Badge` `success-soft`  | `<Badge variant="soft" color="success">`                                        |

2. **Order,** smallest blast radius first: `components/contact` and `components/about`, then
   `blog`, `projects`, `log`, `piano`, `spotify`, then `roadmap`, then the eight in
   `components/home`, and the showcase last.
3. **Cards with their own CSS.** `.rm-item` (the roadmap light) and `.wk-panel` (wristkit) keep
   their site CSS, applied with `className` on a `<Card>`. Check that the v2 sheen and the
   running border do not stack into two glows.
4. **Spotlight inside a Card.** 20 files put the cursor glow in a card, and v2 cards already have
   a corner glow. See Open decisions, item 3.
5. **Delete** `components/ui/card-parts.tsx` and the `.bento-card`, `.bento-card-sm`,
   `.bento-card-xl` and `.featured-card` rules.

**Visual pass**

- Every page with cards, in dark and light, at 375px and desktop.
- Card heads with a long label and meta: the featured post and project cards, the log cards at
  375px. They should wrap, never clip.
- The roadmap board: hover a card, and the in-progress column at rest.
- The wristkit card in all five states: it keeps one height.

---

## Phase 6: Forms, states, doc parts and editor chrome

1. `npx @entrepta/cli@latest add field kbd filter-pill chrome-message page-loading sect-head doc-parts page-outline sidebar tabs`
2. **Forms.** `form-field` becomes `Field` (the contact form and the admin). The site has no
   native checkbox today, so `Checkbox` is not needed yet.
3. **Kbd.** The `<kbd>` in `app/layout.tsx` and the `Kbd` in `page-parts` become entrepta's
   `Kbd`.
4. **Filters.** `useUrlFilter(param, allowed, path)` keeps its signature. The local
   `FilterPill` becomes entrepta's, and `feed-shell.tsx` uses it.
5. **States.** `ChromeError` renders entrepta's `ChromeMessage` and keeps its sound. The 8
   `loading.tsx` files use `PageLoading`, which keeps the same 2.2s threshold before the late
   lines appear.
6. **Doc parts.** `page-parts` becomes `doc-parts` in its 10 importers. `MetaCol` and `MetaGrid`
   move to `components/projects/meta.tsx`.
7. **Section head.** `section-head` becomes `SectHead`.
8. **Editor chrome.**
   - `PageOutline` in 7 places, with `scrollContainer={() => document.querySelector("main")}`.
   - `Sidebar` with `items`, `active` from `usePathname()`, `linkComponent={Link}`, and the
     gradient `a` logo passed as `logo`.
   - The titlebar becomes `<TabNav variant="window">` with a `TabNavLink` per page, rendered
     through `next/link` with `asChild`. The `×` on the active tab is now a real button.
     `titlebar.tsx` stays as the composition that knows the site's pages and the palette.
   - `/components` swaps its `TabStrip` for `Tabs`, `TabsList` and `TabsTrigger`.
9. **Delete** the local `form-field`, `url-filter`, `chrome-message`, `page-parts` (after the
   meta move), `page-loading`, `page-outline`, `sidebar`, `tab-strip` and `section-head`.

**Visual pass**

- The titlebar: the underline moving between tabs, the fade edges at 375px, the `×`, and ⌘K.
- The sidebar: the `◆` moving to the active icon, and `/roadmap` and `/components` active.
- The outline rail on `/about`, `/blog` and `/log` from 1100px up: the scrollspy follows.
- `/contact` and `/admin` forms with an error.
- A loading screen on a slow connection (DevTools, Slow 3G) until the late lines appear.
- `/log?type=…` and `/roadmap?status=…` from a fresh URL.

---

## Phase 7: Brand text and surfaces

**Why.** The components use the right inks now. The site's own code still colors small text with
`--fg-brand`, which fails AA in 4 of the 12 theme and mode pairs.

1. **The 96 uses of `--fg-brand` as text.** Below 24px, move to `--fg-brand-text`. At 24px and
   up, or when it is a glyph (`◆`, `$`, `//`), an icon, a fill or a border, keep `--fg-brand`.
   The largest groups are `components/home` (11 files), `components/about` (5) and
   `components/ui` (4).
2. **The 4 uses of `--fg-brand-hover` as text** go to `--fg-brand-text`.
3. **The 26 uses of `var(--bg-surface)`.** Under a card, `--bg-card`. A dialog, menu or code
   block, `--bg-overlay` with `.sheen`. An input, `--bg-field`. What really sits above a card
   (a tooltip, a floating panel) stays.

**Visual pass:** every page in blossom dark, marmalade light, ivy light and bosco dark (the four
pairs where the old ink failed), looking at small brand text: eyebrow labels, `Em`, links.

---

## Phase 8: Trim `/components`

**Why.** The page documented tokens, rules and shared pieces that are now entrepta's, with
entrepta's docs as the better home for them. What only this site has is its cards and their
states.

1. Remove the `tokens.css` and `rules.md` tabs, `components/showcase/tokens-section.tsx` and
   `lib/design-tokens.ts`.
2. Remove showcase entries for pieces that now live in entrepta. Each links to its page on
   <https://entrepta.vercel.app/docs/components>.
3. Keep the site's cards and the state frames (loading, empty, error, stale, ok).
4. A short intro and a link to entrepta's docs, tokens and rules.
5. Update the page's metadata, and the palette and sidebar hints if the count they show
   changes.

**Visual pass:** `/components` at 375px and desktop; the outline rail lists only what is left.

---

## Phase 9: Docs, cleanup and merge

- [ ] **CLAUDE.md, and AGENTS.md with it** (`lib/docs-sync.test.ts` keeps them identical):
  - Design system: entrepta is installed with the CLI at 2.0.0. `app/entrepta.css` and
    everything under `app/components/entrepta/` are entrepta's; the site's CSS is `globals.css`.
    **Never run `init --overwrite`**; updating means bumping `@entrepta/registry` and following
    the sync test
  - Tokens: `--fg-brand-text`, `--bg-field`, the overlay surface and sheen
  - Cards and motion: the pieces table points at entrepta components, and `.bento-card` becomes
    `<Card>`
  - Folder structure: `components/ui` and `components/chrome` lose what moved
  - Writing new UI: brand text below 24px uses `--fg-brand-text`
- [ ] **README:** the fork instructions mention the CLI and `entrepta.json`.
- [ ] Nothing imports a deleted path; `lucide-react` is gone from `package.json`.
- [ ] Final full suite, lint and typecheck.
- [ ] A last visual pass over the nine pages against the Phase 0 screenshots.
- [ ] `entrepta-v2` into `main` through a reviewed PR.

---

## Open decisions

1. **Copy sounds in the CodeBlock.** v2 has no copy callback, so the success and error sounds
   are lost. The global click sound still plays. _Options:_ add `onCopy` and `onCopyError` to
   entrepta's CodeBlock in a minor release (it helps any project, not just this one), or accept
   the click sound alone. _Recommendation:_ the callback in entrepta.
2. **The traffic-light easter egg.** v2's window dots are decorative and `aria-hidden`, so
   clicking them no longer opens the toast. _Options:_ a `dots` slot on `TabNav` upstream, keep
   rendering the site's own dots with `variant="strip"`, or retire the easter egg.
   _Recommendation:_ decide in Phase 6 with the titlebar in front of you.
3. **Spotlight on a card that already glows.** The v2 card has a corner glow, and 20 cards here
   add the cursor spotlight. _Recommendation:_ keep the spotlight on the hero and featured
   cards, drop it where the two glows compete, decided card by card in Phase 5's visual pass.

---

## Risks

- **`init --overwrite` run by habit.** It follows the public guide, and here it deletes the
  site's CSS and helpers. Mitigation: the rule at the top, and CLAUDE.md in Phase 9.
- **Local fixes lost in `add --overwrite`.** Mitigation: commit before each run and read the
  diff; the known ones are listed in Phase 3.
- **Two sources of fonts.** A leftover Google Fonts `@import` or a `--font-*` declaration in
  `entrepta.css` would add a render-blocking request and override `next/font`. Mitigation: the
  sync test ignores exactly those lines, so any others fail it.
- **The whole site changes look at once.** Mitigation: the integration branch, Vercel previews,
  and a visual pass per phase against the Phase 0 screenshots.
