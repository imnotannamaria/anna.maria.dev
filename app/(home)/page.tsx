import { Suspense } from "react"
import Link from "next/link"
import {
  getFeaturedPosts,
  getFeaturedProjects,
  getPublishedPosts,
  getPublishedProjects,
} from "@/lib/velite"
import { formatDate, estimateReadingTime } from "@/lib/utils"
import { CardHead } from "@/components/ui/card-parts"
import { SectHead } from "@/components/home/section-head"
import { FeaturedProjectCard } from "@/components/home/featured-project-card"
import { FeaturedPostCard } from "@/components/home/featured-post-card"
import { OssCard } from "@/components/home/oss-card"
import { NowPlayingWidget } from "@/components/spotify/now-playing-widget"
import { GithubCard } from "@/components/home/github-card"
import { TodayActivityCard } from "@/components/wristkit/today-activity-card"
import { loadTodayActivity } from "@/components/wristkit/today-activity-card/load"
import { StackCard } from "@/components/home/stack-card"
import { MiniPianoCard } from "@/components/home/mini-piano-card"
import { LogShelfCard } from "@/components/home/log-shelf-card"
import { RoadmapChangelogCard } from "@/components/home/roadmap-changelog-card"
import { ProfileCard, ProfileCardSkeleton } from "@/components/home/profile-card"
import { TreeCard, TreeCardSkeleton } from "@/components/home/tree-card"
import { buildSiteTree, siteTreeRouteCount } from "@/lib/site-tree"
import { getPublishedEntries } from "@/lib/log/queries"
import { getPublicItems } from "@/lib/roadmap/queries"
import { createMetadata } from "@/lib/metadata"
import { calcYearsOfExp, yearsWord } from "@/lib/experience"
import { getContributions } from "@/lib/github/contributions"
import { siteConfig } from "@/lib/site-config"
import type { CardState } from "@/lib/showcase/state"

/**
 * Rendered per request. Two cards here read live data — wristkit's activity rings and the
 * log shelf — and both are the kind of thing that is wrong the moment it is an hour old.
 * An Apple Watch ring frozen at this morning's numbers is worse than a slightly slower
 * page, and the rest of the home page comes from MDX that is already in the bundle.
 */
export const dynamic = "force-dynamic"

export const metadata = createMetadata({
  title: "Anna Maria — Full-stack Software Engineer",
  description: `Full-stack Software Engineer with ${calcYearsOfExp()} years shipping web products.`,
  path: "/",
  titleAbsolute: true,
})

// ─── Streaming slots ───────────────────────────────────────────────────────────
//
// Everything that reads Postgres or GitHub lives in one of these, behind its own Suspense
// boundary. `Home()` below awaits nothing, so the shell — the section heads, the featured
// project, the stack, the piano, all of which come from MDX already in the bundle — paints
// immediately and each card fills in when its query lands.
//
// It used to be one `Promise.all` at the top of the page, which meant a slow log query held
// the entire home page behind `loading.tsx`, including everything that needed no database at
// all. `force-dynamic` stays: streaming and dynamic rendering are not in tension.
//
// The log is read from three of these slots and `getPublishedEntries` is wrapped in React's
// `cache`, so that is still one query per request, not three.

/** Row 1 of `$ whoami`: the profile card and the tree, which share the log count. */
async function WhoamiRow() {
  // A database blip should cost the home page one card, not the whole page. /log has an error
  // boundary instead, because there the log IS the page.
  //
  // null, not []: an unreachable database and an empty log are different facts, and collapsing
  // them means the counters can't tell "I don't know" from "none yet". A genuine 0 is true and
  // gets shown; a failed query shows nothing at all.
  const logEntries = await getPublishedEntries().catch(() => null)
  const posts = getPublishedPosts()
  const projects = getPublishedProjects()

  // Counts come off lists this page already has in memory, so the tree costs no extra query.
  // A null count renders the row without a number, which is what an unreachable database
  // deserves — asserting zero would be a claim.
  const siteTree = buildSiteTree({ posts, projects, logCount: logEntries?.length ?? null })

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.5fr_1fr]">
      {/* The profile card. It carries the page h1, so the name stays the
          one top-level heading on the home page. */}
      <ProfileCard
        stats={{
          years: calcYearsOfExp(),
          projects: projects.length,
          posts: posts.length,
          logged: logEntries?.length ?? null,
        }}
      />

      {/* The tree — replaces the experience card. That one restated the hero
          paragraph's "N years shipping" beside a row of dots that did nothing; this
          gives the same slot to something you can actually browse.

          Two nested wrappers, both earning their place. This is the one card whose
          height the visitor controls, and a grid row is sized by its tallest item's
          content — so left alone, opening every folder made the tree the tallest
          thing in the row and stretched the profile card to match, while a collapsed
          tree left it short. The outer div is the grid item and takes the row height
          from the profile card. The inner div is what goes absolute, so the card is
          pulled out of the row's height calculation and simply fills what it's given.

          The inner div exists because `.bento-card` sets `position: relative` outside
          any @layer, and unlayered CSS beats Tailwind's layered utilities — putting
          `md:absolute` on the card itself silently lost that fight. A plain div has no
          such rule to argue with.

          Below md there is no row to share, so it's a normal block with a cap. */}
      <div className="relative md:min-h-0">
        <div className="md:absolute md:inset-0">
          <TreeCard
            items={siteTree}
            routeCount={siteTreeRouteCount()}
            className="h-full max-h-130 md:max-h-none"
          />
        </div>
      </div>
    </div>
  )
}

/**
 * The same grid, in grey, so nothing below it moves when the row lands.
 *
 * Both halves are the cards' own skeletons rather than a generic pair of boxes — the profile
 * card's avatar frame and stats rail, the tree's real rows at their real indents. A skeleton
 * that could belong to any card tells you a card is coming and nothing else; one you recognise
 * tells you *which* card is coming, which is the only thing worth knowing while you wait.
 */
function WhoamiRowFallback() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.5fr_1fr]">
      <ProfileCardSkeleton />
      <TreeCardSkeleton routeCount={siteTreeRouteCount()} className="max-h-130 md:max-h-none" />
    </div>
  )
}

async function WristkitSlot() {
  const state = await loadTodayActivity({ tz: "America/Sao_Paulo" })
  return (
    <Link
      href="https://wristkit-web.vercel.app/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View wristkit"
      className="md:row-span-2 md:h-full"
    >
      <TodayActivityCard state={state} className="h-full" />
    </Link>
  )
}

/**
 * The two cards in the bottom row of `$ cat ./off-the-clock`.
 *
 * Both hand the card a `CardState` rather than a bare array, because a failed query and an
 * empty table are different facts and a card that collapses them tells the visitor "nothing
 * yet" when the truth is "I can't reach the database". `.catch(() => null)` is the
 * distinction: null is the failure, `[]` is the genuine empty.
 *
 * A blip costs the home page one card, not the page — `/log` and `/roadmap` carry their own
 * `error.tsx` instead, because there the data IS the page.
 */
async function LogShelfSlot() {
  const entries = await getPublishedEntries().catch(() => null)
  return <LogShelfCard state={toState(entries)} className="h-full" />
}

async function RoadmapSlot() {
  const items = await getPublicItems().catch(() => null)
  return <RoadmapChangelogCard state={toState(items)} className="h-full" />
}

/** null → error, [] → empty, rows → ok. One place, so the two slots cannot drift. */
function toState<T>(rows: T[] | null): CardState<T[]> {
  if (rows === null) return { kind: "error" }
  if (rows.length === 0) return { kind: "empty" }
  return { kind: "ok", data: rows }
}

async function GithubSlot() {
  const state = await getContributions(siteConfig.githubUser)
  return <GithubCard username={siteConfig.githubUser} state={state} />
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const projects = getPublishedProjects()
  const featuredProject = getFeaturedProjects()[0]
  const featuredPost = getFeaturedPosts()[0]
  const currentYear = new Date().getFullYear()
  const ossCount = projects.filter((p) => new Date(p.date).getFullYear() === currentYear).length
  const ossGoal = 6
  const yrShort = currentYear.toString().slice(2)
  const yearsOfExp = calcYearsOfExp()

  return (
    <div
      className="mx-auto flex flex-col gap-14 px-4 py-6 sm:gap-16 sm:px-6 md:px-8 lg:gap-20 lg:px-12 lg:py-8"
      style={{ maxWidth: 1280 }}
    >
      {/* ═══════════════ WHOAMI ═══════════════ */}
      <section aria-labelledby="sec-whoami">
        <SectHead
          id="sec-whoami"
          as="span"
          cmd="whoami"
          meta={`uptime · ${yearsWord(yearsOfExp)} years`}
        />
        {/* Row 1: profile + tree. Both need the log count, so they stream together. */}
        <Suspense fallback={<WhoamiRowFallback />}>
          <WhoamiRow />
        </Suspense>

        {/* Row 2: Stack — full width */}
        <div className="mt-6">
          <StackCard />
        </div>
      </section>

      {/* ═══════════════ WORK ═══════════════ */}
      <section aria-labelledby="sec-work">
        <SectHead
          id="sec-work"
          cmd="ls ./work --featured"
          meta={
            <Link
              href="/projects"
              className="text-mono-sm font-mono tracking-normal transition-all duration-150 hover:tracking-[0.08em]"
              style={{ color: "var(--fg-brand)", textTransform: "none" }}
            >
              all projects ↗
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.35fr_1fr]">
          {featuredProject ? (
            <FeaturedProjectCard
              project={featuredProject}
              index={1}
              total={getFeaturedProjects().length}
            />
          ) : (
            <div className="bento-card">
              <CardHead label="featured" />
              <p
                className="text-body-md"
                style={{ color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}
              >
                No featured projects yet.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <OssCard count={ossCount} goal={ossGoal} yearShort={yrShort} />

            {featuredPost && (
              <FeaturedPostCard
                post={{
                  slug: featuredPost.slug,
                  title: featuredPost.title,
                  description: featuredPost.description,
                  tags: featuredPost.tags,
                  date: formatDate(featuredPost.date),
                  minutes: estimateReadingTime(featuredPost.body),
                }}
              />
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════ OFF THE CLOCK ═══════════════ */}
      <section aria-labelledby="sec-offclock">
        <SectHead id="sec-offclock" cmd="cat ./off-the-clock" meta="music · gym · log · roadmap" />
        {/* Now-playing and the piano stacked beside a full-height wristkit — those three
            balance because the stack of two roughly matches the tall one, and three equal
            columns would leave a ~450px hole under now-playing since wristkit is about 2.5x
            its height.

            The log and the roadmap are a third row of the same grid rather than a block of
            their own underneath. wristkit spans rows one and two, so auto-placement drops
            these two straight into the row below it, and they end up sharing a row height
            the way every other pair on this page does. Both cards take `h-full` for that
            reason: the taller one sets the row and the shorter one fills it, instead of
            leaving a gap under whichever has less to say today. */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <NowPlayingWidget />
          <Suspense
            fallback={
              <div className="md:row-span-2 md:h-full">
                <TodayActivityCard state={{ kind: "loading" }} className="h-full" />
              </div>
            }
          >
            <WristkitSlot />
          </Suspense>
          <MiniPianoCard />

          <Suspense fallback={<LogShelfCard state={{ kind: "loading" }} className="h-full" />}>
            <LogShelfSlot />
          </Suspense>
          <Suspense
            fallback={<RoadmapChangelogCard state={{ kind: "loading" }} className="h-full" />}
          >
            <RoadmapSlot />
          </Suspense>
        </div>
      </section>

      {/* ═══════════════ GITHUB ═══════════════ */}
      <section aria-labelledby="sec-github">
        <SectHead id="sec-github" cmd="git log --contributions" meta="github.com/imnotannamaria" />
        <Suspense
          fallback={<GithubCard username={siteConfig.githubUser} state={{ kind: "loading" }} />}
        >
          <GithubSlot />
        </Suspense>
      </section>
    </div>
  )
}
