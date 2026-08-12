# Contributions graph — implementation plan

The roadmap item: _"It's react-github-calendar today. I want to drop the library and build it from
the GitHub API myself, so the squares are mine to style and animate."_

The visual half is already done and committed on `feat/contributions-widget`, on a throwaway route
at `/dev/contributions`. This plan is the **data half**, plus moving the component into the real
tree and taking the library out.

Read the whole document before starting. Every phase ends with checks that must pass before the
next one begins.

---

## Where things stand

| Thing                                              | State                                                    |
| -------------------------------------------------- | -------------------------------------------------------- |
| `app/dev/contributions/contributions-calendar.tsx` | The grid. Done. Fetches its own data on the client       |
| `app/dev/contributions/use-contributions.ts`       | Client fetch against a third-party API. **Gets deleted** |
| `app/dev/contributions/contributions-card.tsx`     | A copy of `GithubCard`'s frame. **Gets deleted**         |
| `app/dev/contributions/page.tsx`                   | The discovery route. **Gets deleted**                    |
| `components/about/github-calendar.tsx`             | Wraps `react-github-calendar`. **Gets replaced**         |
| `components/home/github-card.tsx`                  | The card frame. Stays, loses its `dynamic(ssr: false)`   |

The discovery component fetches from `github-contributions-api.jogruber.de` — which is **the exact
endpoint `react-github-calendar` already called** (verified in `node_modules`). So today the branch
has replaced the drawing and not the data. That is what this plan fixes.

---

## What we decided

| Question           | Decision                                                                        |
| ------------------ | ------------------------------------------------------------------------------- |
| Source             | GitHub's own GraphQL API, `https://api.github.com/graphql`, with a PAT          |
| Where it runs      | Server only. The token never reaches the browser                                |
| Caching            | `next: { revalidate: 3600 }` on the fetch, **not** on the page                  |
| Data flow          | Server page → `GithubCard` props → calendar props. No client fetch at all       |
| Token missing/down | The card renders a quiet empty state. It never throws and never fails the build |
| Narrow card        | The grid scrolls horizontally below ~845px. Not changed in this work            |

### Decisions made without asking, and why

**Caching sits on the fetch, not the page.** `/` is `force-dynamic` because it reads Postgres, and
the Conventions section in `CLAUDE.md` is deliberate about that. Putting `revalidate` on the page
would fight it. `next: { revalidate: 3600 }` on the `fetch` call is orthogonal: `/` stays dynamic
for its database reads while the GitHub call is made at most once an hour. `/about` is static and
the same fetch turns it into ISR on the same hour, which is what we want there too.

Contributions are not live data in the way the wristkit rings are — a square that appears an hour
late is not a worse experience, and an uncached call on a `force-dynamic` page would mean a GitHub
round trip on every single home page render.

**The component receives data, it does not fetch.** This is what puts the grid in the server HTML.
The current implementation is `dynamic(ssr: false)` plus a `mounted` guard, so what a crawler reads
today is a skeleton — the SEO check in `CLAUDE.md` is explicit that content has to be in the served
HTML, and this is the change that satisfies it.

**The theme observer goes away entirely.** The old component ran a `MutationObserver` on
`data-mode` to hand the library a `colorScheme`. The new grid gets its colours from CSS custom
properties, so light and dark are handled by the cascade with no JavaScript. Delete the state, the
effect and the observer — do not port them.

---

## Phase 1 — the data layer

**Goal:** a server-only module that returns a year of contributions, or `null`.

### 1.1 Environment

Add to `.env.local` (and to Vercel's project settings for production):

```bash
# GitHub GraphQL, for the contributions grid. Classic PAT, `read:user` scope.
# Public contribution data needs authentication but no special permissions.
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

**It must not be `NEXT_PUBLIC_`.** Anything with that prefix is inlined into the client bundle.

### 1.2 Create `lib/github/contributions.ts`

```ts
import "server-only"

export type ContributionLevel = 0 | 1 | 2 | 3 | 4
export type ContributionDay = { date: string; count: number; level: ContributionLevel }
export type ContributionWeek = ContributionDay[]
export type ContributionYear = { weeks: ContributionWeek[]; total: number }

/** A padding cell: a real day carries a date, these only square off the grid. */
const EMPTY: ContributionDay = { date: "", count: 0, level: 0 }

const LEVELS: Record<string, ContributionLevel> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
}

// No from/to: contributionsCollection defaults to the last twelve months, which
// is exactly the range we want. Passing dates would mean computing them on the
// server and is a timezone trap for no gain.
const QUERY = `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`

/**
 * A year of public contributions, or null when it cannot be had.
 *
 * Null rather than a throw: this feeds a card on two pages, and neither should
 * fail to render because a token is missing locally or GitHub is having a
 * moment. The card owns the empty state.
 */
export async function getContributions(login: string): Promise<ContributionYear | null> {
  const token = process.env.GITHUB_TOKEN
  if (!token) return null

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables: { login } }),
      next: { revalidate: 3600 },
    })

    if (!res.ok) return null

    const json = await res.json()
    const calendar = json?.data?.user?.contributionsCollection?.contributionCalendar
    if (!calendar?.weeks?.length) return null

    const weeks: ContributionWeek[] = calendar.weeks.map(
      (week: { contributionDays: unknown[] }, i: number) => {
        const days: ContributionDay[] = week.contributionDays.map((d) => {
          const day = d as { date: string; contributionCount: number; contributionLevel: string }
          return {
            date: day.date,
            count: day.contributionCount,
            level: LEVELS[day.contributionLevel] ?? 0,
          }
        })

        if (days.length === 7) return days

        // GitHub truncates the first week at its start and the last at its end,
        // so the padding goes on opposite sides. Every column ends up seven
        // cells, which is what lets the grid be a plain flex row of columns.
        const pad = Array.from({ length: 7 - days.length }, () => EMPTY)
        return i === 0 ? [...pad, ...days] : [...days, ...pad]
      },
    )

    return { weeks, total: calendar.totalContributions }
  } catch {
    // Never surface the reason: it would carry the request, and a stack in a
    // response is the thing the security check exists to prevent.
    return null
  }
}
```

> If `import "server-only"` fails to resolve, run `npm i -D server-only`. If you would rather not
> add it, delete that line — the guarantee then rests on this file only ever being imported by
> server components, which Phase 3 keeps true.

### Phase 1 checks

| Check                                                                   | Expected            |
| ----------------------------------------------------------------------- | ------------------- |
| `npx tsc --noEmit`                                                      | no output           |
| `npm run lint`                                                          | passes              |
| `grep -rn "NEXT_PUBLIC_GITHUB" .` (excluding `node_modules`)            | no matches          |
| Token present in `.env.local`, `npm run dev`, then the smoke test below | prints a real total |

Smoke test — put this in a scratch file, run it with `npx tsx`, then delete it:

```ts
import { getContributions } from "./lib/github/contributions"
getContributions("imnotannamaria").then((r) => console.log(r?.total, r?.weeks.length))
```

Expect a number in the hundreds and `53` (or `52`) weeks. If it prints `null`, the token is wrong
or missing — fix that before moving on, because every later phase will look broken for this reason.

---

## Phase 2 — the calendar moves into the tree

**Goal:** `components/about/github-calendar.tsx` becomes the discovery component, taking data as
props instead of fetching.

### 2.1 Replace the file

Copy `app/dev/contributions/contributions-calendar.tsx` over
`components/about/github-calendar.tsx` and make exactly these changes:

1. Change the import of the types to the new server module:

   ```ts
   import type { ContributionWeek, ContributionYear } from "@/lib/github/contributions"
   ```

   Importing a **type** from a `server-only` file is safe — types are erased at build.

2. Delete the `useContributions` call and take props instead:

   ```ts
   export function GithubCalendar({ data }: { data: ContributionYear | null }) {
     const reduce = useReducedMotion() ?? false
     const [hover, setHover] = useState<Hover>(null)
     const weeks = data?.weeks ?? []
     const total = data?.total ?? null
   ```

3. Delete the `loading` branch and the skeleton grid entirely. There is no loading state any more —
   the data arrives with the HTML.

4. Replace the `error` branch with an empty state on `!data`:

   ```tsx
   if (!data) {
     return (
       <p className="font-mono text-[12px]" style={{ color: "var(--fg-muted)" }}>
         contributions unavailable
       </p>
     )
   }
   ```

5. Keep the export name `GithubCalendar` (it is what `GithubCard` imports).

Everything else — the ring, the tooltip, the month labels, the legend, `MIN_COL`, `GAP`, `RING`,
the memoized `Column`, the delegated `onPointerMove` — is unchanged. **Do not re-tune the visuals.**
They were settled in discovery and every constant in that file was paid for:

- `MIN_COL = 13` is the floor that keeps squares chunky; below it the grid scrolls.
- `RING = 2` and the matching padding on the scroll container are what stop the hover ring being
  clipped on the first column, the last column and the top row.
- `tipBelow = hover.day <= 2` flips the tooltip for the top rows so it is not cut off.
- Dates are formatted from the string parts, never through `new Date(...).toLocaleDateString()`.

### 2.2 Delete the hook

`rm app/dev/contributions/use-contributions.ts` — its types now live in the server module.

### Phase 2 checks

| Check                                                                        | Expected   |
| ---------------------------------------------------------------------------- | ---------- |
| `npx tsc --noEmit`                                                           | no output  |
| `npm run lint`                                                               | passes     |
| `grep -n "useContributions\|jogruber" components/ app/ lib/ -r`              | no matches |
| `grep -n "useEffect\|MutationObserver" components/about/github-calendar.tsx` | no matches |

That last one is the point of the phase: the component no longer has a lifecycle, it has props.

---

## Phase 3 — wiring the pages

**Goal:** both pages fetch on the server and hand the data down.

### 3.1 `components/home/github-card.tsx`

- Remove the `dynamic(...)` import and the `GithubCalendarInner` constant. Import `GithubCalendar`
  directly.
- Remove the `Skeleton` import if nothing else uses it in the file.
- Add the prop and pass it through:

  ```tsx
  export function GithubCard({ username, data }: { username: string; data: ContributionYear | null }) {
  ```

  ```tsx
  <GithubCalendar data={data} />
  ```

- Delete the paragraph in the file's doc comment that says the calendar is _"still
  `react-github-calendar` and still due a rewrite — see the roadmap."_ It stops being true here.

The card stays a client component: `useSpotlight` and `useReveal` need it. Only the **data** moved
to the server, not the frame.

### 3.2 The two pages

Both `app/(home)/page.tsx` and `app/about/page.tsx` are server components. In each:

```tsx
import { siteConfig } from "@/lib/site-config"
import { getContributions } from "@/lib/github/contributions"

// inside the async page component, before the return:
const contributions = await getContributions(siteConfig.githubUser)
```

and change the render site — `app/(home)/page.tsx:263` and `app/about/page.tsx:515`, both currently
`<GithubCard username="imnotannamaria" />` — to:

```tsx
<GithubCard username={siteConfig.githubUser} data={contributions} />
```

`lib/site-config.ts:8` already holds `githubUser: "imnotannamaria"`, and it is the file `CLAUDE.md`
calls the single source of identity. The literal is currently spelled out in both pages; this work
is touching both lines anyway, so replace them rather than adding a third copy.

### Phase 3 checks

| Check                                                                    | Expected              |
| ------------------------------------------------------------------------ | --------------------- |
| `npx tsc --noEmit`                                                       | no output             |
| `npm run lint`                                                           | passes                |
| `curl -s localhost:3000/about \| grep -c 'role="img"'`                   | `1` or more           |
| `curl -s localhost:3000/about \| grep -o 'contributions on GitHub[^"]*'` | prints the aria-label |
| `curl -s localhost:3000/ \| grep -c 'role="img"'`                        | `1` or more           |

**Those curl checks are the SEO acceptance criterion for this whole plan.** They are what proves
the grid is in the served HTML rather than behind a client fetch. If they print `0`, something is
still rendering on the client and the phase is not done.

---

## Phase 4 — the library goes

```bash
npm uninstall react-github-calendar
rm -rf app/dev
```

Then confirm nothing references either:

```bash
grep -rn "react-github-calendar\|react-activity-calendar\|app/dev" . \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git
```

The only surviving mention should be in this document and in the commit history.

### Phase 4 checks

| Check                                          | Expected                          |
| ---------------------------------------------- | --------------------------------- |
| `grep -n "react-github-calendar" package.json` | no match                          |
| `npm run build`                                | succeeds                          |
| `grep -rl "ghp_" .next/static 2>/dev/null`     | no output — the token never ships |

---

## Phase 5 — the review pass

Go through this against the diff. These are the `CLAUDE.md` code-review headings, narrowed to what
this change actually touches.

### Security

- [ ] `GITHUB_TOKEN` is read only in `lib/github/contributions.ts`, only on the server.
- [ ] No `NEXT_PUBLIC_` prefix anywhere near it.
- [ ] The `catch` returns `null` and never puts the error, the URL or a stack into a response.
- [ ] `grep -rl "ghp_" .next/static` is empty after a build.

### Performance

- [ ] The GitHub call is cached — `next: { revalidate: 3600 }` is present. Without it, `/` makes a
      GitHub round trip on every request, because it is `force-dynamic`.
- [ ] `Column` is still wrapped in `memo`, and `onPointerMove` is still a `useCallback` with an
      empty dependency array. Together they are what keeps a pointer sweep from re-rendering all
      371 cells — break either and the memo is decorative.
- [ ] Hover styling is driven by the same state the tooltip needs, not by a second mechanism.
- [ ] No `<img>` was introduced, so the lazy-loading and CLS rules do not apply here.

### Accessibility

- [ ] The grid keeps `role="img"` with an `aria-label` that includes the total.
- [ ] The tooltip stays `aria-hidden` — it duplicates information the label already carries.
- [ ] The legend stays `aria-hidden`; "less/more" plus swatches is decoration, and the total is in
      real text beside it.
- [ ] Nothing puts text on top of `--fg-brand`. The tooltip is `--bg-surface` with `--fg-primary`,
      which is why it stays legible on marmalade, where white-on-brand fails first.
- [ ] `useReducedMotion()` still gates the entrance, the tooltip and the ring transition.

**The one conscious gap:** per-day detail is hover-only. The alternative is 371 focus stops, which
would be worse for keyboard users than the summary they get from the `aria-label`. If this is ever
revisited, the fix is a visually-hidden monthly summary, not making every cell tabbable — write
that down rather than quietly adding `tabIndex`.

### Responsive

- [ ] The scroll lives on the grid's own container, so the **page** never scrolls sideways.
- [ ] Do the arithmetic rather than guessing: at 375px, minus the 56px sidebar, minus 2×20px card
      padding, the card's content box is ~279px. The grid's `minWidth` is `53 × 13 + 52 × 3 = 845`,
      so it scrolls — which is intended, and is why the floor exists.
- [ ] The month labels share the same track widths as the grid, so they cannot drift out of
      alignment when it scrolls.
- [ ] **Hand the visual pass to Anna. Do not drive a browser, headless or otherwise.**

### SEO

- [ ] The Phase 3 curl checks pass.
- [ ] No `dynamic(ssr: false)` remains around the calendar.
- [ ] No animation gates mount on a timer, and no text is grown from a sliced string.

### Theme reactivity

- [ ] `grep -n "#[0-9a-fA-F]\{3,6\}" components/about/github-calendar.tsx` returns nothing. Every
      colour is `--fg-brand`, `--fg-brand-hover`, `--bg-surface`, `--fg-primary`, `--fg-muted` or a
      `color-mix()` of them.

### Motion

- [ ] The entrance is `whileInView` with `once: true` — not `animate`.
- [ ] The trigger is on the grid container, which has an honest box. The cells start at a scale of
      `0.4`, and an observer aimed at one of those would be asking for a fraction of almost nothing.
- [ ] The stagger delay lives on the entrance transition only, never on a hover transition.

### Reuse and standardization

- [ ] `GithubCard` still uses `.bento-card`, `CardHead`, `CardFoot`, `ArrowLink`, `Spotlight` and
      `useReveal`. Nothing hand-rolls a surface, a header or a hover.
- [ ] `app/dev/contributions/contributions-card.tsx` was a **second copy** of that frame, which is
      why Phase 4 deletes the whole directory. Do not leave it behind as a reference.

---

## Phase 6 — docs and the board

- [ ] `CLAUDE.md`, Environment variables section: add `GITHUB_TOKEN` with a one-line note that it is
      optional and that without it the contributions card shows an empty state.
- [ ] `CLAUDE.md`, Stack table: the Icons/analytics rows are unaffected, but if
      `react-github-calendar` is named anywhere, remove it.
- [ ] `README.md`: same env var note, if it lists environment variables.
- [ ] Move the roadmap item to **shipped** at `/admin/roadmap`, and set its `plan` field to
      `docs/contributions-plan.md`.

---

## Final verification

Run all four, in this order, and report the actual output rather than a summary:

```bash
npx tsc --noEmit
npm run lint
npm run build
curl -s localhost:3000/about | grep -c 'role="img"'
```

Then stop and hand the visual pass to Anna: light and dark, the six themes (marmalade is where
contrast fails first), the home bento card, `/about`, and 375px on a real device toolbar.

---

## What this plan deliberately does not do

- **It does not change how the grid looks.** That was settled in discovery.
- **It does not make the bento card show fewer weeks.** The narrow card scrolls. If that turns out
  to be annoying in use, the fix is a `weeks` prop capping the range for the home card — a separate,
  small piece of work, and a product decision rather than a technical one.
- **It does not add a `/dev` route back.** The discovery route was scaffolding and Phase 4 removes
  it; the commit that introduced it is the record.
