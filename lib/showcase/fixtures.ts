/**
 * The data every demo on `/components` renders from.
 *
 * Fixtures rather than live data, for a reason that is not laziness: you cannot ask a healthy
 * database to fail, so the error frame has nothing to show unless it is handed something. It
 * also means the page is fully static — documentation whose demos break when Postgres does is
 * the worst possible version of documentation.
 *
 * Two rules here are not optional.
 *
 * **No `new Date()`.** A fixture computed from the current date renders one string on the
 * server and another on the client the moment a render straddles midnight — the trap the log
 * strip on the home page was split server/client to avoid. Every date is a literal.
 *
 * **No `Math.random()`.** The contributions grid is 53 × 7 and checking in 371 objects would be
 * unreadable, so it is generated — with a seeded PRNG, because `Math.random()` produces a
 * different grid on each side of the boundary and a hydration mismatch across the whole
 * calendar.
 */

import type {
  ContributionDay,
  ContributionWeek,
  ContributionYear,
} from "@/lib/github/contributions"
import type { SimplifiedTrack } from "@/lib/spotify"
import type { TodayData } from "@/components/wristkit/today-activity-card/load"
import type { SiteTreeItem } from "@/lib/site-tree"
import { buildSiteTree } from "@/lib/site-tree"

/** xorshift32. Deterministic, six lines, and the same grid on both sides of the boundary. */
function seeded(seed: number): () => number {
  let s = seed
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return (s >>> 0) / 4294967296
  }
}

/** A plausible year: quiet weekends, a couple of busy stretches, one gap. */
function buildContributions(): ContributionYear {
  const rand = seeded(0x5eed_1234)
  const weeks: ContributionWeek[] = []
  let total = 0

  // A fixed Sunday, so every date in the grid is derived rather than observed.
  const start = Date.UTC(2025, 7, 24)

  for (let w = 0; w < 53; w++) {
    const days: ContributionDay[] = []
    for (let d = 0; d < 7; d++) {
      const iso = new Date(start + (w * 7 + d) * 86_400_000).toISOString().slice(0, 10)
      const weekend = d === 0 || d === 6
      const lull = w > 18 && w < 23
      const roll = rand()
      const count = lull ? 0 : Math.round(roll * roll * (weekend ? 4 : 14))
      const level = count === 0 ? 0 : count < 3 ? 1 : count < 7 ? 2 : count < 12 ? 3 : 4
      total += count
      days.push({ date: iso, count, level: level as ContributionDay["level"] })
    }
    weeks.push(days)
  }

  return { weeks, total }
}

export const CONTRIBUTIONS_FIXTURE: ContributionYear = buildContributions()

export const TRACK_FIXTURE: SimplifiedTrack = {
  id: "fixture-track",
  name: "Sailing",
  artist: "Christopher Cross",
  // Empty on purpose: the card's own CoverFallback is what renders, so the demo needs no
  // network and no remotePatterns entry, and the fallback gets exercised on every deploy.
  coverUrl: "",
  durationMs: 256_000,
  spotifyUrl: "https://open.spotify.com/",
  album: "Christopher Cross",
  year: "1979",
  previewUrl: null,
}

export const TODAY_FIXTURE: TodayData = {
  kcal: 412,
  kcalGoal: 600,
  exerciseMinutes: 22,
  exerciseGoal: 30,
  steps: 6240,
  stepsGoal: 8000,
  lastSyncIso: "2026-08-18T14:20:00.000Z",
  lastSyncLabel: "14:20",
  hoursSinceSync: 2,
}

/** The same shape the home page builds, from counts that do not move. */
export const TREE_FIXTURE: SiteTreeItem[] = buildSiteTree({
  posts: [
    { slug: "the-tree", title: "The tree" },
    { slug: "states", title: "A state for every card" },
    { slug: "tokens", title: "Tokens" },
  ],
  projects: [
    { slug: "wristkit", title: "wristkit" },
    { slug: "entrepta", title: "entrepta" },
  ],
  logCount: 24,
})

export const TREE_FIXTURE_EMPTY: SiteTreeItem[] = buildSiteTree({
  posts: [],
  projects: [],
  logCount: null,
})
