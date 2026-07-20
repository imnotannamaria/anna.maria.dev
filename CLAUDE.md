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
| wristkit storage | Postgres via Drizzle ORM                                           |
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
  components/entrepta/     entrepta design system components (button, card, dialog, etc)
  api/
    contact/route.ts        email via Resend
    og/route.tsx             dynamic OG images
    now-playing/route.ts    Spotify Now Playing
    wristkit-sync/route.ts  wristkit ingest endpoint
  layout.tsx                root layout, editor chrome + fonts + theme setup
  globals.css                tokens, typography scale, theme overrides

content/
  blog/*.mdx
  projects/*.mdx

components/
  chrome/                   titlebar, sidebar, command palette
  home/                     bento grid cards (stack, mini piano, GitHub)
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

# wristkit Apple Watch activity card, optional
WRISTKIT_DATABASE_URL=
WRISTKIT_API_KEY=
```

Spotify and wristkit are optional. Without them the widgets just show an empty or error state, the rest of the site still builds and runs.

---

## Scripts

```json
{
  "dev": "run-p dev:velite dev:next",
  "build": "velite build && next build",
  "postbuild": "next-sitemap",
  "lint": "eslint . && prettier --check .",
  "format": "prettier --write .",
  "email:dev": "email dev --dir emails"
}
```

---

## Conventions

- Brand accents always derive from `--fg-brand` via `color-mix()`, never a hardcoded hex, so every theme stays reactive.
- Mono is the default UI font. Reach for Inter only in long prose blocks.
- entrepta components in `app/components/entrepta/` are owned code, edit them directly rather than wrapping or overriding from outside.
- Chrome mobile won't resize below about 550px in DevTools. For real narrow viewports (375px), use the device toolbar, not window resize.
