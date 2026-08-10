# Roadmap — implementation plan

Two roadmap items collapsed into one piece of work: **Roadmap component** ("a card that reads this
file and shows the items as a checklist") and **Give the sidebar a job** ("tabs sticking out of the
edge — hover one and a panel slides out"). They turned out to be the same feature seen from two
angles: the roadmap needs somewhere to live, and the sidebar needs something to hold.

A prototype of both shipped to the working tree first (uncommitted, `PROTÓTIPO / DISCOVERY` at the
top of every file). This plan is what that prototype earned.

---

## What we decided

| Question        | Decision                                                              |
| --------------- | --------------------------------------------------------------------- |
| Source of truth | A `roadmap_items` table in Postgres, CRUD in `/admin`, routes in Hono |
| `ROADMAP.md`    | Retired. The admin replaces it, including for raw ideas               |
| Surfaces        | The sidebar tab → dialog, and the `/roadmap` board page. No home card |
| Public checkbox | Read-only. It shows state, it doesn't take a click                    |

Each of those has consequences the rest of this document is mostly about.

### The one concern, stated once

Retiring `ROADMAP.md` costs something real: today an idea is a line typed into an open editor, with
no server running and no network. Tomorrow it's a form. `CLAUDE.md` currently protects that file
precisely because capture has to be frictionless — "adding an item is me not wanting to lose a
thought."

The decision stands; this plan carries it. What it does about it is make capture cheap on the admin
side instead: a `raw` status that never renders publicly, and a quick-add that needs **only a
title**. Everything else — blurb, status, position, plan link — is editable later. If after a month
the raw column is empty while ideas are piling up in Notes, that's the signal the trade didn't pay,
and the fix is a `roadmap-import` script that reads a markdown file into the table rather than
resurrecting the old flow.

### Decisions I made without asking, and why

- **The dialog fetches on open, not on render.** The sidebar is in the root layout, so anything it
  reads happens on _every_ page. A query there would drag `/about`, `/blog` and every MDX page into
  `force-dynamic` for a panel most visitors never open. Instead: a public `GET /api/v1/roadmap`,
  called the first time the tab is clicked, held in module scope for the rest of the session.
- **`/roadmap` is `force-dynamic`.** Conventions: pages that read Postgres render per request, and
  no `revalidatePath` anywhere. A board that shows yesterday's columns is the same lie as a frozen
  activity ring.
- **Filter pills on the board.** Not decoration — see [The animation needs a public
  trigger](#the-animation-needs-a-public-trigger).
- **Items get a slug.** Same reasoning as `/log`: a stable anchor (`/roadmap#a-cursor-of-my-own`),
  not a route waiting to be built. There is no `/roadmap/[slug]` and there shouldn't be.
- **Ordering is a `position` integer**, not drag-and-drop. Drag is Phase 6 at the earliest.

---

## Phase 0 — the table

### Schema

`docs/sql/003-roadmap-items.sql`, following `001-log-entries.sql`:

```sql
create table if not exists roadmap_items (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null,
  title       text not null,
  blurb       text,
  status      text not null default 'raw',
  position    integer not null default 0,
  plan_url    text,
  shipped_at  date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint roadmap_status_check
    check (status in ('raw', 'todo', 'doing', 'done'))
);

create unique index if not exists uq_roadmap_slug on roadmap_items (slug);
create index if not exists idx_roadmap_status_position on roadmap_items (status, position);
```

Notes on the shape:

- **Four statuses, three public.** `raw` is the holding pen `ROADMAP.md` used to be, and the public
  queries filter it out. It is the default, so a quick-add is one field and lands somewhere safe.
- **`blurb` is nullable.** A raw idea is allowed to be a title and nothing else. The card handles a
  missing blurb; `/log` already proves an optional note doesn't break a card.
- **`plan_url` is a repo path** (`docs/tree-plan.md`), rendered as text in `CardFoot`, not as a
  link. If it ever becomes an `href`, it gets the same `https://`-only validation the log's
  `external_url` has.
- **`shipped_at`** exists so the Shipped column can be ordered by _when_, and so a future "shipped
  in 2026" line has something to count. Nullable, set when status becomes `done`.
- **The CHECK lives only in Postgres**, exactly as in the log — Drizzle can't express it, so zod is
  what stops bad values before they get there.

### Drizzle + validation

- `lib/roadmap/schema.ts` — mirrors the SQL, same style as `lib/log/schema.ts`.
- `lib/roadmap/validation.ts` — `roadmapItemInputSchema`. Status is `z.enum(["raw","todo","doing","done"])`.
  Follow the log's rules: **no `.default()` and no `z.coerce` in the form schema** (see
  `docs/log-plan.md`, the section on that — it was a real bug, not a preference).
- `lib/roadmap/slug.ts` — reuse the log's slug helper if it's generic enough; if it isn't, make it
  generic rather than copying it.

### Seed

`scripts/seed-roadmap.ts`, modelled on `scripts/seed-log.ts`. It carries **every item currently in
`ROADMAP.md`, verbatim**, plus the handful already shipped. This is the migration — the file is
deleted in Phase 5 and its contents must exist in the table before that happens.

Statuses at seed time:

| Status  | Items                                                                                                                                                 |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `doing` | Home components (tree), Roadmap component, Give the sidebar a job                                                                                     |
| `todo`  | Animations, cursor, state for every card, feed, contributions rewrite, contributions page, comments, tipfy, link tipfy from /log, easter egg, favicon |
| `done`  | /log, wristkit card, admin behind AuthKit                                                                                                             |

The prototype's `lib/roadmap-data.ts` has most of this text already; it is the seed's first draft
and gets deleted with it.

### Checklist — Phase 0

- [ ] SQL file written and run against Supabase
- [ ] `lib/roadmap/schema.ts`, `validation.ts`, `slug.ts`
- [ ] `scripts/seed-roadmap.ts` + `"seed:roadmap"` in `package.json`
- [ ] Seed run; every `ROADMAP.md` item exists in the table
- [ ] `npx tsc --noEmit` clean

---

## Phase 1 — reads

`lib/roadmap/queries.ts`:

```ts
getPublicItems() // status != 'raw', ordered status → position → created_at
getAllItems() // everything, for /admin
```

Grouping into columns happens in memory from the single `getPublicItems()` result. **No `GROUP BY`
beside a query that already returns the rows** — the counts, the percentage and the stepper are all
derivable from the array the page already has. This is the exact shape the code-review checklist
calls out, and the log already got it right with `countByType`.

`lib/roadmap/counts.ts` — `countByStatus(items)`, mirroring `lib/log/counts.ts`.

### The public API route

`lib/api/routes/roadmap.ts`, mounted at `/api/v1/roadmap`:

- `GET /` → `{ items }`, only public statuses.
- Behind the existing `rateLimit` middleware. It is the first _unauthenticated_ GET in the Hono app;
  everything else is either api-key'd or admin-only, so the middleware order matters and gets a test
  by hand: an unauthenticated request must never reach a body parse.
- No secrets, no stack traces — `onError` already returns JSON.

The dialog is the only consumer. The `/roadmap` page calls `getPublicItems()` directly (it's a
server component; going through HTTP to talk to itself would be silly).

### Checklist — Phase 1

- [ ] `queries.ts` + `counts.ts`
- [ ] `GET /api/v1/roadmap` mounted, rate-limited, returns only public statuses
- [ ] Verified: `raw` items never appear in the response

---

## Phase 2 — admin

### Routes

`lib/api/routes/admin-roadmap.ts`, mounted at `/api/v1/admin/roadmap`, copying the shape of
`admin-log.ts` exactly:

```
POST   /          create
PATCH  /:id       update (also the status change)
DELETE /:id       delete
```

`adminRoadmap.use("*", requireAdminApi)` on the first line. The `proxy.ts` matcher is not the gate.

`PATCH` sets `shipped_at` when status moves to `done`, and clears it when it moves away. That's a
mutation-layer rule in `lib/roadmap/mutations.ts`, not something the form has to remember.

No `revalidatePath`, per Conventions — every page that reads this table renders per request.

### Screens

`app/admin/roadmap/` mirroring `app/admin/log/`:

- `page.tsx` — the table of everything including `raw`, with `requireAdmin()` at the top of the
  route, not only in the layout.
- `new/page.tsx` — **quick-add: title is the only required field.** This is the piece that has to
  earn the retirement of `ROADMAP.md`. One input, one button, `raw` status, straight back to the
  list with the new row at the top. Everything else is edited afterwards.
- `[id]/page.tsx` — full edit: blurb, status, position, plan link.
- `loading.tsx` for both routes that read the DB.

The form carries the rule that used to live in `CLAUDE.md`, as helper text under the blurb field:
_write it down, don't evaluate it._ The rule survives the file it was written in.

### Checklist — Phase 2

- [ ] `requireAdminApi` on every route; `requireAdmin()` in every page
- [ ] A non-allowlisted email gets a 404, never a 403
- [ ] Quick-add works with title alone
- [ ] `shipped_at` set/cleared by the mutation, not the form
- [ ] Submitting state on the form; a network failure reads differently from a rejection

---

## Phase 3 — the components

The prototype is the design. Promoting it means three things: English comments (repo convention —
the prototype's are Portuguese), no hardcoded data, and the CSS moved out of the prototype block at
the bottom of `globals.css` into the card section where it belongs.

### What already exists and stays

| Piece                                                                                    | Notes                                                                                             |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `components/roadmap/roadmap-card.tsx`                                                    | `bento-card featured-card rm-item` + `CardHead`/`CardFoot`/`Badge`/`Spotlight`. Nothing invented. |
| `components/roadmap/roadmap-progress.tsx`                                                | The progress card: odometer, spring bar, stepper                                                  |
| `components/roadmap/roadmap-checkbox.tsx`                                                | Drawn check (`pathLength`), ring burst, indeterminate for `doing`                                 |
| `.rm-item`, `.rm-title`, `.rm-blurb`, `.rm-step*`, `.rm-tab`, `.rm-progress*`, `.rm-dot` | Move next to the other card CSS, drop the prototype banner                                        |

### The checkbox becomes two components

Public is read-only, so the public one is **not a button**:

```tsx
// public: state, not a control
<span className="rm-check" data-state={status} aria-hidden />
<span className="sr-only">{statusLabel}</span>
```

The interactive version — `role="checkbox"`, `aria-checked`, the burst, the hover ghost — moves into
`components/admin/` and is what the admin board clicks to change status. Keep the drawing; drop the
affordances that lie (`cursor: pointer`, the hover ghost check, `:active` scale) from the public one.
A control that doesn't control is worse than a glyph.

### The animation needs a public trigger

The best thing in the prototype is a card _flying_ between columns on `layoutId` when its status
changes. With a read-only checkbox, no visitor can ever trigger it — it would become an admin-only
delight, which is a lot of machinery for an audience of one.

So the board gets **filter pills** (`all / to do / in progress / shipped`), and the same
`layoutId` makes the cards travel when the filter changes. Same code, same motion, publicly
reachable. Copy the `/log` pattern exactly: pills mirror into `?status=`, read through
`useSyncExternalStore` and **not** `useSearchParams` — on a route that prerenders, `useSearchParams`
makes the build emit the Suspense fallback instead of the content, and the cards vanish from the
server HTML.

### Motion rules that apply here

All of these are already respected in the prototype; the note is so they survive a refactor.

- Entrances are `whileInView` with `once` on the page; the dialog uses `animate`, because it mounts
  rather than scrolls into view.
- The card's entrance lives on an **inner** element: the `<li>`'s transform belongs to the layout
  animation, and two owners on one channel fight.
- Every JS-driven animation asks `useReducedMotion()` — the global CSS reset doesn't reach Motion.
- The progress bar scales, never animates `width`.
- Lists that hold lifting cards need `py-1` clearance, or the container clips the top border.

### Accessibility

- Column headings are real headings; the item title is the `<h3>`, not the status label.
- Status is announced in text (`sr-only`), never by the glyph or the accent bar alone.
- `--rm-check-ink` stays dark on the brand fill. White fails contrast in marmalade first — that's
  the whole reason the token exists.
- Filter pills get `aria-pressed`.
- The stepper's marks are `aria-hidden`; the counts are read from the labels.

---

## Phase 4 — `/roadmap`

```
app/roadmap/
  page.tsx      force-dynamic, createMetadata(), breadcrumb + header + board
  loading.tsx   skeletons for the progress card and three columns
  error.tsx     the data IS the page, so an empty board when Postgres is down is a lie
```

- `createMetadata({ title: "Roadmap", description: …, path: "/roadmap" })`.
- Content in the server HTML — no `useSearchParams`, no animation gating mount on a timer, no
  `text.slice(0, n)`.
- An empty column renders "nothing here", not nothing. A column with no cards is information.
- Responsive: three columns at `md`, stacked below. Reason about **375px minus the 56px sidebar =
  319px** — cards are already fluid, but the stepper wraps and needs checking at that width.
- Add `/roadmap` to the command palette and to `next-sitemap`'s output.

### Checklist — Phase 4

- [ ] `loading.tsx` and `error.tsx` both exist
- [ ] `next build` passes with `DATABASE_URL` unset/unreachable
- [ ] Cards present in `curl`'d HTML, with and without `?status=`
- [ ] Palette entry + sitemap

---

## Phase 5 — the sidebar, and retiring the file

### The tab

Stays where the prototype put it: `mt-auto self-end`, flush against the sidebar's right edge,
vertical `ROADMAP` reading bottom-up with the `◆`. On hover it opens its letter-spacing and the
diamond pulses.

Open question deliberately left for the visual pass: **dialog vs. drawer.** The prototype is a
centred dialog; the original idea was a panel sliding out of the edge, which fits the editor
metaphor better (it is literally a VSCode side panel). The drawer is more work — it competes with
the page for width and has to decide whether it pushes or overlays — so it is only worth it if the
tab is going to become a _pattern_. Which leads to:

### Is the tab a pattern?

`Give the sidebar a job` names two tenants: the roadmap and comments. This plan builds **one**
tab, hardcoded, on purpose. If comments arrive and want the same treatment, that is the moment to
extract `SidebarTab` + a panel host — not before. Two tenants is the threshold; one is a guess.

### Retiring `ROADMAP.md`

Only after the seed is verified in production:

- [ ] Delete `ROADMAP.md`
- [ ] Rewrite the `## ROADMAP.md` section of `CLAUDE.md`: the holding pen is now
      `/admin/roadmap` with status `raw`, the "write it down, don't evaluate it" rule moves to the
      form's helper text and to that section, and the "an idea that grows moves into
      `docs/<name>-plan.md`" rule is unchanged — it just gets a `plan_url` to record it.
- [ ] `README.md`: mention the table and the seed script alongside the log's.
- [ ] `CLAUDE.md` folder map: `app/roadmap/`, `app/admin/roadmap/`, `lib/roadmap/`,
      `components/roadmap/`.
- [ ] `CLAUDE.md` env section: nothing new — this rides on `DATABASE_URL` and `ADMIN_EMAILS`.
- [ ] Delete `lib/roadmap-data.ts` and every `PROTÓTIPO / DISCOVERY` banner.

---

## Phase 6 — what comes after, not now

- **Drag to reorder** in the admin, writing `position`. Wants a proper look at pointer vs. keyboard
  reordering; a board you can only reorder by mouse is a board half the people can't reorder.
- **A `roadmap-import` script** reading a markdown file into the table — the escape hatch if
  form-capture turns out to cost more than it saves.
- **Shipped counts by year** on the board footer, now that `shipped_at` exists.
- **The generic sidebar panel**, when comments show up and there are two tenants.
- **A home card** — decided against for now. If it happens it's `bento-card` + the three `doing`
  items + a link to the board, and nothing else.

---

## Order

Phase 0 → 1 → 2 before anything is visible; 3 → 4 → 5 is the part you can look at. Phase 5's
deletions happen last and only once the data is live — the file is the backup until it isn't.

## Where the prototype stands

Uncommitted, working, and deliberately temporary:

```
lib/roadmap-data.ts                     hardcoded data — becomes the seed, then dies
components/roadmap/roadmap-tab.tsx      tab + dialog
components/roadmap/roadmap-board.tsx    the three columns
components/roadmap/roadmap-card.tsx     the item card — keeps
components/roadmap/roadmap-progress.tsx the progress card — keeps
components/roadmap/roadmap-checkbox.tsx splits into public (read-only) and admin (interactive)
components/roadmap/use-roadmap-state.ts local toggle state — dies with the read-only decision
app/roadmap/page.tsx                    keeps, gains metadata/loading/error
app/globals.css                         the `ROADMAP — PROTÓTIPO` block moves up into the card CSS
components/chrome/sidebar.tsx           one import and one line — keeps
```

---

## What changed after the plan

Written down because a plan that quietly stops matching the code is worse than no plan.

- **The dialog is gone.** The sidebar link goes straight to `/roadmap`. Two surfaces meant
  two implementations of the same board to keep in step, and only one of them had a URL.
- **`GET /api/v1/roadmap` went with it.** The dialog was its only consumer, and an
  unauthenticated public route with nothing calling it is surface for free.
- **The LED replaced the accent bar.** A light runs the card's whole border on hover
  instead of a bar lighting one edge; in-progress cards rest dimly lit.
- **The sidebar tab became a nav-shaped button.** The vertical tab was a shape used nowhere
  else on the site and read as something glued to the edge rather than living in it.
- **`ROADMAP.md` is deleted.** Phase 5 said it would go once the seed had run, and it has.
  A version regenerated from the table was tried for about ten minutes and thrown away: a
  mirror of a list is still a second copy of the list. `scripts/seed-roadmap.ts` keeps the
  original text.
