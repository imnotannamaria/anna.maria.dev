/**
 * Seeds roadmap_items with everything that was in ROADMAP.md, verbatim, plus the three
 * things already shipped that the board should open with.
 *
 *   npm run seed:roadmap
 *
 * This is the migration: ROADMAP.md is deleted once these rows exist, so the file's whole
 * contents have to survive here first. Safe to re-run — it skips slugs that already exist
 * and never deletes anything. Run docs/sql/003-roadmap-items.sql first.
 *
 * No shipped_at on the done items. The dates are not written down anywhere, and inventing
 * three plausible ones is worse than leaving a column blank for Anna to fill in.
 */
import { readFileSync } from "node:fs"
import { createDb } from "../lib/db/client"
import { roadmapItems } from "../lib/roadmap/schema"
import { slugify } from "../lib/slug"
import type { RoadmapStatus } from "../lib/roadmap/validation"

type Seed = {
  title: string
  blurb: string
  status: RoadmapStatus
  planUrl?: string
}

// Straight from ROADMAP.md, one item per `##` heading, prose unchanged.
const SEEDS: Seed[] = [
  {
    title: "Home components",
    blurb:
      "Some of the components are dull. I want to make them better. First one up: the experience card becomes a browsable file tree of the site.",
    status: "doing",
    planUrl: "docs/tree-plan.md",
  },
  {
    title: "Roadmap component",
    blurb:
      "A card that reads this file and shows the items as a checklist, ticking off what's done. I don't know yet where it goes — home, about, or its own page.",
    status: "doing",
    planUrl: "docs/roadmap-component-plan.md",
  },
  {
    title: "Give the sidebar a job",
    blurb:
      "Right now it repeats the titlebar tabs, so it's two navigations for one set of pages. I'd rather it held the things that don't belong in a page: comments, the roadmap. Something like tabs sticking out of the edge — hover one and a panel slides out with what's inside.",
    status: "doing",
    planUrl: "docs/roadmap-component-plan.md",
  },

  {
    title: "Animations",
    blurb:
      "I want to add animations to the home page widgets so the site feels more alive. Something with a wow effect.",
    status: "todo",
  },
  {
    title: "A cursor of my own",
    blurb:
      "Replace the system arrow with something that belongs to the site — a small mark that reacts to what it's over, grows on a link, maybe leaves a short trail. I don't know how it's built yet.",
    status: "todo",
  },
  {
    title: "A state for every card",
    blurb:
      "Some of the cards read the database, so the page can be fine while one card has nothing. Each of those wants its own skeleton while it loads and its own error state when the query fails — a card that broke should say it broke, not sit there looking empty. Right now the home page has neither.",
    status: "todo",
  },
  {
    title: "Posts and (or) projects as a feed",
    blurb:
      "List them the way a social feed does, instead of as a list of links. One item per card, in one column, newest first. Maybe both in the same feed.",
    status: "todo",
  },
  {
    title: "Rewrite the contributions graph",
    blurb:
      "It's react-github-calendar today. I want to drop the library and build it from the GitHub API myself, so the squares are mine to style and animate.",
    status: "todo",
  },
  {
    title: "Contributions page",
    blurb:
      "A page for my open source work, built after I start contributing to projects that aren't mine. An empty page would be worse than no page at all.",
    status: "todo",
  },
  {
    title: "Comments",
    blurb:
      "Let anyone leave a comment about the site without signing in, and show them somewhere. Every new one emails me. Same open-form problem as tipfy, so it needs the same protection. What I want is the Figma version of it: point at a card or a section, drop a pin on it, write there. The comment belongs to that thing instead of to a form at the bottom of the page, and the pins stay on screen as a trace of what people stopped on.",
    status: "todo",
  },
  {
    title: "tipfy",
    blurb:
      "tipfy is where people recommend music to me. It needs a refactor: email me on each recommendation, move it to Supabase, and protect the form.",
    status: "todo",
  },
  {
    title: "Link tipfy from /log",
    blurb: "One line in the /log header. Blocked on the tipfy refactor.",
    status: "todo",
  },
  {
    title: "Make the easter egg do something",
    blurb:
      "showEasterEgg in the titlebar fires a toast and that's it. Whatever it turns into, a toast isn't a reward. I don't know what the feature is yet.",
    status: "todo",
  },
  {
    title: "Better favicon",
    blurb: "The current one is too simple. I want to sit down, study a bit, and make a better one.",
    status: "todo",
  },

  {
    title: "/log",
    blurb:
      "One feed for everything I finish: films, series, books, albums, podcasts, games. Catalog cards, drawn star ratings, filter pills that survive the server render.",
    status: "done",
    planUrl: "docs/log-plan.md",
  },
  {
    title: "wristkit activity card",
    blurb:
      "The Apple Watch rings on the home page, fed by a Shortcut that pushes the day's numbers into Postgres.",
    status: "done",
  },
  {
    title: "Admin behind AuthKit",
    blurb:
      "CRUD for the log behind WorkOS plus an email allowlist checked at the route, not only in the proxy matcher. Anyone else gets a 404.",
    status: "done",
  },
]

/** Standalone script, so next's env loading isn't available. Read .env.local by hand. */
function loadEnv() {
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "")
    }
  } catch {
    // No .env.local is fine if the vars are already exported.
  }
}

async function main() {
  loadEnv()

  const url = process.env.DATABASE_URL ?? process.env.WRISTKIT_DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")

  const { db, sql } = createDb(url)

  const existing = new Set(
    (await db.select({ slug: roadmapItems.slug }).from(roadmapItems)).map((r) => r.slug),
  )

  // position counts up per column, so the seeded order is the order they were written in
  // rather than whatever the insert happens to return.
  const seen: Record<string, number> = {}

  const rows = SEEDS.map((s) => {
    const position = (seen[s.status] = (seen[s.status] ?? -1) + 1)
    return {
      slug: slugify(s.title),
      title: s.title,
      blurb: s.blurb,
      status: s.status,
      position,
      planUrl: s.planUrl ?? null,
      shippedAt: null,
    }
  }).filter((r) => !existing.has(r.slug))

  if (rows.length === 0) {
    console.log(`nothing to insert, all ${SEEDS.length} slugs are already there`)
  } else {
    await db.insert(roadmapItems).values(rows)
    console.log(`inserted ${rows.length} items`)
    for (const r of rows) console.log(`  ${r.status.padEnd(5)} ${r.slug}`)
  }

  if (existing.size > 0) console.log(`skipped ${SEEDS.length - rows.length} already present`)

  await sql.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
