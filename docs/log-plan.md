# /log — implementation plan

A single feed of everything I finish: films, series, books, albums, podcasts, games. Each
entry has a rating, a favorite flag, and an optional short note. An admin area behind
WorkOS AuthKit lets me add and edit entries without a deploy.

Design source: [`log-design.html`](./log-design.html). That file is a bundle, so you can't
read it directly. To get the real markup:

```bash
python3 -c "
import json
src = open('docs/log-design.html').read().split(chr(10))
open('/tmp/log-template.html','w').write(json.loads(src[392]))
"
```

Line 393 holds the page template as a JSON string. Line 381 holds the assets (fonts,
React) as gzipped base64, and you don't need those. The template has two layout options,
`1a` and `1b`. **We are building `1b`.** Ignore everything under the `1a` comment.

> `log-design.html` weighs 4.1MB, almost all of it embedded fonts and a copy of React.
> It gets deleted once `/log` is built and the layout is settled. Everything worth keeping
> from it should live in this plan or in the code by then, so read it early rather than
> counting on it being there later. Deleting it is a Phase 6 checklist item.

---

## What we decided

| Topic   | Choice                                                                  |
| ------- | ----------------------------------------------------------------------- |
| Storage | Same Supabase Postgres as wristkit, new table `log_entries`             |
| Auth    | WorkOS AuthKit + an email allowlist on top                              |
| API     | Hono, mounted at `/api/v1`, and wristkit moves there too                |
| Admin   | `/admin/log` with full CRUD, react-hook-form + zod, entrepta components |
| Posters | External URL stored on the entry                                        |
| Detail  | Inline expand on the card. No `/log/[slug]` route.                      |
| Layout  | `1b` catalog cards                                                      |

### Why Hono everywhere and not just in the admin

Two routing styles in one repo is worse than either style alone. If Hono goes in, wristkit
goes with it. The good news is that wristkit is a single POST handler, so the move is
small, and the parts worth keeping (the API key check, the rate limiter) become middleware
that the admin routes get for free.

An iPhone Shortcut posts to `/api/wristkit-sync` today. The old path stays as a thin
forwarder into the Hono app so nothing breaks between deploy and the moment I update the
Shortcut on my phone. Once the new URL is live and the Shortcut points at it, the forwarder
gets deleted. That cleanup is the last item in Phase 6.

Verified before writing this: `hono@4.13.0` ships a `./vercel` export, and
`@workos-inc/authkit-nextjs@4.3.1` lists `next: ^16` in its peer deps. Both work here.

---

## Phase 0 — foundation

### New dependencies

```bash
npm install hono @hono/zod-validator @workos-inc/authkit-nextjs react-hook-form @hookform/resolvers
```

`zod@4`, `drizzle-orm`, and `postgres` are already installed.

`@hono/zod-validator@0.9.0` declares `zod: ^3.25.0 || ^4.0.0` in its peer deps, so it works
with the zod 4 already installed here. Checked, not assumed.

### Environment variables

Add to `.env.example` and to Vercel:

```bash
# Shared Postgres (Supabase). Use the POOLER string, port 6543.
DATABASE_URL=

# WorkOS AuthKit (admin only)
WORKOS_API_KEY=sk_test_xxx
WORKOS_CLIENT_ID=client_xxx
WORKOS_COOKIE_PASSWORD=          # 32+ chars: openssl rand -base64 32
NEXT_PUBLIC_WORKOS_REDIRECT_URI=https://annamaria.app/api/auth/callback

# Comma-separated emails allowed into /admin
ADMIN_EMAILS=a2002aninha22@gmail.com
```

On Supabase, take the connection string on port 6543 (the transaction pooler), not 5432.
The pooler does not support prepared statements, which is exactly why `createDb` already
passes `prepare: false`. Keep that flag.

### Shared database client

`lib/wristkit/db.ts` already has the logic we want. It takes a URL, builds a `postgres`
client, and caches it by URL so serverless invocations reuse the pool. Only the imported
schema is wristkit-specific. Move it:

```ts
// lib/db/client.ts
import { type PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js"
import postgres, { type Sql } from "postgres"
import * as logSchema from "@/lib/log/schema"
import * as wristkitSchema from "@/lib/wristkit/schema"

const schema = { ...wristkitSchema, ...logSchema }
export type AppDb = { db: PostgresJsDatabase<typeof schema>; sql: Sql }

let cached: { url: string; entry: AppDb } | null = null

export function createDb(url: string): AppDb {
  if (cached && cached.url === url) return cached.entry
  const sql = postgres(url, { prepare: false })
  const entry: AppDb = { db: drizzle(sql, { schema }), sql }
  cached = { url, entry }
  return entry
}

/**
 * Single place that resolves the connection string. Returns null rather than throwing so
 * callers can degrade to an empty state — a missing database should not take down a page.
 */
export function dbUrl(): string | null {
  return process.env.DATABASE_URL ?? process.env.WRISTKIT_DATABASE_URL ?? null
}
```

Then make `lib/wristkit/db.ts` a one-line re-export so nothing that imports it breaks:

```ts
export { createDb, dbUrl, type AppDb } from "@/lib/db/client"
```

`WRISTKIT_DATABASE_URL` stays as a fallback so the current deploy keeps working. Delete
the fallback once `DATABASE_URL` is set in Vercel.

### Checklist — Phase 0

- [x] Five packages installed, lockfile committed
- [x] `.env.example` lists every new variable with a comment
- [x] `lib/db/client.ts` exists and exports `createDb` and `dbUrl`
- [x] `lib/wristkit/db.ts` re-exports from the new file, nothing else
- [x] `npm run build` passes
- [x] The wristkit card on the homepage still shows real data locally
- [x] `npm run lint` clean

---

## Phase 1 — data layer

### The table

One table. Header stats are a `GROUP BY type`, so there is nothing to materialize at this
size.

```sql
create table log_entries (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null,
  type          text not null,
  title         text not null,
  creator       text,
  year          integer,
  rating        numeric(2,1),
  favorite      boolean not null default false,
  note          text,
  poster_url    text,
  external_url  text,
  logged_at     date not null,
  published     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint log_type_valid check (
    type in ('film','series','book','music','podcast','game')
  ),
  constraint log_rating_valid check (
    rating is null or (rating >= 0.5 and rating <= 5 and (rating * 2) = floor(rating * 2))
  ),
  constraint log_year_valid check (year is null or (year >= 1800 and year <= 2200))
);

create unique index uq_log_slug       on log_entries (slug);
create index        idx_log_logged_at on log_entries (logged_at desc);
create index        idx_log_type_date on log_entries (type, logged_at desc);
```

Two choices that need explaining, because they break from what wristkit does.

**`logged_at` is a `date`, not a `timestamptz`.** The design only ever shows day, month,
year, and sorts by day. A timestamp would add a timezone bug where an entry logged at
9pm on July 28 renders as July 27 for some readers, and buys nothing back. Wristkit uses
`timestamptz` because the time of day is the whole point there. Here it isn't.

**`type` is `text` with a CHECK, not a real `pgEnum`.** This repo has no migrations, the
same way `wristkit_samples` has none. With a real enum, adding a new type later means a
manual `ALTER TYPE` against production. With text plus a CHECK, it is a one-line edit in
two places. Same safety, less ceremony.

Run the SQL above by hand in the Supabase editor and save it as
`docs/sql/001-log-entries.sql` so the schema is at least in version control.

### Files

```
lib/log/
  schema.ts       # drizzle table
  validation.ts   # zod schemas, shared client + server
  queries.ts      # read functions
  slug.ts         # slugify + collision handling
  stars.ts        # rating -> "★★★★½"
```

`lib/log/schema.ts`:

```ts
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

export const logEntries = pgTable(
  "log_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    type: text("type").notNull(),
    title: text("title").notNull(),
    creator: text("creator"),
    year: integer("year"),
    rating: numeric("rating"),
    favorite: boolean("favorite").notNull().default(false),
    note: text("note"),
    posterUrl: text("poster_url"),
    externalUrl: text("external_url"),
    loggedAt: date("logged_at").notNull(),
    published: boolean("published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: uniqueIndex("uq_log_slug").on(t.slug),
    loggedAtIdx: index("idx_log_logged_at").on(t.loggedAt),
    typeDateIdx: index("idx_log_type_date").on(t.type, t.loggedAt),
  }),
)
```

Drizzle returns `numeric` as a string and `date` as a `"YYYY-MM-DD"` string. Convert once,
in `queries.ts`, and never let a raw row reach a component.

`lib/log/validation.ts`:

```ts
import { z } from "zod"

export const LOG_TYPES = ["film", "series", "book", "music", "podcast", "game"] as const
export const LogTypeSchema = z.enum(LOG_TYPES)
export type LogType = z.infer<typeof LogTypeSchema>

/** Labels used in the UI. "podcast" shows as "pod" on cards, per the design. */
export const TYPE_LABEL: Record<LogType, string> = {
  film: "film",
  series: "series",
  book: "book",
  music: "album",
  podcast: "pod",
  game: "game",
}
export const TYPE_PLURAL: Record<LogType, string> = {
  film: "films",
  series: "series",
  book: "books",
  music: "music",
  podcast: "podcasts",
  game: "games",
}

/** Only hosts listed in next.config.ts remotePatterns. Keep the two in sync. */
const POSTER_HOSTS = ["image.tmdb.org", "covers.openlibrary.org", "i.scdn.co"]

const posterUrl = z
  .string()
  .trim()
  .url("that doesn't look like a URL")
  .refine((v) => POSTER_HOSTS.includes(new URL(v).hostname), {
    message: `poster host must be one of: ${POSTER_HOSTS.join(", ")}`,
  })

export const logEntryInputSchema = z.object({
  type: LogTypeSchema,
  title: z.string().trim().min(1, "title is required").max(200),
  creator: z.string().trim().max(150).optional().or(z.literal("")),
  year: z.coerce.number().int().min(1800).max(2200).optional().nullable(),
  rating: z.coerce
    .number()
    .min(0.5)
    .max(5)
    .refine((v) => (v * 2) % 1 === 0, "half stars only")
    .optional()
    .nullable(),
  favorite: z.boolean().default(false),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
  posterUrl: posterUrl.optional().or(z.literal("")),
  externalUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  loggedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use YYYY-MM-DD"),
  published: z.boolean().default(true),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/)
    .max(120)
    .optional(),
})
export type LogEntryInput = z.infer<typeof logEntryInputSchema>
```

Validating the poster host in zod matters more than it looks. `next/image` throws at
runtime for an unlisted host, so without this check a bad paste in the admin becomes a
broken production page. Here it fails in the form, where I can fix it.

`lib/log/stars.ts` — one helper, used by both the admin preview and the public card. The
design's own logic:

```ts
export function starString(rating: number | null): string {
  if (rating == null) return ""
  return "★".repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? "½" : "")
}

/** Screen readers get a number, not a pile of star glyphs. */
export function starLabel(rating: number | null): string {
  return rating == null ? "not rated" : `${rating} out of 5`
}
```

`lib/log/queries.ts` exports:

- `getPublishedEntries()` — published only, `order by logged_at desc, created_at desc`
- `getTypeCounts()` — `select type, count(*) group by type where published`
- `getAllEntries()` — admin list, drafts included
- `getEntryById(id)` — admin edit form

Every one of them maps `rating` to a number and returns a clean `LogEntry` type.

### Seed

Write `scripts/seed-log.ts` that inserts the 14 entries from the design file (Perfect Days,
The Pragmatic Programmer, Severance S2, In Rainbows, Outer Wilds, Dune Part Two, and so
on). Grab them from the `entries` array in the template. Real data makes the UI phase much
faster, and it gives you every type at least twice so the filters have something to do.

### Checklist — Phase 1

- [ ] SQL run against Supabase, saved to `docs/sql/001-log-entries.sql`
- [ ] All three indexes and all three CHECK constraints exist (`\d log_entries`)
- [ ] Inserting `rating = 4.3` fails, `rating = 4.5` succeeds
- [ ] Inserting `type = 'movie'` fails
- [ ] Two rows with the same slug fail
- [ ] Seed script ran, 14 rows present, every type represented
- [ ] `getPublishedEntries()` returns `rating` as a number, `loggedAt` as `YYYY-MM-DD`
- [ ] Drafts (`published = false`) never appear in `getPublishedEntries()`
- [ ] `npm run lint` clean, no `any` in the new files

---

## Phase 2 — Hono API layer

This phase migrates wristkit and sets up the shape the admin will plug into. It does not
depend on Phase 1, so it can run in parallel.

### Structure

```
lib/api/
  app.ts                # Hono instance, basePath, error handler
  middleware/
    rate-limit.ts       # moved from the wristkit route
    api-key.ts          # moved from the wristkit route
    require-admin.ts    # Phase 3 uses this
  routes/
    wristkit.ts
    log.ts              # admin CRUD, added in Phase 3

app/api/v1/[[...route]]/route.ts   # the only mount point
app/api/wristkit-sync/route.ts     # legacy forwarder, keeps the Shortcut alive
```

`lib/api/app.ts`:

```ts
import { Hono } from "hono"
import { wristkit } from "./routes/wristkit"

export const app = new Hono().basePath("/api/v1")

app.route("/wristkit", wristkit)

app.onError((err, c) => {
  console.error("[api]", err)
  return c.json({ error: "internal_error" }, 500)
})
app.notFound((c) => c.json({ error: "not_found" }, 404))
```

`app/api/v1/[[...route]]/route.ts`:

```ts
import { handle } from "hono/vercel"
import { app } from "@/lib/api/app"

// timingSafeEqual and the postgres driver both need Node, not Edge.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)
```

Mounting at `/api/v1` instead of `/api` avoids any argument with the existing
`/api/contact`, `/api/og`, and `/api/now-playing` routes. Those stay where they are. They
are not part of this migration and moving them adds risk for no benefit.

### The legacy forwarder

```ts
// app/api/wristkit-sync/route.ts
import { app } from "@/lib/api/app"

export const runtime = "nodejs"

/** Old path, kept because an iPhone Shortcut posts here. Rewrites into the Hono app. */
export async function POST(req: Request) {
  const url = new URL(req.url)
  url.pathname = "/api/v1/wristkit/sync"
  return app.fetch(new Request(url, req))
}
```

The body, headers, and API key all pass through untouched, so the Shortcut sees the same
responses it sees today.

### Middleware

`rate-limit.ts` and `api-key.ts` are lifts of the code already in the wristkit route. Keep
the `timingSafeEqual` comparison and the length pre-check. Keep the in-memory bucket, and
keep the honest comment that it resets on cold start. It is fine for one phone posting a
few times a day, and swapping it for Upstash later is a contained change.

```ts
// lib/api/middleware/api-key.ts
import { timingSafeEqual } from "node:crypto"
import { createMiddleware } from "hono/factory"

export const apiKeyAuth = (envVar: string) =>
  createMiddleware(async (c, next) => {
    const provided = c.req.header("x-api-key")
    const expected = process.env[envVar]
    if (!provided || !expected) return c.json({ error: "unauthorized" }, 401)
    const a = Buffer.from(provided)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return c.json({ error: "unauthorized" }, 401)
    }
    await next()
  })
```

`routes/wristkit.ts` keeps the same request checks in the same order the old handler used:
rate limit, content type, body size, API key, then parse. Do not reorder them. The order is
what stops an unauthenticated caller from making you parse a large body.

### Spike: does `withAuth()` work inside a Hono handler? — answered, yes

The worry was whether `next/headers` still resolves once a request has been handed from the
Next route handler to `app.fetch()`. `withAuth()` reads the session cookie through
`cookies()`, which depends on async local storage that Next sets up per request.

It works. `/api/v1/whoami` returned `{ ok: true, email: null }` signed out and the real
email signed in, with no exception either way. Hono runs in the same call stack, so the
storage is there. **The `c.env.user` fallback is not needed and has been dropped from this
plan.** `requireAdminApi` can call `withAuth()` directly.

`lib/api/routes/whoami.ts` is the throwaway that proved it. Delete it, and its entry in the
`proxy.ts` matcher, before the phase closes. A route that prints your email is not
something to leave lying around.

### Two Next 16 renames worth knowing

Both were found while wiring this up, and both bite silently.

**`middleware.ts` is now `proxy.ts`.** Next 16 deprecated the old filename. AuthKit
deprecated `authkitMiddleware` in the same direction, in favour of `authkitProxy`. Same
signature, so it is a rename and nothing more, but the old names each emit a warning.

**`middlewareAuth` has to be enabled.** Without it, `withAuth({ ensureSignedIn: true })`
inside a server component tries to write the session cookie during render, and Next kills
the request:

```
Error: Cookies can only be modified in a Server Action or Route Handler
```

That is a 500 on `/admin`, not a redirect to sign-in. The proxy has to do the bouncing:

```ts
// proxy.ts — repo root
import { authkitProxy } from "@workos-inc/authkit-nextjs"

export default authkitProxy({
  middlewareAuth: { enabled: true, unauthenticatedPaths: [] },
})

export const config = {
  matcher: ["/admin/:path*", "/api/v1/admin/:path*", "/api/v1/whoami", "/api/auth/:path*"],
}
```

Keep that matcher narrow. The public site is static and cached at the edge, and running the
proxy across all of it would throw that away for nothing.

### Checklist — Phase 2

- [x] Ingest inserts three rows — verified by firing the real Shortcut. Do not test this
      with curl and the real key: it writes into live health data, and the card would show
      a fake reading for the rest of the day.
- [x] `POST /api/wristkit-sync` (old path) does the same thing — that is the path the
      Shortcut hit, so the forwarder and the insert were validated together
- [x] Wrong key returns 401, missing key returns 401 — on both paths
- [x] `content-type: text/plain` returns 415
- [x] 31 requests in five minutes returns 429 with a `retry-after` header
- [x] Bad payload returns 400 with zod issues in the body
- [x] `GET` on a POST-only route returns JSON 404
- [x] Unknown path under `/api/v1` returns JSON 404, not an HTML error page
- [x] The homepage wristkit card still renders through the shared client
- [x] The iPhone Shortcut still works against the old URL, tested on the phone
- [x] `/api/contact`, `/api/og` and `/api/now-playing` are untouched and still work
- [x] Spike: `withAuth()` inside a Hono handler resolves without throwing (signed out
      returns `email: null`, which is the part that proves async storage survives
      `app.fetch()`)
- [x] Spike, signed in: `/api/v1/whoami` returned the real email
- [x] `/admin` signed out redirects to WorkOS instead of 500ing
- [x] `/admin` signed in with an allowlisted email renders
- [x] `whoami.ts` deleted and removed from the `proxy.ts` matcher

---

## Phase 3 — auth and admin

### Part A: AuthKit — done in Phase 2

The spike needed a real session, so this all landed early and works end to end:

- WorkOS app created, Google OAuth on demo credentials, both redirect URIs registered
  (`http://localhost:3000/api/auth/callback` and
  `https://annamaria.app/api/auth/callback`)
- `app/api/auth/callback/route.ts` → `handleAuth({ returnPathname: "/admin" })`
- `proxy.ts` with `middlewareAuth` enabled, matcher scoped to the admin paths
- `lib/auth/require-admin.ts` with the allowlist
- `app/admin/page.tsx` as a placeholder landing page, replaced by Part C

Two things still owed here. Google is on **demo credentials**, which are staging-only and
show WorkOS branding on the consent screen — swap them for a real Google Cloud OAuth client
before production. And the Production environment in WorkOS has its own keys, so the Vercel
env vars are a separate set from `.env.local`.

The allowlist, since it is the part that actually matters. AuthKit signs people in. It does
not decide who is allowed. Without it, anyone who creates an account in the WorkOS org lands
in the admin.

```ts
// lib/auth/require-admin.ts
import { notFound } from "next/navigation"
import { withAuth } from "@workos-inc/authkit-nextjs"

export async function requireAdmin() {
  const { user } = await withAuth({ ensureSignedIn: true })
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  if (!user?.email || !allowed.includes(user.email.toLowerCase())) notFound()
  return user
}
```

`notFound()` and not a 403, because a 403 confirms that `/admin` exists. Call this in the
admin layout **and** in every mutating API route. Middleware alone is not the gate. If the
matcher is ever edited wrong, the route-level check is what saves you.

The Hono version, for `/api/v1/admin/*`:

```ts
// lib/api/middleware/require-admin.ts
import { createMiddleware } from "hono/factory"
import { withAuth } from "@workos-inc/authkit-nextjs"

import { isAdminEmail } from "@/lib/auth/require-admin"

export const requireAdminApi = createMiddleware(async (c, next) => {
  const { user } = await withAuth()
  if (!isAdminEmail(user?.email)) return c.json({ error: "not_found" }, 404)
  await next()
})
```

Reuse `isAdminEmail` from `lib/auth/require-admin.ts` rather than re-parsing `ADMIN_EMAILS`
here. Two copies of an allowlist is two places to get it wrong.

Calling `withAuth()` straight from the Hono middleware is safe — the Phase 2 spike proved
it resolves correctly inside `app.fetch()`.

### Part B: UI components

The admin has no design of its own, and it shouldn't get one. It reuses entrepta, and it
reuses the editor chrome. Someone landing on `/admin/log` should see the same product as
someone landing on `/blog`.

entrepta ships 16 components. This project has copied in 11 of them:
badge, button, card, code-block, command-palette, input, skeleton, status-bar,
theme-switcher, toast, top-nav.

Five are in the registry but not in this repo yet: **Dialog, Dropdown, Tooltip, Tabs,
ModeToggle**. Pull the ones the admin needs from the registry rather than writing them:

```bash
npx @entrepta/cli@latest add dialog dropdown tooltip
```

The CLI copies the source into the project and installs its peer deps. It does not add a
runtime dependency. Check what it wrote before committing, since the CLI also touches
`globals.css` and `lib/utils.ts`, and both already exist here in a customized form. If it
tries to overwrite either, take the component files and discard the rest.

| Need                | Where it comes from          |
| ------------------- | ---------------------------- |
| Delete confirmation | `dialog` from the registry   |
| Row actions menu    | `dropdown` from the registry |
| Truncated titles    | `tooltip` from the registry  |
| Text fields         | `input`, already here        |
| Submit and cancel   | `button`, already here       |
| Type badge          | `badge`, already here        |
| Save feedback       | `toast`, already here        |
| Loading rows        | `skeleton`, already here     |

Three form controls are not in the registry at all: **select, textarea, and switch**. Write
those into `app/components/entrepta/` as owned code, matching what the registry does
elsewhere:

- `cva` for variants, `cn()` to merge classes, `React.forwardRef`, props extend the native
  element's props.
- Radix primitives for behavior and a11y where a native element isn't enough. `switch`
  should wrap a real `<input type="checkbox">` rather than reinventing it. `select` can
  stay a styled native `<select>`, which gets you the mobile picker for free.
- `lucide-react` for icons at 1.5px stroke, which is what entrepta uses. The chrome in this
  repo uses Phosphor, but that is chrome-specific. New entrepta components follow entrepta.
  `lucide-react` is already in `package.json`.
- Colors come from tokens only: `var(--bg-surface)`, `var(--border-subtle)`,
  `var(--fg-primary)`, `var(--fg-muted)`. Brand accents use `var(--fg-brand)` or
  `color-mix(in srgb, var(--fg-brand) N%, transparent)`. Never a hex.
- Mono is the default font. `font-sans` only inside long prose.
- Focus ring uses `--border-brand-strong`, matching `input.tsx`.
- A disabled state and an error state, since the form needs both.

If any of the three turns out well, it is worth pushing back up to the entrepta registry.
That is the whole point of owning the code.

`--bg-surface-brand` already exists per theme in `globals.css`, so the active filter pill
and the type badge can use it directly. No new token needed.

Reuse from the contact form (`components/contact/`): the `FieldLabel` with the `◆` glyph
and the `FieldError` with the `//` prefix. Lift both into `components/ui/form-field.tsx`
and import them in both places rather than copying.

### Part C: the admin screens

```
app/admin/
  layout.tsx        # requireAdmin(), editor chrome, sign-out button
  page.tsx          # redirect to /admin/log
  log/
    page.tsx        # table of all entries, drafts included
    new/page.tsx
    [id]/page.tsx
components/admin/
  log-entry-form.tsx
  log-entry-table.tsx
  poster-preview.tsx
  rating-input.tsx
  delete-entry-dialog.tsx
```

The admin gets the same editor chrome as the rest of the site, with the tab reading
`admin/log.tsx` and the status bar showing the signed-in email. It should feel like the
same product, not a bolted-on CMS.

The form uses react-hook-form with `zodResolver(logEntryInputSchema)` and submits with
`fetch` to the Hono routes:

| Method   | Path                    | Does   |
| -------- | ----------------------- | ------ |
| `POST`   | `/api/v1/admin/log`     | create |
| `PATCH`  | `/api/v1/admin/log/:id` | update |
| `DELETE` | `/api/v1/admin/log/:id` | delete |

Every one of them calls `revalidatePath("/log")` from `next/cache` after it writes, so the
public page updates without waiting for ISR. On success the client calls
`router.refresh()` and navigates back to the list. Errors surface with the existing
`toast` from entrepta.

Three fields need more than a text box.

The rating is five star buttons. Clicking the left half of a star sets the half value, the
right half sets the whole. It also has to work from the keyboard, so wire arrow keys to
step by 0.5 and give the group `role="radiogroup"` with an accessible name.

The poster URL renders a preview next to the field on blur, at the real 2:3 aspect ratio.
A broken URL is the most likely mistake with this approach, and seeing it immediately
beats finding out on the live page.

The slug generates from title and year (`perfect-days-2023`) as you type, with a manual
override. On a unique-constraint violation, append `-2`, `-3`, and so on rather than
throwing the form state away.

Delete goes through the dialog, never `window.confirm`.

### Accessibility

- Every input has a real `<label htmlFor>`. Placeholders are not labels.
- Errors use `aria-invalid` on the field plus `aria-describedby` pointing at the message,
  and the message container is `role="alert"`.
- The delete dialog traps focus, closes on Escape, and returns focus to the button that
  opened it. Radix handles this if you use `Dialog.Content` properly.
- The entry table is a real `<table>` with `<th scope="col">`, not a grid of divs.
- Every icon-only button gets an `aria-label`.
- Test the whole create flow with the keyboard only, no mouse.

### SEO

- `app/admin/layout.tsx` exports `metadata = { robots: { index: false, follow: false } }`.
- Add `/admin*` to `exclude` in `next-sitemap.config.js`, next to the existing `/api/*`.
- Add a `Disallow: /admin` policy in `robotsTxtOptions`.

### Checklist — Phase 3

- [ ] Signed out, `/admin` redirects to the WorkOS sign-in page
- [ ] Signed in with an email **not** in `ADMIN_EMAILS`, `/admin` returns 404
- [ ] Signed in with an allowed email, `/admin/log` lists every entry including drafts
- [ ] `POST /api/v1/admin/log` from an unauthenticated curl returns 404, not 401 and not 200
- [ ] Editing `proxy.ts` to remove the `/admin` matcher still leaves the API protected
- [ ] Create, edit, and delete all work end to end
- [ ] After a create, `/log` shows the new entry without a redeploy
- [ ] Saving a poster URL from an unlisted host fails in the form with a readable message
- [ ] Rating input reaches every value from 0.5 to 5 using only the keyboard
- [ ] Slug collision appends a suffix instead of erroring
- [ ] Delete dialog: Escape closes it, focus returns to the trigger
- [ ] `dialog`, `dropdown`, and `tooltip` pulled from the entrepta registry, and the CLI
      did not overwrite `globals.css` or `lib/utils.ts`
- [ ] `select`, `textarea`, and `switch` written by hand, matching registry conventions
      (cva, `cn()`, forwardRef, lucide-react icons at 1.5px stroke)
- [ ] The six new entrepta components contain zero hardcoded hex colors
- [ ] Admin renders correctly in all six themes and in light mode
- [ ] `view-source` on `/admin` shows `noindex`
- [ ] `npm run build && npm run postbuild`, then confirm `/admin` is absent from `sitemap.xml`
      and present in `robots.txt` as disallowed

---

## Phase 4 — the public page

Depends on Phase 1 only. You can build it against the seed data before the admin exists.

```
app/log/page.tsx
components/log/
  log-feed.tsx       # client: filter state + list
  log-card.tsx       # the 1b card
  log-stats.tsx      # the stat boxes in the header
  log-filters.tsx    # filter pills with counts
```

### Data flow

`app/log/page.tsx` is a server component. It calls `getPublishedEntries()` and
`getTypeCounts()` directly. No fetch to our own API, which would only add a network hop
and a serialization round trip.

```ts
export const revalidate = 300
```

The page stays static and cheap. The admin's `revalidatePath("/log")` handles freshness
when I actually publish something.

Filtering happens on the client. The dataset is small, a few hundred rows at worst, so
`log-feed.tsx` receives everything and filters in memory, the same way the design mock
does. Mirror the active filter into the URL (`/log?type=film`) with
`router.replace(url, { scroll: false })` so a filtered view can be linked. Read the initial
value from `searchParams` so a direct hit on `/log?type=book` renders correctly on the
server.

### Building the card

Pull the exact markup from the `1b` block of the template, then translate:

| In the mock                          | In the code                                                      |
| ------------------------------------ | ---------------------------------------------------------------- |
| `#7c6bff`                            | `var(--fg-brand)`                                                |
| `rgba(124,107,255,0.15)`             | `var(--bg-surface-brand)`                                        |
| `#18181b`                            | `var(--bg-surface)`                                              |
| `#27272a`                            | `var(--border-subtle)`                                           |
| `#8a8a92`                            | `var(--fg-muted)`                                                |
| `var(--mono)` / `--serif` / `--sans` | the Tailwind `font-mono` / `font-serif` / `font-sans` classes    |
| inline `style` attributes            | Tailwind classes, `style` only for tokens Tailwind can't express |

The chrome in the mock (titlebar, sidebar, status bar) already exists in the app. Do not
rebuild it. Only the `<main>` content of the `1b` block is new.

### Posters

Add the three hosts to `next.config.ts`, alongside the `github.com` entry that is already
there:

```ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "github.com", pathname: "/**" },
    { protocol: "https", hostname: "image.tmdb.org", pathname: "/**" },
    { protocol: "https", hostname: "covers.openlibrary.org", pathname: "/**" },
    { protocol: "https", hostname: "i.scdn.co", pathname: "/**" },
  ],
}
```

Keep this list and `POSTER_HOSTS` in `lib/log/validation.ts` identical. Put a comment in
both files pointing at the other one.

When `posterUrl` is null or the image fails, fall back to the type label centered on
`--bg-surface`, which is what the design already shows as its placeholder. The `1b` card
was chosen partly because it reads fine without a poster, so this is a real state and not
an edge case.

### Inline expand

A card with a `note` gets a button below the stars reading `// note` with a chevron.
Clicking it opens the note with a height animation from Motion.

- The trigger is a real `<button>` with `aria-expanded` and `aria-controls` pointing at the
  panel id.
- A card without a note renders no button and has no hover affordance. Nothing should look
  clickable unless it is.
- Wrap the animation in `useReducedMotion()` from Motion and skip it when the user asked
  for less motion.

### Accessibility

- The filter pills are a `role="group"` with an `aria-label`, and each pill uses
  `aria-pressed` to say whether it is on.
- Ratings render the star string with `aria-hidden` and put `starLabel(rating)` in an
  adjacent `sr-only` span. A screen reader should hear "4.5 out of 5", not fifteen stars.
- The `♥` is decorative, so it is `aria-hidden` with an `sr-only` "favorite" next to it.
- Dates use `<time dateTime={loggedAt}>`.
- Poster `alt` is the title, or `alt=""` if a title already sits right next to it. Don't
  make a screen reader read the same string twice.
- Check the brand-colored stars against `--bg-surface` in light mode with a contrast
  checker. Some of the six themes will be tight at 3:1 for non-text.

### Performance

- Only the first row of posters gets `priority`. Everything else stays lazy, which is the
  `next/image` default.
- Set explicit `width` and `height` (or `fill` inside an `aspect-[2/3]` box) so nothing
  shifts while images load. The card layout should not move at all between empty and
  loaded.
- `log-feed.tsx` is the only client component in this tree. `log-card.tsx` stays a server
  component if it can, and if it can't, keep it small.
- Memoize the filtered list with `useMemo` keyed on the active type.
- Don't ship all six type icons if only three types are present.

### SEO

- `createMetadata()` from `lib/metadata.ts` with a title, a description, and an OG image.
- Add an OG route or a static image following the design's own thumbnail: "Log" in
  Newsreader with `★★★★½ ♥` under it in brand.
- Add `/log` to the sitemap. It picks up automatically since it is a static route.
- Consider `Schema.org` `ItemList` JSON-LD. Low effort, and it describes the page honestly.

### Responsive

The `1b` grid is `repeat(auto-fill, minmax(320px, 1fr))`. Below roughly 640px that becomes
one column on its own. Two things still need attention: the 64px serif heading should step
down to about 40px on small screens, and the filter pills should scroll horizontally
instead of wrapping into four rows.

Chrome will not resize below about 550px, so check 375px with the device toolbar.

### Checklist — Phase 4

- [ ] `/log` renders all seeded entries, newest first
- [ ] Every filter pill shows the right count and filters correctly
- [ ] `/log?type=book` renders filtered on first load, server side
- [ ] Clicking a pill updates the URL without scrolling the page
- [ ] A filter with no matches shows `// nothing logged in this category yet.`
- [ ] An entry with no poster shows the type-label fallback, and the layout doesn't shift
- [ ] A broken poster URL falls back instead of showing a broken image icon
- [ ] Cards with a note expand; cards without one show no trigger
- [ ] `prefers-reduced-motion: reduce` skips the expand animation
- [ ] Full keyboard pass: tab to a pill, activate it, tab to a note, expand it
- [ ] VoiceOver reads "4.5 out of 5", not a star pile
- [ ] Lighthouse on `/log`: performance 95+, accessibility 100
- [ ] CLS is 0 with a cold image cache (throttle to Slow 3G to check)
- [ ] Looks right at 375px, 768px, and 1440px
- [ ] Looks right in all six themes, dark and light
- [ ] Zero hardcoded hex colors in `components/log/`
- [ ] OG image renders at `/api/og?...` and previews correctly in a link debugger

---

## Phase 5 — wiring it into the site

- **Titlebar**: add `{ href: "/log", name: "log.tsx", icon: SquaresFourIcon }` to
  `NAV_TABS` in `components/chrome/titlebar.tsx`. The design uses a 2x2 grid icon.
- **Sidebar**: same entry in `NAV_ITEMS` in `components/chrome/sidebar.tsx`. `/admin` does
  not go in either nav.
- **Command palette**: a "Log" entry, plus one per type ("Log: films") that deep-links to
  the filtered URL.
- **Homepage** (optional): a bento card showing the most recent entry, sitting next to the
  wristkit card. Reuses `log-card` at a smaller size.
- **Status bar**: page context reads `log` on `/log`.

With seven tabs the titlebar gets crowded. Check it at 1024px before calling this done.
If it overflows, the fix is horizontal scroll on the tab strip, not a smaller font.

### Checklist — Phase 5

- [ ] The `log.tsx` tab appears, highlights on `/log`, and its × returns home
- [ ] The sidebar icon shows the `◆` active marker on `/log`
- [ ] ⌘K, type "log", Enter navigates to `/log`
- [ ] Type-specific palette entries land on the filtered URL
- [ ] Titlebar does not overflow at 1024px or at 1280px
- [ ] `/admin` appears in no navigation anywhere
- [ ] `/log` is in `sitemap.xml` after `npm run build && npm run postbuild`

---

## Phase 6 — polish and what comes after

- Error boundary and a loading skeleton, following `components/wristkit/today-activity-card/states.tsx`.
- `npm run lint` and `prettier --check .` clean across everything new.
- Update `CLAUDE.md`: `/log` in the pages section, `log_entries` in the stack table, the
  new env vars, and a note that the API lives in Hono under `/api/v1`.
- Update `README.md` so a fork can turn the whole thing off. `/log` should degrade the same
  way wristkit does when `DATABASE_URL` is missing: empty state, no crash, build still
  passes.

### Retiring the wristkit forwarder

Do this last, after everything is live in production, and in this order. Getting it
backwards means the activity card goes stale until you notice.

1. Confirm `POST https://annamaria.app/api/v1/wristkit/sync` works in production with the
   real API key.
2. Open the Shortcut on the phone and change the URL to the `/api/v1` path.
3. Run the Shortcut once. Check that a fresh row landed in `wristkit_samples` and that the
   homepage card shows it.
4. Wait a day. If nothing else hits the old path, delete
   `app/api/wristkit-sync/route.ts`.

Ideas for later, none of them blocking:

- A grid/list toggle that brings back the `1a` layout. The markup is already in the design
  file.
- An ingest route with an API key, so I can log from a Shortcut the way wristkit does. The
  middleware for it already exists after Phase 2.
- A "look it up" button in the admin that queries TMDB and Open Library by title and fills
  in poster, creator, and year. This kills most of the manual typing without turning into a
  full sync integration.
- An RSS feed for `/log`.

### Checklist — Phase 6

- [ ] `/log` renders an empty state with `DATABASE_URL` unset, and `npm run build` still passes
- [ ] `CLAUDE.md` and `README.md` updated
- [ ] `npm run lint` clean
- [ ] Full pass on the deployed preview, phone and desktop
- [ ] `docs/log-design.html` deleted, and nothing in the codebase still references it
- [ ] `/api/v1/wristkit/sync` verified in production with the real key
- [ ] Shortcut URL updated on the phone and run once, new row confirmed in the database
- [ ] `app/api/wristkit-sync/route.ts` deleted after a day with no traffic on the old path

---

## Order

```
Phase 0
  ├─ Phase 1 (data) ──┬─ Phase 3 (auth + admin) ─┐
  └─ Phase 2 (Hono) ──┘                          ├─ Phase 5 ─ Phase 6
                       └─ Phase 4 (public page) ─┘
```

Phases 1 and 2 don't touch each other and can go in either order. Phase 4 needs only
Phase 1, so the public page can be finished before the admin exists.

## Risks

| Risk                                          | What we do about it                                                 |
| --------------------------------------------- | ------------------------------------------------------------------- |
| AuthKit authenticates but doesn't authorize   | Email allowlist checked in every route, not just middleware         |
| `@hono/zod-validator` may not support zod v4  | Drop the package and call `safeParse` by hand                       |
| A poster host outside `remotePatterns` throws | Host validated in zod at write time, plus a visual fallback at read |
| Supabase pooler rejects prepared statements   | Port 6543 connection string, `prepare: false` already set           |
| `/admin` gets indexed                         | `noindex` metadata, sitemap exclude, robots disallow                |
| entrepta CLI overwrites `globals.css`         | Review the diff before committing, keep only the component files    |
| Hand-written SQL drifts from `schema.ts`      | SQL committed under `docs/sql/`                                     |
