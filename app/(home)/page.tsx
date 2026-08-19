import { Suspense } from "react"
import Link from "next/link"
import { CardLoading } from "@/components/ui/card-states"
import {
  getFeaturedPosts,
  getFeaturedProjects,
  getPublishedPosts,
  getPublishedProjects,
} from "@/lib/velite"
import { formatDate, estimateReadingTime } from "@/lib/utils"
import { CardHead } from "@/components/ui/card-parts"
import { FeaturedProjectCard } from "@/components/home/featured-project-card"
import { FeaturedPostCard } from "@/components/home/featured-post-card"
import { OssCard } from "@/components/home/oss-card"
import { NowPlayingWidget } from "@/components/spotify/now-playing-widget"
import { GithubCard } from "@/components/home/github-card"
import { TodayActivityCard } from "@/components/wristkit/today-activity-card"
import { loadTodayActivity } from "@/components/wristkit/today-activity-card/load"
import { StackCard } from "@/components/home/stack-card"
import { MiniPianoCard } from "@/components/home/mini-piano-card"
import { LatestLogCard } from "@/components/home/latest-log-card"
import { ProfileCard } from "@/components/home/profile-card"
import { TreeCard } from "@/components/home/tree-card"
import { buildSiteTree, siteTreeRouteCount } from "@/lib/site-tree"
import { getPublishedEntries } from "@/lib/log/queries"
import { createMetadata } from "@/lib/metadata"
import { calcYearsOfExp, yearsWord } from "@/lib/experience"
import { getContributions } from "@/lib/github/contributions"
import { siteConfig } from "@/lib/site-config"

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

// ─── Helpers ───────────────────────────────────────────────────────────────────

function SectHead({
  id,
  cmd,
  meta,
  as = "h2",
}: {
  id: string
  cmd: string
  meta?: React.ReactNode
  as?: "h2" | "span"
}) {
  const Label = as
  return (
    <div
      className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-dashed pb-3"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <Label
        id={id}
        className="text-mono-sm font-mono font-normal"
        style={
          as === "h2"
            ? { margin: 0, color: "var(--fg-secondary)" }
            : { color: "var(--fg-secondary)" }
        }
      >
        <span aria-hidden="true" style={{ color: "var(--fg-brand)" }}>
          ${" "}
        </span>
        {cmd}
      </Label>
      {meta && (
        <span
          className="text-mono-sm font-mono tracking-[0.08em] uppercase"
          style={{ color: "var(--fg-muted)" }}
        >
          {meta}
        </span>
      )}
    </div>
  )
}

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

/** The same grid, in grey, so nothing below it moves when the row lands. */
function WhoamiRowFallback() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.5fr_1fr]">
      <CardLoading label="whoami" rows={0} minHeight={320} />
      <CardLoading label="tree" rows={4} minHeight={320} />
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

async function LogShelfSlot() {
  const entries = await getPublishedEntries().catch(() => null)
  return <LatestLogCard entries={entries ?? []} />
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
        <SectHead id="sec-offclock" cmd="cat ./off-the-clock" meta="music · gym · log" />
        {/* Back to the arrangement that worked: now-playing and the piano stacked beside a
            full-height wristkit. Those three balance because the stack of two roughly
            matches the tall one — putting them in three equal columns instead would leave
            a ~450px hole under now-playing, since wristkit is about 2.5x its height. */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <NowPlayingWidget />
          <Suspense
            fallback={
              <div className="md:row-span-2 md:h-full">
                <CardLoading label="today" rows={0} className="h-full" minHeight={420} />
              </div>
            }
          >
            <WristkitSlot />
          </Suspense>
          <MiniPianoCard />
        </div>

        {/* The log gets the full width underneath, laid out as a shelf. */}
        <div className="mt-6">
          <Suspense fallback={<CardLoading label="log" rows={0} minHeight={280} />}>
            <LogShelfSlot />
          </Suspense>
        </div>
      </section>

      {/* ═══════════════ GITHUB ═══════════════ */}
      <section aria-labelledby="sec-github">
        <SectHead id="sec-github" cmd="git log --contributions" meta="github.com/imnotannamaria" />
        <Suspense fallback={<CardLoading label="contributions" rows={0} minHeight={220} />}>
          <GithubSlot />
        </Suspense>
      </section>
    </div>
  )
}
