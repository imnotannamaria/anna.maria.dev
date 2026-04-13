# anna.maria.dev

Personal portfolio and open-source template for full-stack engineers. Built with Next.js 16, MDX, Resend, dark mode by default, and smooth animations.

**Live:** [anna-maria-dev.vercel.app](https://anna-maria-dev.vercel.app)

---

## What's inside

- **Blog** — MDX posts with syntax highlighting (Shiki), reading progress bar, tag filtering, and dynamic OG images
- **Projects** — Case studies with sidebar metadata, tag filtering, and rich MDX content
- **About** — Career timeline, education, full stack grid, GitHub contributions calendar
- **Uses** — Hardware, tools, and daily apps
- **Contact** — Email form powered by Resend + React Email
- **Dark mode** — Default dark, toggle to light, no flash
- **Animations** — BlurFade entrance animations via Motion
- **SEO** — Dynamic OG images, sitemap, robots.txt, canonical URLs

## Stack

| Layer            | Tech                    |
| ---------------- | ----------------------- |
| Framework        | Next.js 16 (App Router) |
| Language         | TypeScript (strict)     |
| Styling          | Tailwind CSS v4         |
| Content          | MDX via Velite          |
| Animations       | Motion v12              |
| Email            | Resend + React Email    |
| Syntax highlight | Shiki                   |
| Themes           | next-themes             |
| OG images        | @vercel/og              |
| SEO              | next-sitemap            |
| Icons            | Phosphor Icons          |
| Deploy           | Vercel                  |

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
# Required — get yours at resend.com
RESEND_API_KEY=re_xxxxxxxxxxxx

# Your public URL (used for sitemap and OG images)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

```

### 3. Update your personal info

Edit the following files with your own data:

| File                                   | What to change                       |
| -------------------------------------- | ------------------------------------ |
| `app/page.tsx`                         | Name, bio, stats, career entries     |
| `app/about/page.tsx`                   | Full bio, timeline, stack, interests |
| `app/uses/page.tsx`                    | Hardware, tools, apps                |
| `app/layout.tsx`                       | Site title and description           |
| `app/api/contact/route.ts`             | Email `from` and `to` addresses      |
| `components/about/github-calendar.tsx` | Your GitHub username                 |
| `lib/metadata.ts`                      | `baseUrl` fallback                   |

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

Set `featured: true` to show on the home page (max 2 shown).

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

---

## Deploy to Vercel

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add the environment variables from `.env.local` in the Vercel dashboard
4. Deploy — sitemap and robots.txt are generated automatically at build time

---

## Project structure

```
app/
  page.tsx              # Home
  about/page.tsx        # About
  blog/                 # Blog list + [slug]
  projects/             # Projects list + [slug]
  uses/page.tsx         # Uses
  contact/page.tsx      # Contact form
  api/
    contact/route.ts    # Email via Resend
    og/route.tsx        # Dynamic OG images
  icon.tsx              # Favicon
  layout.tsx            # Root layout

content/
  blog/*.mdx            # Blog posts
  projects/*.mdx        # Project case studies

components/
  layout/               # Navbar, Footer
  ui/                   # Button, Badge, BlurFade, etc.
  blog/                 # MDX renderer, reading progress
  projects/             # Project card
  about/                # GitHub calendar
  contact/              # Contact form

emails/
  contact-email.tsx     # React Email template

lib/
  velite.ts             # Content query helpers
  utils.ts              # cn(), formatDate(), estimateReadingTime()
  metadata.ts           # createMetadata() helper
```

---

## License

MIT — fork freely, customize, make it yours.
