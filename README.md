# [anna.maria.dev](http://anna.maria.dev)

anna.maria.dev cover

Personal portfolio and open source template for full-stack engineers. Built as an editor metaphor: titlebar with tabs, sidebar navigation, status bar, all styled with the entrepta design system. Dark first, TypeScript strict.

**Live:** [annamaria.app](https://annamaria.app)

---

## What's inside

- **Home**: bento grid with a hero card, Spotify Now Playing widget, an Apple Watch activity card (via wristkit), GitHub contributions, a featured project, and career stats
- **About**: career timeline, education, tech stack grid, GitHub contributions calendar
- **Blog**: MDX posts with syntax highlighting (Shiki), reading progress bar, and tag filtering
- **Projects**: case studies with sidebar metadata and rich MDX content
- **Piano**: a small interactive piano
- **Log**: one feed for everything you finish — films, series, books, albums, podcasts, games — with ratings, favourites and notes, plus an admin behind WorkOS AuthKit to manage it
- **Contact**: email form powered by Resend and React Email, with a honeypot
- **Command palette**: ⌘K navigation across the whole site
- **Editor chrome**: titlebar, sidebar, and status bar shared across every page
- **Themes**: dark by default, light toggle, 6 brand color presets, no flash
- **SEO**: dynamic OG images, sitemap, robots.txt, canonical URLs

Spotify, wristkit and the log are all optional. Without their environment variables the site still builds and runs: the widgets show an empty or error state, `/log` renders empty, and `/admin` is unreachable.

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

# Optional: Postgres, shared by the wristkit card and /log
# On Supabase use the transaction pooler string (port 6543), not the direct one
DATABASE_URL=postgresql://user:pass@host:6543/postgres

# Optional: wristkit ingest endpoint
WRISTKIT_API_KEY=replace-with-32-random-bytes

# Optional: WorkOS AuthKit, guards /admin
WORKOS_API_KEY=sk_test_xxx
WORKOS_CLIENT_ID=client_xxx
WORKOS_COOKIE_PASSWORD=            # 32+ chars: openssl rand -base64 32
NEXT_PUBLIC_WORKOS_REDIRECT_URI=https://yourdomain.com/api/auth/callback

# Optional: comma-separated emails allowed into /admin
ADMIN_EMAILS=you@example.com

# Optional: GitHub GraphQL, for the contributions grid on / and /about
# Classic PAT, `read:user` scope
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

Leave out whatever you don't need. Only `RESEND_API_KEY` and `NEXT_PUBLIC_BASE_URL` are required.

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

The Apple Watch activity card reads from your own Postgres database. See [wristkit](https://wristkit-web.vercel.app/) for the full setup: the SQL migration, the iOS Shortcut, and the sync endpoint at `/api/v1/wristkit/sync`.

---

## Configuring the log (optional)

`/log` is a single feed for everything you finish, with an admin at `/admin/log` to manage it. It shares the same Postgres database as wristkit.

1. Set `DATABASE_URL` and run `[docs/sql/001-log-entries.sql](docs/sql/001-log-entries.sql)` against it.
2. Optionally seed it with sample entries: `npm run seed:log`.
3. For the admin, create an application at [workos.com](https://workos.com), register `<your-domain>/api/auth/callback` as a redirect URI, and fill in the four `WORKOS_*` variables.
4. Put your own email in `ADMIN_EMAILS`.

**That last step is not optional if you want the admin.** AuthKit decides who is signed in, not who is allowed — without an allowlist, anyone who creates an account in your WorkOS organisation reaches your admin. `lib/auth/require-admin.ts` is what actually guards it.

Without `DATABASE_URL` the page renders empty and the build still passes. Without the WorkOS variables `/admin` is simply unreachable.

The design decisions behind all of it, phase by phase, are in [docs/log-plan.md](docs/log-plan.md).

---

## Configuring the roadmap (optional)

`/roadmap` is a board of what the site is going to become — to do, in progress, shipped — with an admin at `/admin/roadmap`. It rides on the same database and the same allowlist as the log, so if you already did the steps above there are only two left:

1. Run `[docs/sql/003-roadmap-items.sql](docs/sql/003-roadmap-items.sql)` against `DATABASE_URL`.
2. Optionally seed it: `npm run seed:roadmap`.

Items start with status `raw`, which never renders publicly — that is the holding pen for an idea you don't want to lose but haven't decided anything about. Promote one to `todo` when it becomes real.

Without `DATABASE_URL` the board renders empty and the build still passes.

The reasoning, phase by phase, is in [docs/roadmap-component-plan.md](docs/roadmap-component-plan.md).

---

## Testing

```bash
npm run test:all
```

That is the whole thing: it starts a throwaway Postgres, builds content, then runs all three
layers — 123 unit, 38 integration, 9 end-to-end — and stops the database afterwards. Docker
(or OrbStack) needs to be running; nothing else has to be set up, and no environment variable
has to be exported.

```bash
npm run test:all -- --keep     # leave the database up, so the next run is faster
npm run test:all -- --no-e2e   # skip the browser layer and its production build
```

The layers can still be run one at a time. Only the first needs no infrastructure:

```bash
npm test                  # unit — pure functions and the API surface
npm run test:watch        # the same, in watch mode
npm run test:integration  # + a real Postgres
npm run test:e2e          # + Playwright, builds and starts the app itself
```

Run on their own, the last two expect the database and the e2e secret to already be in the
environment — `npm run test:all` exists precisely because wiring that up by hand every time
was five steps of ceremony:

```bash
docker compose -f docker-compose.test.yml up -d
export DATABASE_URL=postgresql://postgres:postgres@localhost:5433/postgres
export TEST_WORKOS_COOKIE_PASSWORD=$(openssl rand -base64 32)
```

**Both suites are destructive.** The integration setup `TRUNCATE`s `log_entries`,
`roadmap_items` and `wristkit_samples` between every test, and the e2e suite writes and
deletes real rows. Both refuse to run unless `DATABASE_URL` points at localhost, so
pointing them at Supabase fails loudly instead of erasing it — override with
`ALLOW_NONLOCAL_TEST_DB=true` only for a database you are willing to lose.

`TEST_WORKOS_COOKIE_PASSWORD` is any 32+ character string. It seals throwaway admin sessions,
signed against a local stand-in for WorkOS's JWKS rather than the real WorkOS, and is
unrelated to the production `WORKOS_COOKIE_PASSWORD`. In CI it comes from a repo secret of
the same name, which the workflow checks for before doing any work.

The e2e layer also needs a browser once: `npx playwright install --with-deps chromium`.

The full reasoning — why a mocked DB was ruled out, why the e2e auth setup runs a local
JWKS server instead of stubbing WorkOS, what each test is actually guarding against — is in
[docs/tests-plan.md](docs/tests-plan.md).

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
  log/                     # Public log feed
  admin/                   # Log CRUD, behind AuthKit
  components/entrepta/     # entrepta design system components
  api/
    contact/route.ts       # Email via Resend
    og/route.tsx           # Dynamic OG images
    now-playing/route.ts   # Spotify Now Playing
    auth/callback/route.ts # WorkOS AuthKit callback
    v1/[[...route]]/       # Hono app: wristkit ingest + admin CRUD
  layout.tsx               # Root layout (editor chrome)

proxy.ts                   # AuthKit proxy, scoped to /admin

content/
  blog/*.mdx               # Blog posts
  projects/*.mdx           # Project case studies

components/
  chrome/                  # Titlebar, sidebar, command palette
  home/                    # Bento grid cards (stack, mini piano, GitHub, log)
  log/                     # Log feed card, star rating
  admin/                   # Log entry form, table, dialogs
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
  api/                     # Hono app, routes, middleware
  auth/                    # Admin email allowlist
  db/client.ts             # Shared Postgres client
  log/                     # Schema, validation, queries, mutations
  velite.ts                # Content query helpers
  site-config.ts           # Name, email, socials
  experience.ts            # Career start date, years of experience
  spotify.ts               # Spotify token + playlist fetch
  wristkit/                # wristkit schema + queries
  utils.ts                 # cn(), formatDate(), estimateReadingTime()
  metadata.ts              # createMetadata() helper

docs/
  log-plan.md              # /log design decisions, phase by phase
  sql/                     # Hand-run migrations
```

---

## License

MIT. Fork freely, customize, make it yours.
