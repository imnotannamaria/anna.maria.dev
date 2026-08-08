/**
 * Seeds log_entries with the 14 sample entries from docs/log-design.html, so the UI can be
 * built against real-shaped data before the admin exists.
 *
 *   npm run seed:log
 *
 * Safe to re-run: it skips slugs that already exist. It never deletes anything.
 * Run docs/sql/001-log-entries.sql first.
 */
import { readFileSync } from "node:fs"
import { createDb } from "../lib/db/client"
import { logEntries } from "../lib/log/schema"
import { slugify } from "../lib/log/slug"
import type { LogType } from "../lib/log/validation"

type Seed = {
  type: LogType
  title: string
  creator: string
  year: number
  rating: number
  favorite: boolean
  loggedAt: string
  note?: string
}

// Straight from the `entries` array in the design file.
const SEEDS: Seed[] = [
  {
    type: "film",
    title: "Perfect Days",
    creator: "Wim Wenders",
    year: 2023,
    rating: 4.5,
    favorite: true,
    loggedAt: "2026-07-28",
    note: "A film about noticing things. Almost no plot and I did not miss it once.",
  },
  {
    type: "book",
    title: "The Pragmatic Programmer",
    creator: "Hunt & Thomas",
    year: 1999,
    rating: 5,
    favorite: true,
    loggedAt: "2026-07-20",
  },
  {
    type: "series",
    title: "Severance — S2",
    creator: "Dan Erickson",
    year: 2025,
    rating: 5,
    favorite: true,
    loggedAt: "2026-07-15",
  },
  {
    type: "music",
    title: "In Rainbows",
    creator: "Radiohead",
    year: 2007,
    rating: 5,
    favorite: true,
    loggedAt: "2026-07-10",
  },
  {
    type: "game",
    title: "Outer Wilds",
    creator: "Mobius Digital",
    year: 2019,
    rating: 5,
    favorite: true,
    loggedAt: "2026-06-30",
    note: "The rare game you can only play once. Knowing the solution is the solution.",
  },
  {
    type: "film",
    title: "Dune: Part Two",
    creator: "Denis Villeneuve",
    year: 2024,
    rating: 4,
    favorite: false,
    loggedAt: "2026-06-22",
  },
  {
    type: "book",
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    creator: "Gabrielle Zevin",
    year: 2022,
    rating: 4.5,
    favorite: true,
    loggedAt: "2026-06-14",
  },
  {
    type: "podcast",
    title: "Lex Fridman — #400",
    creator: "Lex Fridman",
    year: 2024,
    rating: 3.5,
    favorite: false,
    loggedAt: "2026-06-05",
  },
  {
    type: "series",
    title: "The Bear — S3",
    creator: "Christopher Storer",
    year: 2024,
    rating: 4,
    favorite: false,
    loggedAt: "2026-05-28",
  },
  {
    type: "music",
    title: "Blonde",
    creator: "Frank Ocean",
    year: 2016,
    rating: 5,
    favorite: false,
    loggedAt: "2026-05-19",
  },
  {
    type: "game",
    title: "Hades II",
    creator: "Supergiant Games",
    year: 2025,
    rating: 4.5,
    favorite: true,
    loggedAt: "2026-05-08",
  },
  {
    type: "book",
    title: "Project Hail Mary",
    creator: "Andy Weir",
    year: 2021,
    rating: 4,
    favorite: false,
    loggedAt: "2026-04-27",
  },
  {
    type: "film",
    title: "Past Lives",
    creator: "Celine Song",
    year: 2023,
    rating: 4.5,
    favorite: true,
    loggedAt: "2026-04-15",
  },
  {
    type: "podcast",
    title: "Darknet Diaries — Pandora",
    creator: "Jack Rhysider",
    year: 2024,
    rating: 4,
    favorite: false,
    loggedAt: "2026-04-02",
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
    (await db.select({ slug: logEntries.slug }).from(logEntries)).map((r) => r.slug),
  )

  const rows = SEEDS.map((s) => ({
    slug: slugify(s.title, s.year),
    type: s.type,
    title: s.title,
    creator: s.creator,
    year: s.year,
    rating: s.rating.toFixed(1),
    favorite: s.favorite,
    note: s.note ?? null,
    posterUrl: null,
    externalUrl: null,
    loggedAt: s.loggedAt,
    published: true,
  })).filter((r) => !existing.has(r.slug))

  if (rows.length === 0) {
    console.log("nothing to insert, all 14 slugs are already there")
  } else {
    await db.insert(logEntries).values(rows)
    console.log(`inserted ${rows.length} entries`)
    for (const r of rows) console.log(`  ${r.slug}`)
  }

  if (existing.size > 0) console.log(`skipped ${SEEDS.length - rows.length} already present`)

  await sql.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
