# The tree — implementation plan

Replace the experience card on the home page with a file tree of the site itself. Folders
open and close, files are links to the real routes, and the counts beside them come from
the same sources the pages do, so the tree can't tell you there are twelve blog posts
when there are fourteen.

This is the first piece of the **Home components** and **Animations** items in
the roadmap (`/roadmap`, edited in `/admin/roadmap`).

---

## Why

The experience card was a number and a row of dots. It said "five years shipping" next to
a hero paragraph that already said "five years shipping web products", and the timeline
dots didn't do anything except glow. Two hundred lines of JSX for a fact stated twice.

A file tree earns the space. It's the editor metaphor the whole site is built on, applied
to the thing the site is actually made of, and it gives someone landing on `/` a way to
see the shape of the place before deciding where to click. It also solves a real problem:
`/piano` and `/log` are only reachable from the sidebar icons, which nobody reads on the
first visit.

Nothing about experience is lost. The hero paragraph carries the years, and the `$ whoami`
section header carries `uptime · N years`. Both already exist.

---

## What we decided

| Topic       | Choice                                                             |
| ----------- | ------------------------------------------------------------------ |
| Content     | The site's own routes: a browsable sitemap, not a list of repos    |
| Data        | Hand-written tree in `lib/site-tree.ts`, counts injected at render |
| Interaction | Folders expand in place, files navigate                            |
| Slot        | Replaces the experience card, same `1fr` column beside the hero    |
| Animation   | Height + stagger on expand, via Motion                             |

### Why hand-written and not derived

Walking the App Router and velite to build the tree automatically sounds nice until you
ask it questions it can't answer. Should `/admin` show up? What order do the branches go
in? Does `blog/[slug]` become a folder or does it disappear? Every one of those is an
editorial call, and a derived tree would need a config file to override it, which is the
hand-written tree again, plus a walker.

So: the shape is a typed array, the numbers are live. The tree going stale means a new
page was added and nobody added the node, and that's a one-line fix in a file that sits
next to the component.

### Why not a preview panel

The card is roughly 300px wide on a phone once the 56px sidebar takes its cut. A tree and
a detail panel side by side doesn't fit, and building a layout that collapses to a
different interaction on mobile means designing two components. The file name plus its
count is enough. The route itself is the detail view.

---

## Data model

`lib/site-tree.ts`:

```ts
export type TreeNode = {
  /** Rendered label. Folders end in "/", files carry an extension. */
  name: string
  kind: "folder" | "file"
  /** Internal route. Folders may have one too; /blog is both. */
  href?: string
  /** Small mono number on the right. Resolved at render, see below. */
  countKey?: "posts" | "projects" | "log"
  /** Rendered dimmed with a lock glyph. No href, not focusable as a link. */
  locked?: boolean
  children?: TreeNode[]
  /** Folders start open when true. */
  defaultOpen?: boolean
}
```

The tree, roughly:

```
v anna.maria.dev/
    about.md
  > blog/          {posts}
  > projects/      {projects}
    log.tsx        {log}
    piano.tsx
    contact.tsx
```

with `blog/` and `projects/` expanding into their three or four most recent entries, plus
a `… all N →` row at the end that links to the index page. The root folder is
`defaultOpen`, the two content folders are not, so the card opens at seven visible rows
and grows from there.

Counts don't live in the config. `SITE_TREE` is a plain data structure with `countKey`
strings, and `app/page.tsx` passes a `counts` record into the component:

```tsx
<TreeCard
  counts={{ posts: posts.length, projects: projects.length, log: logEntries.length }}
  recentPosts={posts.slice(0, 3)}
  recentProjects={projects.slice(0, 3)}
/>
```

Keeping the config free of function calls matters: it stays importable from anywhere
without dragging velite and a database client along with it.

### Where the numbers come from

`app/page.tsx` already fetches all three. `getPublishedPosts()` and
`getPublishedProjects()` are synchronous velite reads, and `logEntries` is the array
already awaited for `LatestLogCard`. No new query, no `GROUP BY` beside a query that
returns the same rows. The counts are `.length` on arrays that are in memory anyway.

`getPublishedEntries()` is already wrapped in `.catch(() => [])` on that page, so a
database blip renders the log row with no count rather than taking the home page down.
The row still links to `/log`, which has its own error boundary.

---

## Components

Two files under `components/home/`:

**`tree-card.tsx`** — `"use client"`. Owns the open/closed set, renders the card
chrome (`CardHead label="tree"`, footer comment, the `N routes` meta), maps the tree.

**`tree-node.tsx`** — one row, recursive. A folder renders a `<button>`, a file
renders a `<Link>`, a locked node renders a `<span>`.

Open state is a `Set<string>` of node paths (`"blog/"`, `"projects/"`), seeded from
`defaultOpen`. Paths, not names, so two folders can share a leaf name later without
opening together.

### Markup and semantics

The tempting thing is `role="tree"` with `role="treeitem"` and roving tabindex. It's the
wrong call here. A full ARIA tree owes the user arrow-key navigation, type-ahead, and
Home/End, and a half-implemented tree widget is worse for a screen reader than no widget
at all — it announces "tree, 7 items" and then the arrow keys do nothing.

So this is a nested list of real controls:

```html
<ul>
  <li>
    <button aria-expanded="false" aria-controls="wb-blog">blog/ <span>12</span></button>
    <ul id="tree-blog" hidden>
      …
    </ul>
  </li>
  <li><a href="/piano">piano.tsx</a></li>
</ul>
```

Tab moves through it, Enter and Space work because they're real buttons and links, and
`aria-expanded` says what the chevron means. The indentation is `padding-left`, and the
guide lines are `border-left` on the nested `<ul>`. All of it is decoration, so
`aria-hidden` on the folder/file glyphs and the chevron.

Counts get a hidden label: `<span className="sr-only"> posts</span>` after the number, so
"blog slash, 12" becomes "blog slash, 12 posts". Locked rows carry
`<span className="sr-only">not published yet</span>`, since the lock glyph is decoration.

Every row needs a real hit target. `min-height: 32px` on the row, full-width so the click
area is the whole line rather than the text.

---

## Animation

This is the part the roadmap actually asked for, so it gets more than a `transition-all`.

**Expand.** Motion's `animate={{ height: "auto" }}` with `AnimatePresence`, `overflow:
hidden` on the wrapper. 220ms on the way in with `--ease-out`'s curve
(`cubic-bezier(0.2, 0.8, 0.2, 1)`), 160ms on the way out. Exits shorter than enters —
a closing folder shouldn't make you wait.

**Children stagger.** The rows inside a folder come in at `opacity: 0, x: -4` with a 20ms
stagger, capped at about six children so a long list doesn't turn into a slow reveal. Only
`transform` and `opacity`, both GPU-composited. Height is the one non-composited property
here and it's unavoidable for this effect; it's animating on a container of at most a few
hundred pixels, so it's fine.

**Chevron.** `rotate: -90deg → 0`, 200ms, CSS only. No Motion needed for a rotation.

**Hover.** The row background goes to `--bg-surface-elevated` and the label to
`--fg-brand` over 150ms. The folder glyph shifts 1px right. Small on purpose: this is a
list, not a card, and a lift on every row would make the card twitch.

**Reduced motion.** `app/globals.css` already zeroes out CSS animations and transitions
globally under `prefers-reduced-motion: reduce`, but that block does nothing to Motion,
which animates via JS. So `useReducedMotion()` in the card, and when it returns true the
`AnimatePresence` block collapses to an instant show/hide: no height animation, no
stagger, `duration: 0`. The state change still happens, it just happens at once.

---

## Theming and tokens

Every color comes from a token. In particular:

- Folder glyphs and the active chevron: `var(--fg-brand)`
- Guide lines: `var(--border-subtle)`
- File names: `var(--fg-secondary)`, `--fg-primary` on hover
- Locked rows: `var(--fg-muted)` at reduced opacity
- Counts: `var(--fg-muted)`

No text sits on top of `--fg-brand` anywhere in this component, which sidesteps the
contrast problem that bites the marmalade theme. If a "current page" pill on a brand fill
gets added later, that's the moment to check white-on-orange.

---

## Responsive

At 375px the sidebar takes 56px and the page padding takes 32px, leaving about 287px of
card. Three levels of nesting at 16px per level is 48px of indent, which is survivable,
but the longest label plus a count has to fit in what's left.

- Indent step drops from 16px to 12px below `sm`.
- File names get `truncate` with the full name in `title`. Blog post titles are the long
  ones and they will need it.
- The count column is `flex-shrink-0` and right-aligned, so truncation eats the name and
  never the number.
- Card is `max-height: 420px` with `overflow-y: auto` and the themed scrollbar from
  globals, so opening both content folders scrolls inside the card instead of blowing the
  grid row height and dragging the hero card taller with it.

The visual pass at 375px is Anna's, in the device toolbar. Chrome won't resize a window
below ~550px, so this can't be checked by dragging.

---

## SEO

The tree is a client component with interactive state, and the instinct is to worry about
whether Google sees it. It does: this is state, not data fetching. React renders the
initial open/closed state on the server, so the root folder's children — including every
`href` — are in the server HTML. Collapsed folders render their children too, into a list
that carries `inert` and an inline `height: 0`.

`inert` rather than `hidden`, which is what this section originally said. `hidden` would
have fought the height animation for control of the same box, and it isn't needed: `inert`
already takes the collapsed rows out of the tab order and away from a screen reader, and
the clipping is `overflow: hidden` on `.tree-children`. Both attributes keep the children in
the DOM, which is the part that matters — unmounting them would take the hrefs out of the
markup and leave the animation nothing to measure.

Verified against the built output rather than assumed:

```
<ul id="tree-…-blog-" class="tree-children" inert="" style="height:0px;opacity:0">
  <a class="tree-row" href="/blog/spreadsheets-arent-the-problem">…
```

Every link in the tree already exists in `sitemap.xml`. Nothing to add there.

---

## Phases

**1. Data.** `lib/site-tree.ts` with the type and the tree. No component yet. This is
the file to get opinions about, since it's where the editorial calls live.

**2. Static render.** Both components, everything expanded, no animation, no state.
Semantics and tokens correct from the start. At the end of this phase the card is in the
grid slot and the experience card is deleted.

**3. Interaction.** Open/closed state, `aria-expanded`, keyboard, hover styles.

**4. Animation.** Motion, height, stagger, chevron, `useReducedMotion`.

**5. Wiring.** Counts and recent entries from `app/page.tsx`. Confirm the log count
still degrades cleanly with the database unreachable. `next build` has to pass with
`DATABASE_URL` unset.

**6. Checks.** `npm run lint`, `npx tsc --noEmit`, then hand it to Anna for the visual
pass at 375px and across all six themes.

---

## Settled while building

- **Three children per content folder**, then a `… N more` row that links to the index.
  With four posts and four projects on the site today that means one truncated row each,
  which is enough to show what the overflow looks like without the card becoming a second
  copy of `/blog`.
- **No locked nodes in v1.** The honest equivalent here is a draft post, and putting
  drafts on the home page is a strange thing to do. The field stays on the type and the
  rendering branch stays in the component, because a `contributions/` folder marked locked
  is exactly how the roadmap's contributions page announces itself before it exists.
- **`/admin` is not in the tree.** It's noindexed and 404s for everyone else. Listing it
  tells people it's there and buys nothing.
- **It's called `tree`, not `workbench` or `worktree`.** On a dev portfolio "worktree"
  reads as the git concept, which this isn't, and "workbench" says nothing about what's
  in the card. `tree` is the unix command, which is exactly what this shows.
- **The card is absolutely positioned inside a stretched wrapper on `md+`.** The plan
  assumed a `max-height` would be enough. It isn't: a grid row is sized by its tallest
  item's content, so expanding every folder made the tree the tallest thing in the row,
  the hero card stretched to match, and the result was a column of dead space under the
  hero's buttons. `max-height` on the card doesn't help, because the row is already the
  wrong height by the time the card clips. Taking the card out of the row's height
  calculation is the only fix that keeps the hero in charge of the row. Below `md` there
  is no row to fight over, so it's a normal block with a cap.
- **The log count is `number | null`, not `number`.** With the database unreachable
  `logEntries` is `[]`, and rendering `0` there would state something false — "no entries"
  and "couldn't ask" are different claims. `null` means the row renders as a plain link
  with no number, which is what it does under a bogus `DATABASE_URL`.
- **`/admin` in the tree?** No. It's noindexed and 404s for everyone else; putting it in
  the tree tells people it's there for no benefit.
