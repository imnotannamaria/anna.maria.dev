# anna.maria.dev

![anna.maria.dev cover](public/images/og-cover.jpg)

Personal portfolio and open source template for full-stack engineers. Built as an editor metaphor: titlebar with tabs, sidebar navigation, status bar, all styled with the entrepta design system. Dark first, TypeScript strict.

**Live:** [annamaria.app](https://annamaria.app)

---

## What's inside

- **Home**: bento grid with a hero card, Spotify Now Playing widget, an Apple Watch activity card (via wristkit), GitHub contributions, a featured project, and career stats
- **About**: career timeline, education, tech stack grid, GitHub contributions calendar
- **Blog**: MDX posts with syntax highlighting (Shiki), reading progress bar, and tag filtering
- **Projects**: case studies with sidebar metadata and rich MDX content
- **Piano**: a small interactive piano
- **Contact**: email form powered by Resend and React Email, with a honeypot
- **Command palette**: ⌘K navigation across the whole site
- **Editor chrome**: titlebar, sidebar, and status bar shared across every page
- **Themes**: dark by default, light toggle, 6 brand color presets, no flash
- **SEO**: dynamic OG images, sitemap, robots.txt, canonical URLs

The Spotify and wristkit widgets are optional. Without their environment variables the site still builds and runs, the widgets just show an empty or error state.

## Stack

| Layer            | Tech                                    |
| ---------------- | --------------------------------------- |
| Framework        | Next.js 16 (App Router)                 |
| Language         | TypeScript (strict)                     |
| Styling          | Tailwind CSS v4                         |
| Design system    | entrepta (components copied in, no SDK) |
| Content          | MDX via Velite                          |
| State            | Zustand                                 |
| Animations       | Motion v12                              |
| Email            | Resend + React Email                    |
| Syntax highlight | Shiki                                   |
| Themes           | next-themes + entrepta ThemeSwitcher    |
| OG images        | @vercel/og                              |
| SEO              | next-sitemap                            |
| Icons            | Phosphor Icons, simple-icons            |
| wristkit storage | Postgres via Drizzle ORM                |
| Deploy           | Vercel                                  |

---

## Fork and customize in 5 minutes

### 1. Clone the repo

```bash
git clone https://github.com/imnotannamaria/anna.maria.dev.git my-portfolio
cd my-portfolio
npm install
```

### 2. Set up environment variables

Copy the example and fill in your values:

```bash
cp .env.example .env.local
```

```bash
# Required: get yours at resend.com
RESEND_API_KEY=re_xxxxxxxxxxxx

# Your public URL (used for sitemap and OG images)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Optional: Spotify Now Playing widget (Client Credentials flow)
SPOTIFY_CLIENT_ID=xxx
SPOTIFY_CLIENT_SECRET=xxx
SPOTIFY_PLAYLIST_ID=xxx

# Optional: wristkit Apple Watch activity card
WRISTKIT_DATABASE_URL=postgresql://user:pass@host:5432/db
WRISTKIT_API_KEY=replace-with-32-random-bytes
```

Leave the Spotify and wristkit variables out if you don't need those widgets.

### 3. Update your personal info

Edit the following files with your own data:

| File                                   | What to change                         |
| -------------------------------------- | -------------------------------------- |
| `lib/site-config.ts`                   | Name, email, GitHub/LinkedIn/X handles |
| `app/page.tsx`                         | Bio, stats, sections shown on home     |
| `app/about/page.tsx`                   | Full bio, timeline, stack, interests   |
| `app/layout.tsx`                       | Site title, description, theme presets |
| `app/api/contact/route.ts`             | Email `from` and `to` addresses        |
| `components/about/github-calendar.tsx` | Your GitHub username                   |
| `lib/metadata.ts`                      | `baseUrl` fallback                     |

### 4. Run locally

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000).

---

## Adding content

### Blog post

Create `content/blog/your-post-slug.mdx`:

```mdx
---
title: "Your post title"
description: "A short description for SEO and cards."
date: "2026-01-01"
tags: ["next.js", "typescript"]
published: true
---

Your content here.
```

### Project

Create `content/projects/your-project-slug.mdx`:

```mdx
---
title: "Project Name"
description: "What it does in one sentence."
date: "2026-01-01"
tags: ["react", "typescript"]
github: "https://github.com/you/project"
live: "https://project.vercel.app"
featured: true
published: true
---

## Overview

...
```

Set `featured: true` to show it as the featured project on the home page. Only the most recent featured project is shown there.

---

## Configuring email (Resend)

1. Create an account at [resend.com](https://resend.com)
2. Add and verify your domain
3. Create an API key and add it to `.env.local`
4. Update `from` and `to` in `app/api/contact/route.ts`:

```ts
from: "Portfolio <hello@yourdomain.com>",
to: ["you@yourdomain.com"],
```

## Configuring the Spotify widget (optional)

1. Create an app at the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Grab the client ID and secret, and the ID of a public playlist
3. Add `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and `SPOTIFY_PLAYLIST_ID` to `.env.local`

The widget uses the Client Credentials flow, server to server, so the secret never reaches the browser.

## Configuring wristkit (optional)

The Apple Watch activity card reads from your own Postgres database. See [wristkit](https://wristkit-web.vercel.app/) for the full setup: the SQL migration, the iOS Shortcut, and the sync endpoint at `app/api/wristkit-sync/route.ts`.

---

## Deploy to Vercel

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add the environment variables from `.env.local` in the Vercel dashboard
4. Deploy: sitemap and robots.txt are generated automatically at build time

---

## Project structure

```
app/
  page.tsx                 # Home
  about/page.tsx           # About
  blog/                    # Blog list + [slug]
  projects/                # Projects list + [slug]
  piano/                   # Piano
  contact/page.tsx         # Contact form
  components/entrepta/     # entrepta design system components
  api/
    contact/route.ts       # Email via Resend
    og/route.tsx           # Dynamic OG images
    now-playing/route.ts   # Spotify Now Playing
    wristkit-sync/route.ts # wristkit ingest endpoint
  layout.tsx               # Root layout (editor chrome)

content/
  blog/*.mdx               # Blog posts
  projects/*.mdx           # Project case studies

components/
  chrome/                  # Titlebar, sidebar, command palette
  home/                    # Bento grid cards (stack, mini piano, GitHub)
  spotify/                 # Now Playing widget
  wristkit/                # Apple Watch activity card
  blog/                    # MDX renderer, reading progress
  projects/                # Project card
  about/                   # GitHub calendar
  contact/                 # Contact form
  ui/                      # Shared UI helpers

emails/
  contact-email.tsx        # React Email template

lib/
  velite.ts                # Content query helpers
  site-config.ts           # Name, email, socials
  experience.ts            # Career start date, years of experience
  spotify.ts               # Spotify token + playlist fetch
  wristkit/                # DB client, schema, validation
  utils.ts                 # cn(), formatDate(), estimateReadingTime()
  metadata.ts              # createMetadata() helper
```

---

## License

MIT. Fork freely, customize, make it yours.
