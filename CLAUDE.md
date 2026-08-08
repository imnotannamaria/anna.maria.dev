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
| Email (send)     | Resend SDK                                                         |
| Email (template) | React Email                                                        |
| Syntax highlight | Shiki + rehype-pretty-code                                         |
| Themes           | next-themes + entrepta ThemeSwitcher, dark/light + 6 color presets |
| OG image         | @vercel/og                                                         |
| Analytics        | Vercel Analytics                                                   |
| SEO              | next-sitemap                                                       |
| Icons            | Phosphor Icons, simple-icons                                       |
| Database         | Postgres (Supabase) via Drizzle ORM — wristkit + /log              |
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

- Titlebar: decorative traffic lights + file tabs + meta on the right (`components/chrome/titlebar.tsx`)
- Sidebar: logo `a` in serif italic + nav icons + `◆` active indicator (`components/chrome/sidebar.tsx`)
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
  admin/                    log CRUD, behind AuthKit + the allowlist
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
  chrome/                   titlebar, sidebar, command palette
  home/                     bento grid cards (stack, mini piano, GitHub, log)
  log/                      feed card, star rating, filter feed
  admin/                    entry form, table, rating input, delete dialog
  spotify/                  Now Playing widget
  wristkit/                 Apple Watch activity card
  blog/                     MDX renderer, reading progress
  projects/                 project card
  about/                    GitHub calendar
  contact/                  contact form
  brand/                    logo mark
  ui/                       shared UI helpers (blur-fade, icons, inline-arrow)

emails/
  contact-email.tsx         React Email template

lib/
  api/                      Hono app, routes, middleware (rate limit, api key, admin)
  auth/require-admin.ts     the email allowlist — AuthKit says who, this says whether
  db/client.ts              shared Postgres client, one pool for wristkit and /log
  log/                      schema, validation, queries, mutations, slug, stars, date
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

List with tag filter pills. Each item: mono date, title, tags, reading time. Post page: Newsreader title, brand progress bar, sticky TOC, Shiki dark theme, callouts with a brand left border.

### `/projects`

Two column card grid, thumbnail with brand-to-zinc gradient. Case study page: left sidebar with metadata (stack, links, period).

### `/piano`

Small interactive piano, entrepta tokens.

### `/contact`

Two columns: text + social links | form. entrepta `Input` + `Button` with loading state. Inline feedback, no redirect, no modal. Honeypot on the backend.

### `/log`

One feed for everything I finish: films, series, books, albums, podcasts, games. Catalog cards with poster, type badge, serif title, `creator · year` and a drawn star rating. Favourites carry a `♥`; entries with a note get an inline expand; entries with an external link make the whole card clickable.

Ordered albums first, then favourites, then newest — `TYPE_ORDER` in `lib/log/queries.ts` decides. Filter pills are client-side and mirror into `?type=`, read through `useSyncExternalStore` rather than `useSearchParams` so every card lands in the server HTML.

Posters are plain `<img>`, not `next/image`, so no host allowlist has to be kept in sync. A URL that doesn't load falls back to the type label.

### `/admin`

Guarded by WorkOS AuthKit **and** an `ADMIN_EMAILS` allowlist checked at the route level, not just in `proxy.ts`. Anyone else gets a 404, never a 403. `/admin/log` lists everything including drafts; create, edit and delete go through Hono at `/api/v1/admin/log` and call `revalidatePath("/log")`.

Full docs, including the phase-by-phase decisions and their reasoning: [docs/log-plan.md](docs/log-plan.md).

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
```

Everything except Resend and the base URL is optional. Without a database the wristkit card shows an error state and `/log` renders empty; without WorkOS `/admin` is unreachable. The rest of the site still builds and runs either way.

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
  "seed:log": "tsx scripts/seed-log.ts"
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
