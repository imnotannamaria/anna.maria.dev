# Tests — implementation plan

The roadmap item: "The site has real features now, with CRUD, auth and a database behind them,
and none of it is tested. I do not know what I will use yet. Maybe Vitest for the small pieces
and Playwright for the flows." Today there is no test runner, no CI, and no test in the repo.

The brief: **quality over quantity.** Not "raise coverage" — a suite that tells the truth when
something breaks and stays quiet otherwise. That rules out snapshot tests (they go green on any
output, including a wrong one, the moment you `-u`), mocking Postgres for anything that exercises
a real query, and testing what `tsc` already proves. The bar for every test below is the same
question: **what shipped bug, or what bug this codebase has already written prose about fearing,
would this have caught?** If there is no answer, the test does not go in.

---

## The rule this plan learned the hard way: prove the test can fail

The first implementation of this plan shipped tests that passed against **deliberately broken
code**. Deleting the admin auth guard outright left 7 of 8 guard tests green, and the velite
regression test stayed green against the exact typo it was written for. Both were caught in review,
by mutation rather than by reading — which is the point.

The mechanism was always the same: **an assertion whose expected value is also what broken code
produces.** `404` is the tell in this codebase, because the admin guard rejects with `404` (to avoid
confirming the route exists) and Hono's `notFound()` answers unrouted paths with `404` too. Aim a
test at a path that no route matches and you assert `404` against `404` forever.

Three habits follow, and they apply to every test added here from now on:

1. **Before trusting a test, break the thing it covers and watch it go red.** Not as ceremony — as
   the only evidence that the assertion is connected to anything. Every fix in this branch was
   verified this way, including the subtle ones (making the allowlist case-sensitive, not just
   deleting it).
2. **Prefer a differential assertion to a single status.** One request shape, two identities, two
   different outcomes — `expect(allowed).toBe(400)` beside `expect(rejected).toBe(404)` — cannot go
   vacuous, because a permissive bug collapses both sides into one value and the test fails.
3. **Assert the invariant, not a proxy for it.** "The collection has N entries" is a proxy for "the
   content is intact" and misses a broken `cover`; "every cover resolves to a file" is the invariant
   and catches it by name.

---

## What the first draft of this plan got wrong

This document was written once, then checked against the code. Most of it survived; the single
most important decision in it did not. Recording that here because the failure is instructive and
because the fix is the most technical part of the plan.

**The Playwright auth design was broken.** The first draft said: copy AuthKit's own
`dist/esm/test-helpers.js` (`generateSession()`), which seals a fake session under
`WORKOS_COOKIE_PASSWORD`, and set it as a cookie. That does not work here, for a reason specific
to how this app is wired.

[proxy.ts](../proxy.ts) runs `authkitProxy` with `middlewareAuth.enabled: true`. That path leads
to `updateSession()`, which calls:

```js
// node_modules/@workos-inc/authkit-nextjs/dist/esm/session.js
const JWKS = lazy(() =>
  createRemoteJWKSet(new URL(getWorkOS().userManagement.getJwksUrl(WORKOS_CLIENT_ID))),
)

async function verifyAccessToken(accessToken) {
  try {
    await jwtVerify(accessToken, JWKS())
    return true
  } catch {
    return false
  }
}
```

The access token is verified **RS256 against WorkOS's remote JWKS**. AuthKit's own test helper
signs HS256 with `WORKOS_COOKIE_PASSWORD` as the secret — that fails `jwtVerify`. On failure the
proxy falls through to `authenticateWithRefreshToken` against the real WorkOS API, which also
fails, and because `middlewareAuth.enabled` is on and `session.user` is null, the proxy
**redirects to WorkOS**. The test would have gotten a login page, not the admin.

(`generateSession()` was unusable anyway: it writes the cookie through `next/headers`'
`cookies()`, which only exists inside a Next server request. Playwright sets cookies from the
outside, through `context.addCookies()`.)

The fix is real and it is clean — see [Phase 5](#phase-5--end-to-end-playwright). `getJwksUrl()`
is `` `${this.workos.baseURL}/sso/jwks/${clientId}` ``, and `baseURL` is assembled from three env
vars the SDK reads: `WORKOS_API_HOSTNAME`, `WORKOS_API_HTTPS`, `WORKOS_API_PORT`. Point them at a
local server, serve a JWKS holding a keypair the tests own, and sign the token with the matching
private key. The verification then genuinely passes rather than being bypassed, which is a better
test than a bypass would have been.

The other corrections are folded into the phases below: `server-only` breaks Vitest, `.velite` is
gitignored so CI must build it before `tsc`, `docs/sql/` is missing the wristkit table, module-scope
caches leak between tests, and the contact-form test cannot use `page.route()`.

---

## What we decided

| Question           | Decision                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| Unit + integration | Vitest 4                                                                                             |
| End-to-end         | Playwright                                                                                           |
| DB in tests        | By layer — pure logic gets none, anything that queries gets a real disposable Postgres, never a mock |
| Auth in Playwright | Injected session cookie, verified against a **local JWKS** the tests own                             |
| CI                 | GitHub Actions, two jobs, both required — a red suite blocks merge from day one                      |
| Coverage threshold | None                                                                                                 |

### Decisions made without asking, and why

- **One runner, two Vitest projects.** DB-touching tests are `*.integration.test.ts` and run under
  a named project with its own setup file, so the fast pass runs anywhere and the DB pass runs
  where there is a DB. Vitest 4's `test.projects` does this in one config file; the old
  `vitest.workspace.ts` is gone in v4.
- **A missing `DATABASE_URL` fails the integration run rather than skipping it.** The first draft
  said "skip with a clear message," mirroring the degrade-don't-crash instinct in
  [lib/db/client.ts](../lib/db/client.ts). That instinct is right for a page and wrong for a test:
  a skipped test reports green, and a suite that reports green while testing nothing is exactly
  the failure the brief is about. The page degrades; the test shouts.
- **Postgres in a container, schema from `docs/sql/*.sql`, not a Supabase branch.** A service
  container is free, disposable, and starts in seconds, and it cannot drift from what a migration
  does because it _is_ the migration. Locally the same thing via `docker compose`, sharing nothing
  with the real database.
- **No coverage threshold.** A percentage invites tests written to move the percentage, which is
  the quantity failure mode restated. The judgement is which invariants matter, and a number
  cannot make it.
- **No React component tests, and therefore no jsdom.** The first draft installed
  `@vitejs/plugin-react`, `@testing-library/react` and `jsdom` and then never used them in any
  phase — four dependencies of pure ceremony in a plan whose whole premise is that tests earn
  their place. Components are covered where they are actually observable: in the served HTML
  ([Phase 4](#phase-4--the-bugs-that-already-shipped)) and in the browser
  ([Phase 5](#phase-5--end-to-end-playwright)).

---

## Phase 0 — tooling

```bash
npm i -D vitest @playwright/test iron-session jose
npx playwright install --with-deps chromium
```

`iron-session` and `jose` are transitive dependencies of `@workos-inc/authkit-nextjs` today. The
Playwright helper imports them directly, so they become direct devDependencies — relying on
another package's transitive tree is how a test suite breaks on an unrelated `npm update`.

### Three things that will break before the first test runs

**1. `server-only` throws under Vitest.** The package resolves by export condition:

```json
{ "exports": { ".": { "react-server": "./empty.js", "default": "./index.js" } } }
```

`index.js` throws by design. Vitest resolves the `default` condition, so importing
[lib/log/mutations.ts](../lib/log/mutations.ts),
[lib/log/poster-allowlist.ts](../lib/log/poster-allowlist.ts) or
[lib/auth/require-admin.ts](../lib/auth/require-admin.ts) blows up on line 1. AuthKit's own
`session.js` and `auth.js` do the same. The fix is an alias to an empty module — not adding
`react-server` to `resolve.conditions`, which would also swap React itself for its RSC build and
cause stranger failures further down.

**2. `@/` is a tsconfig path, which Vite does not read.** This called for `vite-tsconfig-paths`;
Vite 8 resolves it natively with `resolve.tsconfigPaths: true`, so the plugin was installed, found
redundant and removed again.

**3. `.velite` is gitignored** and [lib/velite.ts](../lib/velite.ts) imports `@/.velite`. Anything
that reaches it — including `tsc --noEmit` — fails in a fresh checkout until `velite build` has
run. CI has to build content before it type-checks.

### `vitest.config.ts`

```ts
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    // See "three things that will break", above.
    alias: [
      {
        find: /^server-only$/,
        replacement: new URL("./tests/stubs/empty.ts", import.meta.url).pathname,
      },
    ],
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["{app,lib,components,hooks}/**/*.test.ts"],
          // `*.test.ts` also matches `*.integration.test.ts`. Without this, `--project
          // unit` silently ran the DB suite too, against whatever DATABASE_URL happened
          // to resolve to — which on one machine was a real local Postgres.
          exclude: ["**/*.integration.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          environment: "node",
          include: ["lib/**/*.integration.test.ts"],
          setupFiles: ["./tests/setup/db.ts"],
          // One database, shared. Parallel files would truncate each other's rows mid-test.
          fileParallelism: false,
        },
      },
    ],
  },
})
```

`tests/stubs/empty.ts` is one line: `export {}`.

### `tests/setup/db.ts`

```ts
import { afterAll, beforeEach } from "vitest"
import postgres from "postgres"

const url = process.env.DATABASE_URL
if (!url) {
  throw new Error(
    "Integration tests need DATABASE_URL. Run `docker compose -f docker-compose.test.yml up -d` first.",
  )
}

const sql = postgres(url, { prepare: false })

beforeEach(async () => {
  await sql`truncate log_entries, roadmap_items, wristkit_samples restart identity cascade`
})

afterAll(async () => {
  await sql.end()
})
```

**Truncating is not enough on its own.** Three modules hold state in module scope that no `TRUNCATE`
touches, and each is a way for one test to silently change another's result:

| Module                                                                  | State                       | Consequence                                    |
| ----------------------------------------------------------------------- | --------------------------- | ---------------------------------------------- |
| [lib/log/poster-allowlist.ts](../lib/log/poster-allowlist.ts)           | `cache`, `lastRefresh`      | A URL stays "known" after its row is truncated |
| [lib/api/middleware/rate-limit.ts](../lib/api/middleware/rate-limit.ts) | `buckets` Map               | A 429 test poisons every later request         |
| [lib/db/client.ts](../lib/db/client.ts)                                 | `cached` pool, keyed by URL | Harmless, but reset with the rest              |

Any test that depends on one of those calls `vi.resetModules()` and re-imports the module under
test with a dynamic `import()`. This is stated once here so it is not rediscovered three times.

### `docs/sql/002-wristkit-samples.sql` — a real gap, not a test detail

`docs/sql/` holds `001-log-entries.sql` and `003-roadmap-items.sql`. There is **no 002**, and
`wristkit_samples` — with `uq_sample_dedupe`, `idx_metric_recorded` and `idx_user_metric_recorded`
— exists only as [lib/wristkit/schema.ts](../lib/wristkit/schema.ts) and as whatever was typed into
Supabase by hand. Standing the schema up from `docs/sql/*.sql` therefore cannot produce a working
wristkit test.

Writing `002-wristkit-samples.sql` from the Drizzle schema is a Phase 0 task, and it is worth
doing whether or not the tests happen: right now the wristkit table cannot be recreated from
anything in the repo.

### `docker-compose.test.yml`

One `postgres:17` service, a `pg_isready` healthcheck, `./docs/sql` mounted read-only at
`/docker-entrypoint-initdb.d/` so the schema is real on every fresh `up`, and a **tmpfs data
directory** so `docker compose down` genuinely discards everything.

### `package.json`

```json
"test": "vitest run --project unit",
"test:watch": "vitest --project unit",
"test:integration": "vitest run --project integration",
"test:e2e": "playwright test"
```

---

## Phase 1 — pure logic (Vitest, node, no DB)

Functions where a wrong answer is a silent data bug rather than a crash — which is precisely what
lint and `tsc --noEmit` cannot see, because the types are right and the logic is wrong.

- **[lib/slug.ts](../lib/slug.ts)** — `slugify()`: "Amélie" → `amelie` (the NFD strip working, not
  dropping the letter); a title that is only punctuation; the 120-char truncation not leaving a
  trailing dash, which is the case the final `.replace(/-+$/, "")` exists for and the one a
  refactor would drop. `uniqueSlug()`: first collision → `-2`, second → `-3`, and the
  thousand-collision `Date.now()` fallback.
- **[lib/auth/require-admin.ts](../lib/auth/require-admin.ts)** — `isAdminEmail()`. This is the
  security boundary CLAUDE.md names ("the middleware matcher is not the gate; a matcher can be
  edited wrong"), so it gets the most adversarial cases: `Anna@Example.com` against a lowercase
  allowlist, whitespace in `ADMIN_EMAILS`, `null`/`undefined` not throwing, and — the one that
  matters most — **`ADMIN_EMAILS` unset denying everyone rather than admitting everyone.** Note
  the file needs the `server-only` alias and `vi.mock("@workos-inc/authkit-nextjs")` to import at
  all, since it pulls `withAuth`.
- **[lib/wristkit/queries.ts](../lib/wristkit/queries.ts)** — `startOfToday(tz)`, promoted out of
  the DB phase because it needs no DB and it is the gnarliest arithmetic in the repo:

  ```ts
  const local = new Date(now.toLocaleString("en-US", { timeZone: tz }))
  const offsetMs = local.getTime() - now.getTime()
  const midnightInNodeTz = new Date(local.getFullYear(), local.getMonth(), local.getDate())
  return new Date(midnightInNodeTz.getTime() - offsetMs)
  ```

  A round-trip through a localised _string_ to recover an offset, then a subtraction. CLAUDE.md
  lists timezone traps as a standing bug class, and this is where one would live. Test with
  `vi.setSystemTime()` at a fixed instant across `America/Sao_Paulo`, `UTC` and a positive-offset
  zone, including an instant just after local midnight and one just before — plus a DST boundary,
  where the string round-trip is least trustworthy.

- **[lib/log/date.ts](../lib/log/date.ts)** — `formatLoggedAt`. The docstring says it exists
  precisely because `new Date("2026-07-28")` is UTC midnight and renders as the 27th in a negative
  offset. Test it under a `TZ` that would expose that, so the comment stops being a promise.
- **[lib/log/validation.ts](../lib/log/validation.ts)** — not "zod works", only the hand-written
  refinements: `externalUrl` rejecting `javascript:alert(1)` (the comment beside it calls this
  stored XSS, and it becomes a stretched-link `href` — that comment is the test) and `http://`;
  the same on `posterUrl`; the half-star `(v * 2) % 1 === 0` rule accepting `4.5` and rejecting
  `4.3`; `slug`'s `""`-vs-`undefined` handling, which the comment says was already got wrong once.
- **[lib/roadmap/validation.ts](../lib/roadmap/validation.ts)** — the status enum and whatever
  `planUrl` allows, on the same grounds.
- **[lib/log/poster-src.ts](../lib/log/poster-src.ts)** — `encodePosterToken` against the
  `decodePosterToken` in [lib/api/routes/poster.ts](../lib/api/routes/poster.ts). These are a
  matched pair deliberately living in two files ("Change one, change the other"), which is exactly
  the arrangement a round-trip test protects. Include a URL with `+` and `/` in its base64, since
  that is the whole reason for the `-`/`_` substitution, and a non-ASCII URL.
- **[lib/log/counts.ts](../lib/log/counts.ts)** — `typeBreakdown` omitting zero-count types and
  ordering by `LOG_TYPES`.
- **[lib/log/stars.ts](../lib/log/stars.ts)** — `starString(4.5)` → `"★★★★½"`, `null` → `""`,
  and `starLabel` never returning a bare glyph.

---

## Phase 2 — the API surface (Vitest + Hono `app.request()`)

Hono apps are `fetch` handlers, so a route can be exercised in-process with no server and no
network: `await app.request("/api/v1/...", { method: "POST", ... })`. This is the cheapest place
in the whole plan to test real security behaviour, and the first draft skipped it entirely.

- **Middleware order.** [lib/api/routes/admin-log.ts](../lib/api/routes/admin-log.ts) mounts
  `requireAdminApi` on `*` before any route attaches `jsonBody()`. CLAUDE.md states the invariant:
  "middleware ordered so unauthenticated requests never reach a body parse." Test it by asserting
  an unauthenticated `POST` with a malformed body and no `content-type` returns **404, not 415 or
  400** — the difference between those status codes is the difference between the guard running
  first and running second, and nothing else in the codebase would reveal a reordering.
- **The 404-not-403 rule.** Every admin route, unauthenticated and non-allowlisted, answers 404.
  A 403 confirms the route exists, which CLAUDE.md forbids in two separate places.
- **[lib/api/middleware/api-key.ts](../lib/api/middleware/api-key.ts)** — right key passes; wrong
  key **of the same length** fails. That second case is the one worth having: a refactor to `===`
  would pass every other test here and quietly lose the constant-time property, and a length
  mismatch takes the early-return path instead of `timingSafeEqual`. Also: missing header, and
  missing env var not admitting everyone.
- **[lib/api/routes/poster.ts](../lib/api/routes/poster.ts)** — the SSRF surface, and the largest
  gap in the first draft. `isBlockedHost` and `isFetchableUrl` are not exported, so they are tested
  through the route, which is the right level anyway. Assert 400 for `http://`, for `localhost`,
  `127.0.0.1`, `10.x`, `192.168.x`, `172.16–31.x`, and **`169.254.169.254`** — the cloud metadata
  endpoint the file names as the reason redirects are validated at all. Then the redirect path with
  `vi.stubGlobal("fetch", …)`: a 302 to a private address must not be followed, and a second hop
  must be refused by `MAX_REDIRECTS`. Also `content-type: text/html` → 415, an oversized
  `content-length` → 413, and a body that exceeds `MAX_BYTES` **despite an honest-looking header**
  → 413, since the comment says buffering exists for exactly that case.
  A test here encodes current behaviour, which is the point: the checks are literal-address only
  by design, so if someone later widens or narrows them, the diff has to say so out loud.
- **[lib/api/middleware/rate-limit.ts](../lib/api/middleware/rate-limit.ts)** — the `max + 1`
  request gets a 429 with a `retry-after`, and the custom `key` function buckets separately.
  Poster's key is `poster:<token>`, not the IP, and the file explains at length why IP-keying
  would be exactly backwards behind `next/image`. A test pinning the key function is what stops
  that reasoning being undone by someone tidying up. Needs `vi.resetModules()` per the table above.
- **`app.onError`** — a route that throws returns `{ error: "internal_error" }` with no stack and
  no message from the underlying error. CLAUDE.md: no stack traces in responses.
- **[app/api/contact/route.ts](../app/api/contact/route.ts)** — a plain route handler, so call the
  exported `POST` directly with a `Request`. Four cases: the honeypot (`website` filled → `200
{success:true}` **and `resend.emails.send` never called** — asserting the fake success without
  asserting the non-send tests the wrong half); invalid JSON → 400; a zod failure → 400 with
  `fieldErrors`; a Resend error → 500 with a generic message and nothing from the provider leaking
  through. `vi.mock("resend")` is legitimate here — Resend is a third party at a network boundary,
  not our schema.

---

## Phase 3 — the database (Vitest + real Postgres)

Everything that touches Drizzle, against the actual schema in `docs/sql/`. Not "does Postgres
work" — the invariants this project has already written prose about protecting.

- **[lib/log/queries.ts](../lib/log/queries.ts)** — the highest-value test in the phase: insert a
  `published: false` entry, assert it is **absent** from the public feed
  (`.where(eq(logEntries.published, true))`) and **present** in the admin listing. A leaked draft
  is invisible in the UI until someone notices it, and `published` is the only column standing
  between the two.
- **`toEntry()`'s numeric conversion** — `rating` is a `numeric` column, which `postgres.js` hands
  back as a **string**. `toEntry` converts it, and the docstring says to do it "here, once, so
  nothing downstream has to remember." Insert `4.5`, read it back, assert `typeof rating ===
"number"`. A regression here does not throw; it renders `"4.5"` stars and sorts wrong.
- **`TYPE_ORDER` and the sort** — music first, `favorite` before non-favorite within a type, then
  date. `/log`'s grouping-in-arrival-order depends on the query's order being exactly this.
- **[lib/roadmap/queries.ts](../lib/roadmap/queries.ts)** — `getPublicItems()` excludes `raw`;
  `getAllItems()` includes it. `raw` is described as "the old ROADMAP.md file" — somewhere to put
  a thought that never renders publicly — so a leak is a private note on a public page.
  Also `getItemById("garbage")` returning `null` rather than raising, which is what `isUuid()`
  guards and which turns a wrong URL into an error page if it regresses.
- **[lib/log/mutations.ts](../lib/log/mutations.ts)** / **[lib/roadmap/mutations.ts](../lib/roadmap/mutations.ts)**
  — create then read back: `blankToNull` storing `null` and not `""`; `favorite`/`published`
  defaulting in `toRow` rather than in zod, which the comment says was deliberate; update leaving
  untouched columns alone; delete returning `null` for an unknown id rather than throwing.
- **Slug collision, end to end** — insert an entry, insert a second with the same title, assert
  the second gets `-2` and that the unique index is what would otherwise have raised. This is the
  one place `uniqueSlug()` meets the constraint it exists to stay ahead of, and neither half is
  meaningful alone.
- **[lib/log/poster-allowlist.ts](../lib/log/poster-allowlist.ts)** — a stored URL is known, an
  arbitrary one is not (the poster proxy's entire authorisation model). Then the two timing rules:
  a miss re-reads once so a just-saved poster is not broken for a minute, and a second miss inside
  `MIN_REFRESH_MS` does **not** re-read, which is what stops random-token probing from becoming
  one query per request. Drive both with `vi.useFakeTimers()` rather than sleeping five seconds.
- **[lib/wristkit/queries.ts](../lib/wristkit/queries.ts)** — `getTodayActivity` with samples
  straddling local midnight: yesterday's are excluded, `lastSync` is the newest of the three
  metrics, and a metric with no sample is `null` rather than `0`. A wrong number here ships
  silently to the home page, which is the definition of a bug worth a test.

---

## Phase 4 — the bugs that already shipped

Two failures documented in CLAUDE.md that reached production, that no unit test would see, and
that are both mechanically checkable. If only one phase of this plan gets built, the argument for
it being this one is that these are the only tests here with a proven track record.

**1. Content missing from the server HTML.** CLAUDE.md, on `/blog`: `useSearchParams` on a static
route makes prerender emit the Suspense fallback, "so every post was missing from the HTML a
crawler reads, on the one page whose whole job is listing posts." The fix was
[components/ui/url-filter.tsx](../components/ui/url-filter.tsx), whose `serverSnapshot()` returns
null so nothing is filtered during the server render.

The test is a Playwright `request.get()` — the raw served HTML, no JavaScript — asserting every
published post title appears in `/blog`, every project in `/projects`, and every public item in
`/roadmap`. It fails the moment someone reaches for `useSearchParams`, or gates a mount on a
timer, or animates text by growing `text.slice(0, n)` — all three named in CLAUDE.md's SEO check
and all three invisible to a test that runs JavaScript.

**2. One typo emptying `/projects`.** `wristkit.mdx` shipped `cover: "./wirstkit.png"`; because
`output.clean` empties `.velite` before writing and a failed validation writes nothing, **every
project vanished** and the page said "nothing published yet." The `existsSync` refine in
[velite.config.ts](../velite.config.ts) is the guard.

This plan originally left a question open here — whether `velite build` exits non-zero on a
validation failure. **It was measured, and the answer changes the test.** Reproducing that exact
typo on the current velite:

```
velite build  ->  logs "info cover file not found under public/"  ->  EXIT CODE 0
.velite       ->  4 projects, unchanged — wristkit still present
its cover     ->  "/projects/wirstkit.png", a path with no file behind it
```

So the document is **not** dropped and the build does **not** fail. The collection-count assertion
the first draft proposed therefore cannot see this class of error at all — it went in, was verified
against the real bug, and stayed green. What catches it is asserting the invariant directly: every
`cover` in the output resolves to a file under `public/`. The count assertions are kept for the
catastrophic case (a whole collection dropped), not because they cover this one.

The root cause is still that `velite build` exits 0 on a validation issue, which no test fully
compensates for. Making it fail the build is the real fix and is deliberately out of scope here —
it changes production build behaviour, which does not belong in a branch about tests.

---

## Phase 5 — end-to-end (Playwright)

Few, and only for what nothing else can see: real routing, real cookies, real middleware.

### The local JWKS, in full

`playwright/global-setup.ts` generates an RS256 keypair, serves the public half where the WorkOS
SDK will look for it, and writes the private half where the tests can reach it:

```ts
import { createServer } from "node:http"
import { exportJWK, exportPKCS8, generateKeyPair } from "jose"
import { writeFileSync } from "node:fs"

export const JWKS_PORT = 9797
export const CLIENT_ID = "client_test"

export default async function globalSetup() {
  const { publicKey, privateKey } = await generateKeyPair("RS256", { extractable: true })
  const jwk = { ...(await exportJWK(publicKey)), alg: "RS256", use: "sig", kid: "test-key" }

  const server = createServer((req, res) => {
    // getJwksUrl(clientId) === `${baseURL}/sso/jwks/${clientId}`
    if (req.url === `/sso/jwks/${CLIENT_ID}`) {
      res.writeHead(200, { "content-type": "application/json" })
      res.end(JSON.stringify({ keys: [jwk] }))
      return
    }
    res.writeHead(404).end()
  })
  await new Promise<void>((r) => server.listen(JWKS_PORT, r))

  writeFileSync("playwright/.private-key.pem", await exportPKCS8(privateKey))
  return () => new Promise<void>((r) => server.close(() => r()))
}
```

`playwright.config.ts` points the app at it. The SDK builds `baseURL` as
`` `${https ? "https" : "http"}://${apiHostname}${port ? `:${port}` : ""}` ``, so:

```ts
webServer: {
  command: "npm run build && npm start",   // `build` is `velite build && next build`
  url: "http://localhost:3000",
  env: {
    WORKOS_API_HOSTNAME: "localhost",
    WORKOS_API_HTTPS: "false",
    WORKOS_API_PORT: String(JWKS_PORT),
    WORKOS_CLIENT_ID: CLIENT_ID,
    WORKOS_API_KEY: "sk_test_not_a_real_key",
    WORKOS_COOKIE_PASSWORD: process.env.TEST_WORKOS_COOKIE_PASSWORD!,  // 32+ chars
    NEXT_PUBLIC_WORKOS_REDIRECT_URI: "http://localhost:3000/api/auth/callback",
    ADMIN_EMAILS: "admin@test.dev",
    DATABASE_URL: process.env.DATABASE_URL!,
  },
},
```

The helper seals a session the way `encryptSession()` does — note `ttl: 0`, matching AuthKit, or
`unsealData` applies its own 14-day default:

```ts
export async function signInAs(context: BrowserContext, email: string) {
  const privateKey = await importPKCS8(readFileSync("playwright/.private-key.pem", "utf8"), "RS256")

  const accessToken = await new SignJWT({ sid: "session_test" })
    .setProtectedHeader({ alg: "RS256", kid: "test-key" })
    .setIssuedAt()
    .setExpirationTime("2h") // well clear of the 60s refresh buffer
    .sign(privateKey)

  const value = await sealData(
    { accessToken, refreshToken: "rt_test", user: { id: "user_test", email, object: "user" } },
    { password: process.env.TEST_WORKOS_COOKIE_PASSWORD!, ttl: 0 },
  )

  await context.addCookies([{ name: "wos-session", value, domain: "localhost", path: "/" }])
}
```

`jwtVerify` now genuinely succeeds, `verifyAccessToken` returns true, and `respondWithCurrentToken`
hands `withAuth()` a real session. Nothing is stubbed out — the middleware runs its actual code
path, which is why this is worth more than a bypass.

### The flows

- **The gate, four ways.** Allowlisted → `/admin` renders. Non-allowlisted, _validly signed_ →
  **404**, which is the case that proves `ADMIN_EMAILS` is doing the work rather than the signature
  check. No cookie → redirected to the (mocked, unreachable) WorkOS host rather than served. And
  the same allowlisted/non-allowlisted pair against `/api/v1/admin/log` directly, because CLAUDE.md
  says the page guard and the route guard are two call sites that must both hold.
- **Admin CRUD, one flow each.** Create a log entry through the real form → it appears on `/log`.
  Edit → the change shows. Delete → it is gone. Same for one roadmap item. This is what covers the
  react-hook-form wiring, the submitting state and the server round trip, none of which a schema
  test reaches.
- **Explicitly out of scope: the OAuth handshake** (`/api/auth/callback`). Covering it means either
  the real WorkOS or reimplementing their flow as a mock, and neither buys back its cost. The
  handshake is WorkOS's responsibility; the allowlist is ours, and that is what is tested.
- **Not the contact form.** The first draft put it here and proposed stubbing Resend with
  `page.route()` — which cannot work: `page.route()` intercepts _browser_ requests, and the Resend
  call happens server-side inside the route handler. It moved to Phase 2, where mocking the module
  is straightforward and the assertions are sharper.

---

## Phase 6 — CI

`.github/workflows/test.yml` — there is no `.github/` in this repo yet.

```yaml
name: test
on: pull_request

jobs:
  static:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npx velite build # .velite is gitignored; tsc and the Phase 4 test need it
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm test

  db:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17
        env: { POSTGRES_PASSWORD: postgres }
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready --health-interval 5s --health-timeout 5s --health-retries 10
    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/postgres
      TEST_WORKOS_COOKIE_PASSWORD: ${{ secrets.TEST_WORKOS_COOKIE_PASSWORD }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      # Glob order is 001, 002, 003 — which is also dependency order.
      - run: for f in docs/sql/*.sql; do psql "$DATABASE_URL" -f "$f"; done
      - run: npm run test:integration
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
```

Both jobs are required checks. `TEST_WORKOS_COOKIE_PASSWORD` is a repo secret unrelated to the
production one — it only seals throwaway sessions, but it must be 32+ characters or AuthKit
throws. Nothing else in either job is a real credential: the WorkOS API key is a dummy string,
because the local JWKS means the SDK never makes a call.

`npx velite build` before `tsc --noEmit` is not optional, per Phase 0. The `db` job runs
`npm run build` through Playwright's `webServer`, which already includes velite.

---

## What this deliberately does not test, and where those checks live instead

CLAUDE.md's review list is broader than any suite can be. Being explicit about the gap is what
keeps a green CI from being read as "the review list passed."

| CLAUDE.md check                   | Covered here                                                                                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Security                          | Yes — Phases 1, 2, 5                                                                                                                                                                 |
| Backend (Hono), middleware order  | Yes — Phase 2                                                                                                                                                                        |
| Bugs (timezone, hydration)        | Yes — Phase 1                                                                                                                                                                        |
| SEO (content in server HTML)      | Yes — Phase 4, and it is the reason that phase exists                                                                                                                                |
| Performance                       | Partly — the `countByType` "derivable from data already fetched" shape is tested; per-frame repaint cost is not measurable here                                                      |
| Loading and error states          | Partly — `loading.tsx`/`error.tsx` existence is a lint-shaped check, not a test                                                                                                      |
| **Motion**                        | **No.** Every rule is about perception. An entrance on `animate` instead of `whileInView` renders identically to a headless assertion — a human notices it played to an empty room   |
| **Accessibility (contrast)**      | **No.** Contrast on `--fg-brand` varies per theme and mode, and marmalade is where white fails first. Automatable in principle, not worth the harness against six themes × two modes |
| **Responsive**                    | **No.** Code-level reasoning at 375px minus the 56px sidebar, per CLAUDE.md, and the visual pass is Anna's                                                                           |
| **Standardization / duplication** | **No.** "Could a reader tell which page a screenshot came from, for the right reasons?" is not an assertable question                                                                |
| **Theme reactivity**              | Better as a lint rule than a test — a grep for brand hexes outside `globals.css` belongs in `eslint`, where it reports at the point of writing                                       |

The last row is the one worth acting on separately: a hardcoded `#7c6bff` is exactly the kind of
mechanical mistake a custom ESLint rule catches for free and a test suite catches awkwardly.

---

## Sequencing

Phase 0 first, including `002-wristkit-samples.sql` — that file is missing whether or not the rest
of this happens.

Then **Phase 4**, out of numeric order and on purpose: it is two tests, it needs no database, and
it is the only phase covering bugs that have actually shipped. It is also the fastest way to find
out whether the whole suite is worth building — if it goes green and stays green through a month
of changes, the premise held.

Then Phase 1 and Phase 2 together (both are `vitest --project unit`, both need no infrastructure),
Phase 3 once the container is up, Phase 5 last since it is the most machinery for the fewest
tests. Phase 6 grows alongside: add the `static` job as soon as Phase 4 exists, the `db` job when
Phase 3 does. A CI workflow with nothing to run is a checkbox, not a gate.
