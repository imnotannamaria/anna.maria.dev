import { Suspense } from "react"
import Link from "next/link"
import {
  getFeaturedPosts,
  getFeaturedProjects,
  getPublishedPosts,
  getPublishedProjects,
} from "@/lib/velite"
import { formatDate, estimateReadingTime } from "@/lib/format"
import { BentoGrid, BentoItem } from "@/app/components/entrepta/bento-grid"
import { cardVariants, CardHeader, CardLabel } from "@/app/components/entrepta/card"
import { SectHead } from "@/app/components/entrepta/sect-head"
import { FeaturedProjectCard } from "@/components/home/featured-project-card"
import { FeaturedPostCard } from "@/components/home/featured-post-card"
import { ShortlogCard, type ShortlogGoal } from "@/components/home/shortlog-card"
import { NowPlayingWidget } from "@/components/spotify/now-playing-widget"
import { GithubCard } from "@/components/home/github-card"
import { TodayActivityCard } from "@/components/wristkit/today-activity-card"
import { loadTodayActivity } from "@/components/wristkit/today-activity-card/load"
import { StackCard } from "@/components/home/stack-card"
import { MiniPianoCard } from "@/components/home/mini-piano-card"
import { LogShelfCard } from "@/components/home/log-shelf-card"
import { RoadmapChangelogCard } from "@/components/home/roadmap-changelog-card"
import { ProfileCard } from "@/components/home/profile-card"
import { TreeCard, TreeCardSkeleton } from "@/components/home/tree-card"
import { buildSiteTree, siteTreeRouteCount } from "@/lib/site-tree"
import { getPublishedEntries } from "@/lib/log/queries"
import { getPublicItems } from "@/lib/roadmap/queries"
import { createMetadata } from "@/lib/metadata"
import { cn } from "@/lib/utils"
import { calcYearsOfExp, yearsWord } from "@/lib/experience"
import { getContributions } from "@/lib/github/contributions"
import { getShortlog } from "@/lib/github/shortlog"
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

/**
 * How a tile sits between 768 and 1024px.
 *
 * entrepta's `BentoGrid` speaks two breakpoints: 6 columns from 640px and 12 from 1024px. The
 * home page pairs its cards from 768px, and at 640 a half is narrower than the same card gets
 * on a phone. So a tile here is a full row at `sm` (no `colSpan.sm`), a half from `md` through
 * this class, and whatever its `colSpan.lg` says from 1024px. It adds a breakpoint the
 * component does not have; it undoes nothing the component sets.
 */
const HALF_FROM_MD = "md:col-span-3"

/**
 * `$ whoami` as one grid: the profile card and the tree in the first row, sharing the log
 * count, and the stack across the second.
 *
 * Not async, on purpose. The profile card holds the home page's LCP element (the bio), and it
 * used to wait here for `await getPublishedEntries()` behind a Suspense skeleton, so the bio
 * reached the browser only after Postgres answered. Now the query starts here and its promise
 * goes down as a prop: the card renders in the first flush and only its "logged" cell waits,
 * and the tree, which needs the count for a label, gets a boundary of its own.
 */
function WhoamiGrid() {
  // A database blip should cost the home page one number, not the whole row. /log has an error
  // boundary instead, because there the log IS the page.
  //
  // null, not []: an unreachable database and an empty log are different facts, and collapsing
  // them means the counters can't tell "I don't know" from "none yet". A genuine 0 is true and
  // gets shown; a failed query shows nothing at all.
  const logEntries = getPublishedEntries().catch(() => null)
  const posts = getPublishedPosts()
  const projects = getPublishedProjects()

  return (
    <BentoGrid>
      {/* The profile card. It carries the page h1, so the name stays the one top-level heading
          on the home page. `reveal={false}`: it sequences its own contents, and it holds the
          LCP element, which must not ship at `opacity: 0` and wait for hydration. */}
      <BentoItem colSpan={{ lg: 7 }} className={HALF_FROM_MD} reveal={false}>
        <ProfileCard
          stats={{ years: calcYearsOfExp(), projects: projects.length, posts: posts.length }}
          logged={logEntries.then((entries) => entries?.length ?? null)}
        />
      </BentoItem>

      {/* The tree. A tile and a wrapper inside it, both earning their place. This is the one
          card whose height the visitor controls, and a grid row is sized by its tallest item's
          content — so left alone, opening every folder made the tree the tallest thing in the
          row and stretched the profile card to match. The tile takes the row height from the
          profile card; the inner div goes absolute, so the card simply fills what it is given.
          Below md there is no row to share, so it's a normal block with a cap. */}
      <BentoItem
        colSpan={{ lg: 5 }}
        className={cn(HALF_FROM_MD, "relative md:min-h-0")}
        reveal={false}
      >
        <div className="md:absolute md:inset-0">
          <Suspense
            fallback={
              <TreeCardSkeleton
                routeCount={siteTreeRouteCount()}
                className="h-full max-h-130 md:max-h-none"
              />
            }
          >
            <TreeSlot logEntries={logEntries} posts={posts} projects={projects} />
          </Suspense>
        </div>
      </BentoItem>

      <BentoItem colSpan={{ sm: 6, lg: 12 }}>
        <StackCard />
      </BentoItem>
    </BentoGrid>
  )
}

/** The tree, once the log count it labels `/log` with is known. */
async function TreeSlot({
  logEntries,
  posts,
  projects,
}: {
  logEntries: Promise<Awaited<ReturnType<typeof getPublishedEntries>> | null>
  posts: ReturnType<typeof getPublishedPosts>
  projects: ReturnType<typeof getPublishedProjects>
}) {
  const entries = await logEntries
  // Counts come off lists this page already has in memory, so the tree costs no extra query.
  // A null count renders the row without a number: asserting zero would be a claim.
  const siteTree = buildSiteTree({ posts, projects, logCount: entries?.length ?? null })

  return (
    <TreeCard
      items={siteTree}
      routeCount={siteTreeRouteCount()}
      className="h-full max-h-130 md:max-h-none"
    />
  )
}

async function WristkitSlot() {
  const state = await loadTodayActivity({
    tz: "America/Sao_Paulo",
    // An hour and a half of exercise a day, not wristkit's default 30 minutes.
    goals: { exerciseMinutes: 90 },
  })
  return (
    <Link
      href="https://wristkit-web.vercel.app/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View wristkit"
      // The tile stretches the link, and the link hands its height to the card.
      className="flex flex-col"
    >
      <TodayActivityCard state={state} className="flex-1" />
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
  return <LogShelfCard state={toState(entries)} />
}

async function RoadmapSlot() {
  const items = await getPublicItems().catch(() => null)
  return <RoadmapChangelogCard state={toState(items)} />
}

/** null → error, [] → empty, rows → ok. One place, so the two slots cannot drift. */
function toState<T>(rows: T[] | null): CardState<T[]> {
  if (rows === null) return { kind: "error" }
  if (rows.length === 0) return { kind: "empty" }
  return { kind: "ok", data: rows }
}

/**
 * Commits in the last thirty days, on the repositories that are projects here. Streams on its
 * own, like the contributions card: the featured project beside it never waits for GitHub.
 */
async function ShortlogSlot({
  goal,
  projects,
}: {
  goal: ShortlogGoal
  projects: ReturnType<typeof getPublishedProjects>
}) {
  const repos = projects.flatMap((p) =>
    p.github ? [{ slug: p.slug, title: p.title, github: p.github }] : [],
  )
  const state = await getShortlog(siteConfig.githubUser, repos)
  return <ShortlogCard state={state} goal={goal} />
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
  // Projects shipped this year against six. It used to be a card of its own; now it is the
  // shortlog's footer line, which is the size it earned once the goal was met.
  const goal: ShortlogGoal = {
    shipped: projects.filter((p) => new Date(p.date).getFullYear() === currentYear).length,
    goal: 6,
    yearShort: currentYear.toString().slice(2),
  }
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
        {/* Profile + tree, then the stack. The profile card paints at once; the log count
            streams in. */}
        <WhoamiGrid />
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
              style={{ color: "var(--fg-brand-text)", textTransform: "none" }}
            >
              all projects ↗
            </Link>
          }
        />
        {/* The featured project and the featured post stacked on the left, the shortlog on its
            own on the right. It was the other way round — the shortlog above the post — and the
            featured project stretched to the height of two cards with half of it empty.

            The left tile holds both cards rather than giving each a tile of its own: `1fr` on
            the project's row means it takes whatever height the shortlog leaves over, and the
            post keeps its own. Two tiles would share that leftover between them, which is how
            the post would end up taller than what it has to say. On a phone it is one column
            in reading order: project, post, then the commits. */}
        <BentoGrid>
          <BentoItem colSpan={{ lg: 7 }} className={HALF_FROM_MD}>
            <div className="grid grid-rows-[1fr_auto] gap-3">
              {featuredProject ? (
                <FeaturedProjectCard
                  project={featuredProject}
                  index={1}
                  total={getFeaturedProjects().length}
                />
              ) : (
                <div className={cardVariants()}>
                  <CardHeader>
                    <CardLabel>featured</CardLabel>
                  </CardHeader>
                  <p
                    className="text-body-md"
                    style={{ color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}
                  >
                    No featured projects yet.
                  </p>
                </div>
              )}

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
          </BentoItem>

          <BentoItem colSpan={{ lg: 5 }} className={HALF_FROM_MD}>
            <Suspense fallback={<ShortlogCard state={{ kind: "loading" }} goal={goal} />}>
              <ShortlogSlot goal={goal} projects={projects} />
            </Suspense>
          </BentoItem>
        </BentoGrid>
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
            the way every other pair on this page does: a tile stretches whatever is inside
            it, so the taller card sets the row and the shorter one fills it, instead of
            leaving a gap under whichever has less to say today. */}
        <BentoGrid>
          <BentoItem colSpan={{ lg: 6 }} className={HALF_FROM_MD}>
            <NowPlayingWidget />
          </BentoItem>

          <BentoItem
            colSpan={{ lg: 6 }}
            rowSpan={{ lg: 2 }}
            className={cn(HALF_FROM_MD, "md:row-span-2")}
          >
            <Suspense fallback={<TodayActivityCard state={{ kind: "loading" }} />}>
              <WristkitSlot />
            </Suspense>
          </BentoItem>

          <BentoItem colSpan={{ lg: 6 }} className={HALF_FROM_MD}>
            <MiniPianoCard />
          </BentoItem>

          <BentoItem colSpan={{ lg: 6 }} className={HALF_FROM_MD}>
            <Suspense fallback={<LogShelfCard state={{ kind: "loading" }} />}>
              <LogShelfSlot />
            </Suspense>
          </BentoItem>

          <BentoItem colSpan={{ lg: 6 }} className={HALF_FROM_MD}>
            <Suspense fallback={<RoadmapChangelogCard state={{ kind: "loading" }} />}>
              <RoadmapSlot />
            </Suspense>
          </BentoItem>
        </BentoGrid>
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
