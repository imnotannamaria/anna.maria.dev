# anna.maria.dev

Personal portfolio and open source template for full-stack devs.
Stack: Next.js 16, MDX, Resend, entrepta design system. Dark first. Editor metaphor.

For setup, fork instructions, and how to add content, see [README.md](README.md). This file covers conventions to follow when writing code here.

---

## Stack

| Layer            | Tech                                                               |
| ---------------- | ------------------------------------------------------------------ |
| Framework        | Next.js 16 (App Router)                                            |
| Language         | TypeScript (strict)                                                |
| Styling          | Tailwind CSS v4 + entrepta tokens                                  |
| Design system    | entrepta, components copied in, no SDK, dark first                 |
| Content          | MDX via Velite                                                     |
| State            | Zustand                                                            |
| Animation        | Motion v12                                                         |
| Graph / diagram  | @xyflow/react (React Flow) — the stack graph on /about, lazy       |
| Email (send)     | Resend SDK                                                         |
| Email (template) | React Email                                                        |
| Syntax highlight | Shiki + rehype-pretty-code                                         |
| Themes           | next-themes + entrepta ThemeSwitcher, dark/light + 6 color presets |
| OG image         | @vercel/og                                                         |
| Analytics        | Vercel Analytics                                                   |
| SEO              | next-sitemap                                                       |
| Icons            | Phosphor Icons, simple-icons                                       |
| Database         | Postgres (Supabase) via Drizzle ORM — wristkit, /log, /roadmap     |
| API layer        | Hono, mounted at /api/v1                                           |
| Admin auth       | WorkOS AuthKit + an email allowlist                                |
| Forms            | react-hook-form + zod                                              |
| Deploy           | Vercel                                                             |
| Fonts            | Newsreader, JetBrains Mono, Inter, self hosted via next/font       |

---

## Design system: entrepta

The site uses entrepta for design. It is not an installed dependency, the components are copied into the project (`app/components/entrepta/`) and owned as regular code. Edit them directly when a component needs a change, don't fight the copy.

### Tokens

Defined in `app/globals.css`. Primitive colors (zinc, violet, indigo, etc) feed semantic tokens:

```css
:root {
  --bg-canvas: #09090b; /* zinc-950, global background */
  --bg-surface: #18181b; /* zinc-900, cards and panels */
  --bg-surface-elevated: rgba(39, 39, 42, 0.6);

  --fg-primary: #fafafa; /* zinc-50 */
  --fg-secondary: #a1a1aa; /* zinc-400 */
  --fg-muted: #8a8a92; /* lightened from zinc-500 to clear WCAG AA */
  --fg-brand: #7c6bff; /* violet-500, overridden per theme */
  --fg-brand-hover: #9b8eff; /* violet-400, overridden per theme */

  --border-subtle: #27272a; /* zinc-800 */
  --border-strong: #3f3f46; /* zinc-700 */
}
```

Brand-derived accents (`--border-brand`, `--shadow-brand`, `--fg-brand-glow`) are built with `color-mix()` against `--fg-brand`, so they follow whatever theme is active. Never hardcode the violet hex for a brand accent, always derive it from `--fg-brand` so it reacts to theme changes.

### Themes

Only `--fg-brand` and `--fg-brand-hover` change between themes. Applied via `data-theme` on `<html>` (see `THEMES` in `app/layout.tsx`).

| Theme              | Color            |
| ------------------ | ---------------- |
| entrepta (default) | violet `#7c6bff` |
| blossom            | cherry `#cc2e36` |
| marmalade          | orange `#ff8213` |
| julia              | pink `#e85a8a`   |
| ivy                | green `#35a365`  |
| bosco              | blue `#2563eb`   |

---

## Visual identity

### Philosophy

Editor metaphor. The site looks like a code editor: titlebar with tabs (like VSCode), sidebar with icon nav, status bar at the bottom. Each page reads as an "open file." This is not a designer's portfolio, it's a dev's portfolio that happens to have good design.

### Typography

| Role           | Font                         | Use                                                             |
| -------------- | ---------------------------- | --------------------------------------------------------------- |
| Display / hero | Newsreader (serif, variable) | Large headings, name, section titles                            |
| UI default     | JetBrains Mono               | Everything that isn't long prose: labels, badges, nav, metadata |
| Long prose     | Inter                        | Bio paragraphs, blog posts, case studies                        |

Mono is the default, not sans. Sans only shows up in long running text.

#### The size scale

Every size comes from `@theme` in `globals.css`. There are ten steps and no eleventh:

| Token             | Size / leading | The role it was cut for                              |
| ----------------- | -------------- | ---------------------------------------------------- |
| `text-display-xl` | 80 / 0.95      | The one hero on a page, serif                        |
| `text-display-lg` | 64 / 1         | Page titles, serif                                   |
| `text-display-md` | 40 / 1.1       | Page titles at narrow widths, admin h1, MDX h1       |
| `text-heading-lg` | 24 / 1.3       | Card titles and MDX h2, serif. Also card figures     |
| `text-heading-md` | 18 / 1.4       | MDX h3, entry titles in dense cards, decks           |
| `text-body-lg`    | 16 / 1.6       | Prose: posts, bios, page intros                      |
| `text-body-md`    | 14 / 1.5       | Secondary prose: blurbs, captions, card descriptions |
| `text-mono-md`    | 14 / 1.5       | Mono body: inputs, palette and dropdown items, code  |
| `text-mono-sm`    | 12 / 1.4       | The default UI label: card heads, badges, meta       |
| `text-mono-xs`    | 10 / 1.3       | The smallest label: field labels, group headings     |

Rules, each one paid for:

- **A token sets size and leading, never family.** `font-serif` / `font-sans` / `font-mono`
  stays at the call site, because mono is the default here and prose is the exception — a size
  that dragged a family with it would fight more call sites than it helped. Prefer the token
  whose name matches the family you are using; when the size you need only exists under
  another name, use it anyway and let the call site's `font-*` win.
- **No `text-[Npx]`, and no Tailwind default steps.** `text-xs` is the same 12px as
  `text-mono-sm` and `text-sm` the same 14px as `text-mono-md`; two spellings for one size is
  the ambiguity the scale removes. `lib/type-scale.test.ts` fails on either.
- **A new step has to be registered in `TYPE_SCALE` in `lib/utils.ts`.** tailwind-merge cannot
  tell that `text-mono-sm` is a font size, so an unregistered step gets filed as a text colour
  and silently deleted by any arbitrary colour class in the same `cn()` — see the comment
  there, and `lib/utils.test.ts`. (Write such a class out in full when you mention it in a doc:
  Tailwind v4 scans Markdown too, so a wildcard inside the brackets compiles to invalid CSS.)
- **No adjacent pair closer than ~25%.** That is why there is no 20 between 18 and 24, and no
  48 between 40 and 64. If two steps are 9% apart, they are one step with two names, and the
  question the scale exists to kill ("13 or 14?") comes straight back.
- **Two exceptions, both deliberate.** A decorative glyph (`◆`, `♥`, `■`, the mini piano's key
  labels) keeps a numeric inline size, because it is matched optically to the text beside it
  rather than filling a role — they are all 18px and under, which is what the test asserts. And
  a page title may be fluid, `fontSize: clamp(...)`, since a title that scales with the
  viewport is a technique rather than a missing step.

### Chrome

```
┌─────────────────────────────────────────────────────────┐
│ ● ● ●  [ home.tsx ◆ × ]  [ about.md × ]  [ + ]  · · ·  │  titlebar/tabs, 40px
├──┬──────────────────────────────────────────────────────┤
│  │                                                       │
│  │  content area                                         │  main
│  │                                                       │
│ ↑ │                                                       │
│sidebar│                                                     │
│(56px)│                                                     │
├──┴──────────────────────────────────────────────────────┤
│ ◆ annamaria.app  main ✓  ⌘K palette  UTF-8  TypeScript  │  status bar, 28px
└─────────────────────────────────────────────────────────┘
```

- Titlebar: decorative traffic lights + file tabs + meta on the right, with a brand underline that travels to the active tab (`components/chrome/titlebar.tsx`)
- Sidebar: logo `a` in serif italic + nav icons + a `◆` that travels to the active item (`components/chrome/sidebar.tsx`)
- Status bar: entrepta `StatusBar`, brand color, page context on the right
- Recurring glyphs: `◆` as the brand mark, `//` for comments, `$` for section prompts

---

## Folder structure

```
app/
  page.tsx                 home (bento grid)
  about/page.tsx
  blog/                     list + [slug]
  projects/                 list + [slug]
  piano/
  contact/page.tsx
  log/                      public feed of everything I finish
  roadmap/                  the board: to do, in progress, shipped
  admin/                    log + roadmap CRUD, behind AuthKit + the allowlist
  components/entrepta/     entrepta design system components (button, card, dialog, etc)
  api/
    contact/route.ts        email via Resend
    og/route.tsx             dynamic OG images
    now-playing/route.ts    Spotify Now Playing
    auth/callback/route.ts  WorkOS AuthKit callback
    v1/[[...route]]/        the Hono app — wristkit ingest + admin CRUD
    wristkit-sync/route.ts  legacy path, forwards into Hono (delete once the Shortcut moves)
  layout.tsx                root layout, editor chrome + fonts + theme setup
  globals.css                tokens, typography scale, theme overrides

proxy.ts                    AuthKit proxy (Next 16's name for middleware), /admin only

content/
  blog/*.mdx
  projects/*.mdx

components/
  chrome/                   titlebar, sidebar, command palette, page outline
  home/                     bento grid cards (stack, mini piano, GitHub, log)
  log/                      feed, catalog card, star rating
  roadmap/                  board, item card, progress card, status mark
  admin/                    entry + item forms, tables, rating input, quick add, delete dialogs
  spotify/                  Now Playing widget
  wristkit/                 Apple Watch activity card
  blog/                     feed, post card, MDX renderer, reading progress
  projects/                 feed + project card
  about/                    GitHub calendar, stack graph, timeline, interest card
  contact/                  contact form, channels card
  piano/                    keymap card
  brand/                    logo mark
  ui/                       shared card + motion primitives (see below), generated cover, icons, blur-fade

emails/
  contact-email.tsx         React Email template

lib/
  api/                      Hono app, routes, middleware (rate limit, api key, admin)
  auth/require-admin.ts     the email allowlist — AuthKit says who, this says whether
  db/client.ts              shared Postgres client, one pool for wristkit and /log
  log/                      schema, validation, queries, mutations, stars, date
  roadmap/                  schema, validation, queries, counts, mutations
  slug.ts                    slugify() + uniqueSlug(), shared by log and roadmap
  stack.ts                   the stack list + the simple-icons path per entry
  velite.ts                 content query helpers
  site-config.ts             name, email, socials, single source of identity
  experience.ts              career start date, years of experience
  spotify.ts                 token + playlist fetch
  wristkit/                  DB client (Drizzle), schema, validation
  utils.ts                   cn(), formatDate(), estimateReadingTime()
  metadata.ts                createMetadata() helper
  contact-schema.ts          zod schema for the contact form

store/
  nowPlayingStore.ts         Zustand, Spotify widget timer state

hooks/
  use-command-palette.ts
  use-theme.ts
```

---

## Pages

### Home (`/`)

Bento grid. Hero card, Spotify Now Playing, wristkit Apple Watch activity card, GitHub contributions, featured project, career stats. Section headers use `$ whoami`, `$ ls projects/`, style commands.

### `/about`

Two columns: photo + long bio. Career timeline (vertical brand line, circular dots). Stack icon grid. Interests.

### `/blog`

The shelf. One post per row, `.bento-card` like everything else, and the text taking the full
width. It briefly had a generated cover on the left and lost it: a poster earns its place when it
is the thing you scan for, and a post is scanned by its title — a rectangle beside every row was
decoration competing with the sentence doing the work. `/projects` keeps covers, because a project
_is_ a thing you recognise by sight.

Posts are grouped by year, and the outline in the left rail lists those years with a count. Grouping
is what gives the outline somewhere to point, and unlike `/log` it costs nothing — years descend and
posts descend inside them, which is the order the feed always had with headings added.

The tag filter mirrors into `?tag=` through `useUrlFilter`, **not** `useSearchParams`: on a static
route the latter makes prerender emit the Suspense fallback, so every post was missing from the HTML
a crawler reads, on the one page whose whole job is listing posts. The outline and the cards share
that filter, which is why `BlogFeed` owns both; the page header is server-rendered and passed in as
children.

Post page: Newsreader title, brand progress bar, sticky TOC, Shiki dark theme, callouts with a brand
left border.

### `/projects`

The uniform feed: one card per project, cover on top, text below, two per row, newest first.
Everything `/blog` does — the outline in the left rail listing years with a count, `useUrlFilter`
for the tag pills, the header server-rendered and passed into the client feed as children — is the
same here on purpose. Two sibling index pages solving the same problem differently is the
divergence the Standardization check is about.

Where they differ is the cover, and only there. Projects get **real images**, kept in
`public/projects/` and named after the project: `cover: "/projects/name.png"` in the frontmatter.
The card renders them with `fill`, so no intrinsic dimensions are needed, and a `public/` path is
local — `next/image` still optimises it with no `remotePatterns` entry. The field is optional and
stays optional: a project without one falls back to the generated cover, so the grid is never
missing a tile and adding art later is a one-line frontmatter change.

It was `s.image()` on a co-located file, which also returned a blur placeholder. What that gave up
is the placeholder; what it must not give up is **proof the file exists**, so `velite.config.ts`
checks the path with `existsSync` instead. That check is not theoretical. `wristkit.mdx` shipped
`cover: "./wirstkit.png"` — two letters swapped — and because `output.clean` empties `.velite`
before writing and a failed validation then writes nothing, **every project vanished from
`/projects`** and the page said "nothing published yet". One typo in one file, and the symptom
pointed nowhere near it.

Case study page: left sidebar with metadata (stack, links, period).

### `/piano`

A two-octave Web Audio piano, and the one page where the instrument is deliberately **not** a card.
The wooden cabinet is skeuomorphic on purpose; wrapping it would be a frame inside a frame.

Everything around it is the shared surface, though. The key mapping was one hand-written box
painted `--bg-surface` — the token for what sits _above_ a card — and is four `.bento-card` now, one
per octave group. The six song buttons hand-rolled the same surface six times and are
`.bento-card` + `.bento-card-sm` with `!grid`, since the class sets flex-column and those rows are
three columns. They are the one card on the site with **no spotlight**: they are controls whose
playing state already lights the whole surface brand, and a glow following the cursor across six of
them would compete with the one that means something.

### `/contact`

The form leads. It used to come last — hero, then four channel cards, then the only thing on the
page that does anything, two scrolls down. Now it is the wide card beside a narrow column holding
the four channels as **rows in one card**, and the hero shrank from 96px to ~62px to make room
above the fold.

The form owns its card in both states, rather than the page wrapping it — the success state replaces
the form entirely, and a page-owned card would have nested a card inside a card the moment someone
hit send. entrepta `Input` + `Button`, loading state, inline field errors, a network failure told
apart from a rejection, honeypot on the backend.

`app/components/entrepta/card.tsx` is gone. It was a second card vocabulary with exactly one
consumer — this form's success state — while seventeen other files spoke `.bento-card` +
`components/ui/card-parts`.

### `/log`

One feed for everything I finish: films, series, books, albums, podcasts, games. Catalog cards with poster, type badge, serif title, `creator · year` and a drawn star rating. Favourites carry a `♥`; entries with a note get an inline expand; entries with an external link make the whole card clickable.

Grouped by type, with the outline in the left rail listing those types and their counts — the same
arrangement `/blog` and `/projects` use. Grouping costs the ordering nothing here: `TYPE_ORDER` in
`lib/log/queries.ts` is `["music"]`, and grouping in **arrival order** rather than by `LOG_TYPES`
keeps it exactly — albums lead because the query already put them first, and favourites still lead
inside each section.

Filter pills mirror into `?type=` through `useUrlFilter`, read with `useSyncExternalStore` rather
than `useSearchParams` so every card lands in the server HTML.

The card is `.bento-card` + `.bento-card-sm`. It used to draw its own `rounded-[14px] border p-3.5`
and was the one card on the site that didn't hover like the rest; `-sm` exists because 24px of
padding on a 320px tile in a poster grid is most of the tile, and a density modifier is cheaper than
a second card.

Posters go through `next/image` pointed at **`/api/v1/poster/<base64url>`** — a local path, so
they are optimised without a single poster host appearing in `remotePatterns`. That property is
the whole reason they used to be a plain `<img>`, and it is kept; what changed is that the plain
`<img>` was costing 2.7 MB of oversized bytes on `/log` (one poster was 1791×2704 at 1.79 MB,
drawn 92px wide — 275× more than it needed) and eleven third-party cookies, nine of them Adobe
Analytics and Kampyle from `image.api.playstation.com`. Hotlinking hands every visitor to the
poster host's analytics; that was the half that mattered, and it is what put the page's
best-practices score at 77.

The route only ever fetches a URL already stored in `log_entries.poster_url`, so it is not an
open proxy — writing the entry is what authorises the image, and there is nothing to maintain.
The URL rides in the path rather than a query string because `next/image` rejects a local `src`
with a query unless `images.localPatterns` matches it, and a `LocalPattern`'s `search` is a
literal with no wildcard. A URL that doesn't load falls back to the type label.

Every entry has a slug, but there is no `/log/[slug]` page and there shouldn't be. An entry is a title, a creator, a year and maybe two sentences — a page per entry would be a hundred thin pages diluting a small site, competing for queries Letterboxd and Goodreads already own. The slug is there to be a stable anchor and to keep the option open, not as a route waiting to be built.

### `/roadmap`

Three columns, to do, in progress and shipped, of what this site is going to become, over a
progress card whose stepper walks the same three stages. Every item is a `.bento-card` with
the status mark, a serif title, the blurb and a `Badge`; shipped ones are struck through.
Hovering a card runs a light around its border, and the in-progress ones rest dimly lit.

Filter pills mirror into `?status=` and are read with `useSyncExternalStore`, like `/log`,
so every card lands in the server HTML. They are also what keeps the cards' `layoutId`
animation alive: the mark is **read-only** on the public site, so filtering is the only
thing a visitor can do that makes a card travel.

It sits in the primary nav now — an eighth tab in the titlebar and an eighth icon in the
sidebar, like every other page. It used to live under a hairline in the sidebar and open as a
dynamic tab, on the grounds that a permanent eighth tab would crowd the row; the row is a
scroller with fade edges and handles that on its own, and a page reachable from the sidebar
and the palette but never from the tabs was the odd one out.

That sidebar link used to open a dialog containing a copy of the board; the page says the same
thing with a URL people can send each other, so the dialog was a second implementation to keep
in step and it went. The public `GET /api/v1/roadmap` went with it, because the dialog was its
only consumer.

### `/admin`

Guarded by WorkOS AuthKit **and** an `ADMIN_EMAILS` allowlist checked at the route level, not just in `proxy.ts`. Anyone else gets a 404, never a 403. `/admin/log` lists everything including drafts; `/admin/roadmap` lists everything including
`raw`. Create, edit and delete go through Hono at `/api/v1/admin/log` and
`/api/v1/admin/roadmap`.

Full docs, including the phase-by-phase decisions and their reasoning:
[docs/log-plan.md](docs/log-plan.md) and
[docs/roadmap-component-plan.md](docs/roadmap-component-plan.md).

---

## Content frontmatter

Schemas live in `velite.config.ts`.

**Blog:**

```yaml
---
title: "Post title"
description: "Short description for SEO and cards"
date: "2026-06-09"
tags: ["next.js", "typescript"]
published: true
---
```

**Projects:**

```yaml
---
title: "Project name"
description: "Short description"
date: "2026-01-01"
tags: ["next.js", "resend"]
github: "https://github.com/imnotannamaria/name"
live: "https://name.vercel.app"
cover: "/projects/name.png" # optional, file lives in public/projects/
featured: true
published: true
---
```

Only the most recent `featured: true` project shows on the home page.

---

## Environment variables

```bash
# Resend, required for the contact form
RESEND_API_KEY=re_xxxxxxxxxxxx

# Base URL, used for sitemap and OG images
NEXT_PUBLIC_BASE_URL=https://annamaria.app

# Spotify Now Playing widget, optional, Client Credentials flow
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_PLAYLIST_ID=

# Postgres, shared by the wristkit card and /log, optional
# On Supabase use the transaction pooler string (port 6543), not the direct one
DATABASE_URL=

# Old name for DATABASE_URL, still read as a fallback
WRISTKIT_DATABASE_URL=

# wristkit ingest endpoint, optional
WRISTKIT_API_KEY=

# WorkOS AuthKit — guards /admin, optional (without it /admin is unreachable)
WORKOS_API_KEY=sk_test_xxxxxxxxxxxx
WORKOS_CLIENT_ID=client_xxxxxxxxxxxx
WORKOS_COOKIE_PASSWORD=              # 32+ chars: openssl rand -base64 32
NEXT_PUBLIC_WORKOS_REDIRECT_URI=https://annamaria.app/api/auth/callback

# Comma-separated emails allowed into /admin. AuthKit signs people in;
# this is what decides who is actually let through.
ADMIN_EMAILS=

# GitHub GraphQL, for the contributions grid on / and /about, optional.
# Classic PAT, `read:user` scope — see lib/github/contributions.ts.
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

Everything except Resend and the base URL is optional. Without a database the wristkit card shows an error state and `/log` renders empty; without WorkOS `/admin` is unreachable; without `GITHUB_TOKEN` the contributions card shows an empty state. The rest of the site still builds and runs either way.

---

## Scripts

```json
{
  "dev": "run-p dev:velite dev:next",
  "build": "velite build && next build",
  "postbuild": "next-sitemap",
  "lint": "eslint . && prettier --check .",
  "format": "prettier --write .",
  "email:dev": "email dev --dir emails",
  "seed:log": "tsx scripts/seed-log.ts",
  "seed:roadmap": "tsx scripts/seed-roadmap.ts"
}
```

---

## Conventions

- Brand accents always derive from `--fg-brand` via `color-mix()`, never a hardcoded hex, so every theme stays reactive.
- Mono is the default UI font. Reach for Inter only in long prose blocks.
- entrepta components in `app/components/entrepta/` are owned code, edit them directly rather than wrapping or overriding from outside.
- Chrome mobile won't resize below about 550px in DevTools. For real narrow viewports (375px), use the device toolbar, not window resize.
- New API routes go in the Hono app under `lib/api/routes/`, mounted at `/api/v1`. The older handlers (`/api/contact`, `/api/og`, `/api/now-playing`) stay where they are — they work, and moving them buys nothing.
- Anything under `/admin` calls `requireAdmin()` (pages) or `requireAdminApi` (routes). The `proxy.ts` matcher is not the gate; a matcher can be edited wrong.
- **Before committing, run the tests.** `npm run test:all` walks every layer — unit, integration, then e2e — and does the database and build setup each one needs (`-- --no-e2e` to skip the browser layer when the change doesn't touch it). At minimum run `npm run test` (the unit project) alongside `npm run lint` and `npx tsc --noEmit`. A green commit is the baseline; don't commit a red one without saying so.
- **Pages that read Postgres are `force-dynamic`, not ISR.** That covers `/`, `/log`, `/roadmap` and everything under `/admin`. The log and the wristkit rings are supposed to read as live — an activity ring frozen at this morning's numbers, or an entry I published ten minutes ago still missing from the feed, is a worse experience than the handful of milliseconds two indexed queries cost against a pooled connection. Caching them was buying convenience, not speed, and it bought it at the price of a `revalidatePath` call I'd have to remember every time a new page started reading the same table. Content that comes from MDX stays static — this is about the database, not about the site.
- Because of the above, mutations do **not** call `revalidatePath`. If you ever put log or wristkit data on a cached page, that decision changes and the trade-off above is the one to re-argue.

### Writing new UI: five things that broke silently once

Every one of these shipped, passed `tsc`, `eslint` and the whole suite, and was found by
looking at the screen. They are the questions to ask _while_ writing, not after.

- **`cn()` is `twMerge`, and twMerge only knows Tailwind's vocabulary.** A class from a custom
  `@theme` namespace gets filed under whatever group its shape resembles — `text-mono-sm` was
  read as a text _colour_ — and then a real colour class in the same call silently deletes it,
  or is deleted by it. Registering the namespace in `lib/utils.ts` is what makes the merge
  correct; `lib/utils.test.ts` is what keeps it that way. **If you add a custom utility, add it
  there in the same commit.**
- **A row with two children and `justify-between` has no overflow contract until you write
  one.** "It fits" is not a contract: the card heads fit at 11px and broke the day the scale
  moved them to 12px, because `uppercase` plus `tracking-[0.08em]` widens every character.
  Decide out loud what happens when the two stop fitting — the row wraps and the halves don't
  (`CardHead`), or one half truncates. And remember `.bento-card` sets `overflow: hidden`, so
  a `whitespace-nowrap` child that overflows is _clipped with no ellipsis_, which looks like
  missing data rather than a layout bug.
- **Text on a `--fg-brand` fill uses `--fg-on-brand`.** Never a fixed near-white or near-black:
  a hardcoded `zinc-50` fails WCAG AA on 7 of the 12 theme × mode combinations, including the
  default theme in dark mode at 3.72:1. The measured table is above `--fg-on-brand` in
  `globals.css`. Same for a border on that fill — `color-mix()` from the token, not white at
  30%.
- **Don't override a component from its only caller.** The status bar hardcoded
  `fixed right-0 bottom-0 left-0 z-40` and `app/layout.tsx` undid all five with inline styles.
  entrepta is owned code: change the component. If a second consumer ever wants the other
  behaviour, that is a variant, not an override.
- **A glyph is not a type role.** `◆`, `♥`, `■`, the mini piano's key labels: they are matched
  optically to the text beside them and keep a numeric inline size, all 18px and under. Use
  `<Diamond />` for the brand mark rather than an inline span — that one reached eleven copies,
  and the tenth had lost its `aria-hidden`, so a screen reader announced "black diamond suit"
  before a file name.

And two mechanical ones: **Tailwind v4 scans Markdown**, so a class written as an example in a
doc compiles — a wildcard inside the brackets emits invalid CSS and warns on every build. And
**satori does not resolve custom properties**, so `app/api/og` keeps numeric `fontSize`; a
`var(--text-*)` there renders at size zero.

---

## The roadmap

Raw ideas for the site used to live in a `ROADMAP.md` at the repo root. They live in
Postgres now, written and edited at `/admin/roadmap`, and shown at `/roadmap`.

The file is gone but its rules are not:

- **An item is two or three sentences.** What the thing is, and at most one line on why I
  want it.
- **When I ask you to add one, write it down — don't evaluate it.** No feasibility, no
  architecture, no list of what makes it hard, no accessibility caveats. I know something
  might not work; finding that out is what the plan doc is for, later, if the idea
  survives. Adding an item is me not wanting to lose a thought, not asking for an opinion
  on it. The same sentence is the helper text under the blurb field, so the rule lives
  where the writing happens.
- **New items land as `raw`,** which never renders on the site. That status _is_ the old
  file: somewhere to put a thought without deciding anything about it. Promote it to `todo`
  when it becomes real.
- **An idea that grows into real work becomes `docs/<name>-plan.md`,** the way the tree and
  this roadmap did, and the item gets a `plan` pointing at it. That is where analysis
  belongs, and it is what keeps the board from turning into a pile of half-designs nobody
  rereads.

If capture ever starts costing more than typing a line into an open editor did, that is the
signal the move was wrong — the fix is an import script, not going back to the file. The
reasoning is in [docs/roadmap-component-plan.md](docs/roadmap-component-plan.md).

`ROADMAP.md` is gone. The seed carried every item it held into the table, and a file
regenerated from the database was a second copy of the same list to keep in step, which is
the problem the move was supposed to solve. `scripts/seed-roadmap.ts` still has the
original text if it is ever needed.

---

## Cards and motion

Every card on the site is built from the same pieces. Reaching for raw markup instead is how the home page ended up with eight cards that each invented their own header, and how the contributions card spent months re-implementing `.bento-card` in inline styles with a React state hook driving its hover.

### The pieces

| Piece                             | What it is                                                   |
| --------------------------------- | ------------------------------------------------------------ |
| `.bento-card` (globals.css)       | The card surface: padding, radius, border, hover             |
| `.bento-card-sm` / `-xl`          | The same card, denser or roomier. A modifier, not a new card |
| `CardHead` / `CardFoot` / `Badge` | `components/ui/card-parts` — the chrome inside a card        |
| `ArrowLink` / `ArrowAffordance`   | A link with a travelling arrow and a rule that wipes in      |
| `useSpotlight` + `Spotlight`      | The glow that trails the cursor across a card                |
| `useReveal` + `Reveal`            | The entrance every card shares                               |
| `RollingNumber`                   | An odometer for any number worth watching land               |
| `TypeIn`                          | Text that assembles itself a piece at a time                 |

Card shape is fixed: `◆ name` on the left of the head, muted meta on the right, no border and no fill on the head itself. The foot is a `//` comment on the left and an accent on the right. If a card needs something the pieces don't do, change the piece.

`--bg-card` is for cards. `--bg-surface` is for things that sit _above_ a card — dropdowns, dialogs, code blocks, tooltips — which genuinely need to be lighter than what they cover.

### Motion rules, each one paid for

- **Entrances use `whileInView` with `once`, never `animate`** — including above the fold, where the observer is satisfied on the first frame anyway. One trigger everywhere means there is no "is this above the fold" judgement left to get wrong, and getting it wrong is silent: the animation runs perfectly, to an empty room.
- **Never put `whileInView` on an element that starts at zero size.** `scaleX: 0` is no width, no width is no area, and an observer asked for a fraction of no area never fires. Put the trigger on an ancestor with an honest box and reach the children through variants.
- **Drive SVG from an HTML ancestor.** An IntersectionObserver aimed at an SVG child is unreliable — in practice one ring of three fired and the other two snapped.
- **One variant label per element.** If something already answers to a state axis (`open`/`closed`), its entrance needs its own wrapper. A second axis has nowhere to live.
- **A stagger delay belongs to the entrance and nothing else.** Left on the transition, every later interaction re-applies it: the in-flight spring is interrupted and its replacement sits out the delay before moving, which looks exactly like a freeze.
- **Motion can't interpolate a colour hiding inside a custom property.** `box-shadow: … var(--shadow-brand)` stays in CSS.
- **Splitting Motion and CSS across two properties of one element is sometimes the point** — the rings draw through Motion and thicken through CSS, because driving both from Motion means every hover restarts the draw.
- **Motion walks straight past the global `prefers-reduced-motion` reset.** That block only zeroes CSS. Anything animated through JS asks `useReducedMotion()` itself.
- **Hover that moves an element must not move it out from under the cursor.** Keep the hit area still and move the skin, or you get a flicker loop: lift, un-hover, drop, hover, forever.
- **Something that lifts inside a clipping container needs clearance**, not spacing. Clip plus lift equals a cut-off border.
- **Animated text keeps all its text in the DOM.** Fade the pieces in; never grow `text.slice(0, n)`, which ships an empty heading to a crawler and to anyone whose JS hasn't run. Pieces are `aria-hidden` under one `aria-label`, and anything that wraps splits by word — inline-block characters can't break a line where a word ends.
- **Don't rebuild a gradient string every frame.** Translate a fixed one; a card-sized repaint at 60fps starves whatever else is animating.
- **Equal animations are not equal perception.** A sweep driven by a value covers 80% of a circle for one metric and 10% for another. If the small case has to read, give it an arrival of its own rather than assuming the shared animation is enough.

---

## Code review

When asked to review a branch or PR, review the full diff against `main`.

The checks below are the ones this codebase has actually been bitten by. Read them as prompts to look, not as a list to tick — a diff that touches none of these still deserves a read, and a rule that clearly doesn't apply to the diff in front of you isn't a finding.

- **Security** — auth on every admin surface (layout AND route, never just the proxy matcher), input validation on the server, URL fields restricted to `https://` before they become an `href`, no secrets or stack traces in responses, middleware ordered so unauthenticated requests never reach a body parse.
- **Backend (Hono)** — new routes live under `lib/api/routes/` behind the right middleware, and errors return JSON through `onError` rather than a leaked stack. Where a route or page sits on the caching decisions in Conventions, check it agrees with them; if it has a reason not to, the reason belongs in the diff.
- **Loading and error states** — a page that hits the database needs a `loading.tsx`; where the data IS the page it needs an `error.tsx`, because an empty state when the DB is down is a lie. Forms need a submitting state and need to tell a network failure apart from a rejection.
- **Reuse before invention** — this is the one worth reading the diff twice for. A new card that hand-rolls a header, a hover, or a surface is re-implementing something in `components/ui`; see Cards and motion. The tell is inline styles that add up to `.bento-card`, or a `useState` doing what `:hover` does.
- **Standardization** — reuse asks "does this already exist?". This asks the harder question: **does this page look like it belongs to the same site as the home page?** Two failures, and the second is the one that gets missed.

  _Divergence_ — a page that solves a solved problem its own way. Every page is the editor metaphor: outline panel, `$ command` or `## label` section heads, `.bento-card` for collections, prose for narrative, mono as the default and Inter only in long text. A section that invents its own header rhythm, its own footer rule, or its own surface is a page drifting, even when every line of it is fine on its own.

  _Duplication_ — the same component living in more than one place. `about-outline` / `contact-outline` / `piano-outline` were three files whose diff was a comment, a function name, a string and a footer; they only got folded together when a change had to be applied to all three at once. The rule now: **the second copy is a warning, the third is a bug.** When a diff adds copy number two, say so in the review even if extracting is out of scope — that note is what makes the extraction obvious later instead of expensive.

  Two questions that catch most of it: if this pattern had to change, how many files would you edit? And could a reader tell which page a screenshot came from, for the right reasons rather than because one of them is styled differently?

- **Motion** — every rule in Cards and motion came out of a bug that shipped. The expensive ones to miss: an entrance on `animate` instead of `whileInView`, a trigger on an element with no area, and anything animated through JS that never asks `useReducedMotion`.
- **Accessibility** — real semantics over roles on divs, `aria-pressed`/`aria-expanded` on toggles, screen-reader text for glyph-only info (stars, ♥), hover-only affordances mirrored on `focus-visible`, no two links sharing a name and pointing elsewhere, and contrast wherever text sits _on top of_ `--fg-brand` — that combination changes per theme and orange (marmalade) is where white text fails first.
- **Theme reactivity** — grep the diff for hardcoded brand hexes; every accent derives from `--fg-brand`. Fixed colours are only acceptable as overlays on images, where no token can guarantee legibility.
- **SEO** — metadata on new pages, and the content itself in the server HTML. Two ways it silently isn't: `useSearchParams` on a static route makes prerender emit the Suspense fallback (`useSyncExternalStore` reads the URL without that), and any animation that gates mount on a timer or grows a sliced string ships an empty element.
- **Performance** — queries whose result is derivable from data already fetched in the same render (a `GROUP BY` beside the query returning the same rows is the usual shape); per-frame work that repaints rather than composites; plain `<img>` needs `loading="lazy"` and a fixed-aspect container so there is no CLS.
- **Responsive** — reason about 375px minus the 56px sidebar; wide tables scroll rather than reflow; grid tracks use `min(Npx, 100%)`. Code-level checks only: hand the visual pass to Anna, never drive a browser.
- **Bugs** — timezone traps around `new Date("YYYY-MM-DD")`; anything date-dependent computed on both sides of the server/client boundary, which is a hydration mismatch waiting for a render that straddles midnight; pages that would fail `next build` with the database unreachable.
- **Class merging** — any class the diff invents outside Tailwind's own vocabulary: is its namespace registered in `TYPE_SCALE` / `extendTailwindMerge` in `lib/utils.ts`? An unregistered one is misfiled by twMerge and then deleted, or deletes a colour, and nothing fails. Read `cn()` calls as the merged string, not as the arguments: `cn(base, className)` with a caller-supplied class is where a component's own styling gets silently dropped, in either direction.
- **Overflow contracts** — for every row the diff adds or touches with two children and `justify-between`: what happens when they stop fitting? If the answer is "they fit", that is not an answer. Especially inside `.bento-card`, which clips.
- **Overriding a component from its caller** — inline styles or classes in a consumer that undo what the component sets. The fix is almost always in the component, since entrepta is owned code and most of them have one consumer.
- **Type scale** — sizes come from the ten `@theme` steps; no `text-[Npx]`, no Tailwind default step, no numeric inline `fontSize` above glyph size. `lib/type-scale.test.ts` enforces all three, so a diff that needs an exception has to argue for it in the diff.

**What the checks cannot see.** If a diff changes rendered size, spacing or wrapping and nothing
else, then `lint`, `tsc` and the whole suite passing says almost nothing — they do not measure
text. Say so in the review, and hand back a concrete list: which page, which element, which
breakpoint, and what changed in pixels. "Do a visual pass" is not that list. The typography
branch is the case study: three of the first three places Anna looked were broken, and every
check was green the whole time.

Also run `npm run lint` and `npx tsc --noEmit` and report the result.

Deliver the findings as a Markdown doc at the repo root (e.g. `CODE-REVIEW-<branch>.md`), uncommitted. Open with a clear production-readiness verdict, cite findings as `file:line` links, close with a prioritized action table (fix before merge / follow-up / future), and note explicitly which checks are left for visual pass.
