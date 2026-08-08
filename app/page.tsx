import Link from "next/link"
import { getFeaturedPosts, getFeaturedProjects, getPublishedProjects } from "@/lib/velite"
import { formatDate, estimateReadingTime } from "@/lib/utils"
import { NowPlayingWidget } from "@/components/spotify/now-playing-widget"
import { GithubCard } from "@/components/home/github-card"
import { TodayActivityCard, loadTodayActivity } from "@/components/wristkit/today-activity-card"
import { buttonVariants } from "@/app/components/entrepta/button-variants"
import { cn } from "@/lib/utils"
import { StackCard } from "@/components/home/stack-card"
import { MiniPianoCard } from "@/components/home/mini-piano-card"
import { LatestLogCard } from "@/components/home/latest-log-card"
import { getPublishedEntries } from "@/lib/log/queries"
import { createMetadata } from "@/lib/metadata"
import { CAREER_START_YEAR, calcYearsOfExp, yearsWord } from "@/lib/experience"

export const revalidate = 3600

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
        className="font-mono text-xs font-normal"
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
          className="font-mono text-[11px] tracking-[0.08em] uppercase"
          style={{ color: "var(--fg-muted)" }}
        >
          {meta}
        </span>
      )}
    </div>
  )
}

function CardHead({
  label,
  meta,
  as = "span",
  id,
}: {
  label: string
  meta?: React.ReactNode
  as?: "span" | "h2" | "h3"
  id?: string
}) {
  const Label = as
  const isHeading = as !== "span"
  return (
    <div
      className="flex items-center justify-between gap-3 font-mono text-[11px] tracking-[0.08em] uppercase"
      style={{ color: "var(--fg-secondary)" }}
    >
      <Label
        id={id}
        className="inline-flex items-center gap-1.5"
        style={isHeading ? { margin: 0, fontSize: "inherit", fontWeight: "inherit" } : undefined}
      >
        <span aria-hidden="true" style={{ color: "var(--fg-brand)", fontSize: 10 }}>
          ◆
        </span>
        {label}
      </Label>
      {meta && <span style={{ color: "var(--fg-muted)" }}>{meta}</span>}
    </div>
  )
}

function CardFoot({ comment, children }: { comment?: string; children?: React.ReactNode }) {
  return (
    <div
      className="mt-auto flex items-center justify-between gap-3 font-mono text-[11px]"
      style={{ color: "var(--fg-muted)" }}
    >
      {comment && (
        <span>
          <span style={{ opacity: 0.6 }}>{"// "}</span>
          {comment}
        </span>
      )}
      {children}
    </div>
  )
}

function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode
  variant?: "default" | "brand-soft" | "success-soft"
}) {
  const styles: Record<string, { bg: string; fg: string }> = {
    default: { bg: "rgba(255,255,255,0.06)", fg: "var(--fg-secondary)" },
    "brand-soft": { bg: "var(--bg-surface-brand)", fg: "var(--fg-brand-hover)" },
    "success-soft": { bg: "var(--status-success-soft)", fg: "var(--status-success-fg)" },
  }
  const { bg, fg } = styles[variant]
  return (
    <span
      className="inline-flex h-[22px] items-center rounded-[var(--radius-sm)] px-2 font-mono text-[11px] font-medium"
      style={{ background: bg, color: fg }}
    >
      {children}
    </span>
  )
}

function StatNum({ serif, sub }: { serif: React.ReactNode; sub: string }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-serif)",
        fontSize: 48,
        lineHeight: 1,
        color: "var(--fg-primary)",
        letterSpacing: "-0.02em",
        fontWeight: 400,
      }}
    >
      <em style={{ fontStyle: "italic", color: "var(--fg-brand)" }}>{serif}</em>
      <sub
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--fg-muted)",
          fontWeight: 400,
          marginLeft: 4,
          letterSpacing: 0,
          verticalAlign: "baseline",
        }}
      >
        {sub}
      </sub>
    </div>
  )
}

function ProgressBar({ filled, total }: { filled: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 3, height: 6, marginTop: "auto" }}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          style={{
            flex: 1,
            background: i < filled ? "var(--fg-brand)" : "var(--border-subtle)",
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  )
}

// ─── Experience timeline constants ─────────────────────────────────────────────

const CAREER_START = CAREER_START_YEAR
const TIMELINE_WINDOW = 5 // intervals shown (= points - 1)

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function Home() {
  const [activityState, logEntries] = await Promise.all([
    loadTodayActivity({ tz: "America/Sao_Paulo" }),
    // A database blip should cost the home page one card, not the whole page. /log has an
    // error boundary instead, because there the log IS the page.
    getPublishedEntries().catch(() => []),
  ])
  const featuredProject = getFeaturedProjects()[0]
  const featuredPost = getFeaturedPosts()[0]
  const currentYear = new Date().getFullYear()
  const ossCount = getPublishedProjects().filter(
    (p) => new Date(p.date).getFullYear() === currentYear,
  ).length
  const ossGoal = 6
  const yrShort = currentYear.toString().slice(2)

  // Experience timeline — counts from exact date (March 15 2021), not just year
  const yearsOfExp = calcYearsOfExp()
  const windowStart = Math.max(CAREER_START, currentYear - TIMELINE_WINDOW)
  const showBeforeHint = windowStart > CAREER_START
  const timelineYears = Array.from(
    { length: currentYear - windowStart + 1 },
    (_, i) => windowStart + i,
  )

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
        {/* Row 1: hero + experience */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.5fr_1fr]">
          {/* Hero card */}
          <div
            className="bento-card bento-card-xl relative overflow-hidden"
            style={{ minHeight: 420, borderRadius: "var(--radius-xl)" }}
          >
            {/* Radial glow */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                right: -120,
                bottom: -120,
                width: 360,
                height: 360,
                borderRadius: "50%",
                background: "radial-gradient(circle, var(--bg-surface-brand), transparent 65%)",
                pointerEvents: "none",
              }}
            />

            <p
              className="mb-2 inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.08em] uppercase"
              style={{ color: "var(--fg-muted)" }}
            >
              <span>{"// "}hello, i&apos;m</span>
              <span
                className="rounded-[3px] px-1.5 py-0.5 font-mono tracking-normal normal-case"
                style={{ border: "1px solid var(--border-subtle)", color: "var(--fg-brand)" }}
              >
                v1.0
              </span>
              <span>· Pernambuco, Brasil</span>
            </p>

            <h1
              className="relative z-10"
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 400,
                fontSize: "clamp(44px, 9vw, 88px)",
                lineHeight: 1,
                letterSpacing: "-0.02em",
                color: "var(--fg-primary)",
                margin: "24px 0",
              }}
            >
              Anna <em style={{ fontStyle: "italic", color: "var(--fg-brand)" }}>Maria</em>
              <span
                aria-hidden
                style={{
                  display: "inline-block",
                  width: "0.55ch",
                  color: "var(--fg-brand)",
                  animation: "cursor-blink 1.1s steps(2) infinite",
                  marginLeft: 2,
                }}
              >
                _
              </span>
            </h1>

            <p
              className="relative z-10 mb-8 max-w-[52ch] text-base leading-relaxed"
              style={{ fontFamily: "var(--font-sans)", color: "var(--fg-secondary)" }}
            >
              Full-stack Software Engineer with {yearsOfExp} years shipping web products. Currently
              at{" "}
              <Link
                href="https://cesar.org.br"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:[border-bottom-color:var(--fg-brand)] hover:[color:var(--fg-brand)]"
                style={{
                  color: "var(--fg-primary)",
                  borderBottom: "1px solid var(--border-strong)",
                }}
              >
                CESAR
              </Link>{" "}
              and always working on something open source on the side.
            </p>

            <div className="relative z-10 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
              <Link
                href="/projects"
                className={cn(
                  buttonVariants({ variant: "primary", size: "lg" }),
                  "w-full sm:w-auto",
                )}
              >
                browse projects →
              </Link>
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ variant: "command", size: "lg" }),
                  "w-full sm:w-auto",
                )}
              >
                cat contact.txt
              </Link>
            </div>
          </div>

          {/* Experience card — directly in grid, stretches to hero height */}
          <div className="bento-card relative flex flex-col overflow-hidden">
            {/* Dot pattern decoration */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: "50%",
                top: "28%",
                width: "80%",
                aspectRatio: "1",
                opacity: 0.18,
                pointerEvents: "none",
                backgroundImage: "radial-gradient(var(--fg-brand) 1px, transparent 1.4px)",
                backgroundSize: "18px 18px",
                maskImage: "radial-gradient(circle, #000 0%, transparent 65%)",
                WebkitMaskImage: "radial-gradient(circle, #000 0%, transparent 65%)",
              }}
            />
            {/* Radial glow */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: "30%",
                top: "10%",
                width: 260,
                height: 260,
                borderRadius: "50%",
                background: "radial-gradient(circle, var(--bg-surface-brand), transparent 70%)",
                pointerEvents: "none",
                opacity: 0.7,
              }}
            />
            {/* Header */}
            <div className="relative flex items-center justify-between">
              <CardHead label="experience" as="h2" id="card-experience" />
              <span
                className="font-mono text-[11px] tracking-[0.04em]"
                style={{ color: "var(--fg-brand)" }}
              >
                {CAREER_START} → NOW
              </span>
            </div>

            {/* Display number */}
            <div className="relative mt-3 flex items-baseline gap-3">
              <em
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 72,
                  fontStyle: "italic",
                  fontWeight: 400,
                  lineHeight: 0.9,
                  color: "var(--fg-brand)",
                  letterSpacing: "-0.02em",
                }}
              >
                {yearsWord(yearsOfExp)}
              </em>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <em
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 24,
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: "var(--fg-secondary)",
                    lineHeight: 1,
                  }}
                >
                  years
                </em>
                <span
                  className="font-mono tracking-[0.12em] uppercase"
                  style={{ fontSize: 11, color: "var(--fg-secondary)" }}
                >
                  shipping
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative mt-auto flex justify-between" style={{ paddingTop: 28 }}>
              {/* Line */}
              <div
                className="absolute right-0 left-0"
                style={{ height: 1, background: "var(--fg-brand)", top: 33 }}
              />
              {timelineYears.map((year, i) => {
                const isCurrent = year === currentYear
                const isFirst = i === 0
                const label =
                  isFirst && showBeforeHint
                    ? `-'${year.toString().slice(2)}`
                    : `'${year.toString().slice(2)}`
                return (
                  <div
                    key={year}
                    className="group/dot flex flex-col items-center gap-2"
                    style={{ cursor: "default", position: "relative", zIndex: 1 }}
                  >
                    <div
                      style={{
                        width: isCurrent ? 12 : 10,
                        height: isCurrent ? 12 : 10,
                        borderRadius: "50%",
                        background: isCurrent ? "var(--fg-brand)" : "var(--fg-primary)",
                        border: `2px solid ${isCurrent ? "var(--fg-brand)" : "var(--fg-secondary)"}`,
                        transition: "transform 200ms ease, border-color 200ms ease",
                        animation: isCurrent ? "dot-glow 2s ease-in-out infinite" : undefined,
                      }}
                      className={
                        isCurrent
                          ? ""
                          : "group-hover/dot:scale-125 group-hover/dot:[border-color:var(--fg-brand)]"
                      }
                    />
                    <span
                      className="font-mono transition-colors duration-200 group-hover/dot:[color:var(--fg-brand)]"
                      style={{
                        fontSize: 10,
                        color: isCurrent ? "var(--fg-brand)" : "var(--fg-muted)",
                        fontWeight: isCurrent ? 600 : 400,
                      }}
                    >
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div
              className="relative mt-4 flex items-center justify-between font-mono text-[11px]"
              style={{
                color: "var(--fg-muted)",
                borderTop: "1px dashed var(--border-subtle)",
                paddingTop: 12,
              }}
            >
              <span>
                <span style={{ opacity: 0.6 }}>{"// "}</span>
                full-stack · web products
              </span>
              <span
                className="inline-flex items-center gap-1.5"
                style={{ color: "var(--fg-brand)" }}
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{
                    background: "var(--fg-brand)",
                    animation: "live-pulse 2s ease-in-out infinite",
                  }}
                />
                live
              </span>
            </div>
          </div>
        </div>

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
              className="font-mono text-[11px] tracking-normal transition-all duration-150 hover:tracking-[0.08em]"
              style={{ color: "var(--fg-brand)", textTransform: "none" }}
            >
              all projects ↗
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.35fr_1fr]">
          {/* Featured project */}
          {featuredProject ? (
            <div
              className="featured-card group/featured relative flex flex-col gap-4 overflow-hidden p-6 sm:p-8"
              style={{
                background: "var(--bg-surface-brand)",
                border: "1px solid var(--border-brand)",
                borderRadius: "var(--radius-xl)",
                minHeight: 380,
              }}
            >
              {/* Stretch link — covers whole card, inner links sit above it via z-index */}
              <Link
                href={`/projects/${featuredProject.slug}`}
                className="absolute inset-0"
                style={{ zIndex: 1 }}
                aria-label={`View ${featuredProject.title}`}
              />

              <div
                aria-hidden
                style={{
                  position: "absolute",
                  right: "-10%",
                  bottom: "-30%",
                  width: "60%",
                  aspectRatio: "1",
                  opacity: 0.35,
                  pointerEvents: "none",
                  backgroundImage: "radial-gradient(var(--fg-brand) 1px, transparent 1.4px)",
                  backgroundSize: "22px 22px",
                  maskImage: "radial-gradient(circle, #000 0%, transparent 60%)",
                  WebkitMaskImage: "radial-gradient(circle, #000 0%, transparent 60%)",
                }}
              />

              <div className="flex items-center justify-between">
                <span
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] uppercase"
                  style={{ color: "var(--fg-secondary)" }}
                >
                  <span aria-hidden="true" style={{ color: "var(--fg-brand)", fontSize: 10 }}>
                    ◆
                  </span>
                  featured
                </span>
                <Badge variant="brand-soft">SHIPPED</Badge>
              </div>

              <p
                className="font-mono text-xs tracking-[0.04em]"
                style={{ color: "var(--fg-brand)" }}
              >
                01 / {getFeaturedProjects().length.toString().padStart(2, "0")}
              </p>

              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: 400,
                  fontSize: 48,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  color: "var(--fg-primary)",
                  margin: 0,
                }}
              >
                {featuredProject.title.includes("-") ? (
                  <>
                    <em style={{ fontStyle: "italic", color: "var(--fg-brand)" }}>
                      {featuredProject.title.split("-")[0]}-
                    </em>
                    <br />
                    {featuredProject.title.split("-").slice(1).join("-")}
                  </>
                ) : (
                  <em style={{ fontStyle: "italic", color: "var(--fg-brand)" }}>
                    {featuredProject.title}
                  </em>
                )}
              </h3>

              <p
                className="max-w-[44ch] text-sm leading-relaxed"
                style={{ fontFamily: "var(--font-sans)", color: "var(--fg-secondary)" }}
              >
                {featuredProject.description}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {featuredProject.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="brand-soft">
                    {tag}
                  </Badge>
                ))}
              </div>

              <CardFoot>
                <div className="flex gap-6" style={{ position: "relative", zIndex: 2 }}>
                  {featuredProject.github && (
                    <Link
                      href={featuredProject.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-6 items-center py-0.5 transition-all duration-150 hover:tracking-[0.08em] hover:[color:var(--fg-brand)]"
                      style={{
                        color: "var(--fg-primary)",
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                      }}
                    >
                      github ↗
                    </Link>
                  )}
                  {featuredProject.live && (
                    <Link
                      href={featuredProject.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-6 items-center py-0.5 transition-all duration-150 hover:tracking-[0.08em] hover:[color:var(--fg-brand)]"
                      style={{
                        color: "var(--fg-primary)",
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                      }}
                    >
                      live demo ↗
                    </Link>
                  )}
                </div>
                <span style={{ color: "var(--fg-muted)", marginLeft: "auto" }}>
                  {"// "}mit · open source
                </span>
              </CardFoot>
            </div>
          ) : (
            <div className="bento-card">
              <CardHead label="featured" />
              <p
                className="text-sm"
                style={{ color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}
              >
                No featured projects yet.
              </p>
            </div>
          )}

          {/* Stats column */}
          <div className="flex flex-col gap-3">
            {/* OSS card — full width */}
            <div className="bento-card">
              <CardHead
                label={`oss '${yrShort}`}
                as="h3"
                id="card-oss"
                meta={
                  <Badge variant="success-soft">
                    <span
                      className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: "currentColor" }}
                    />
                    {ossGoal - ossCount} to go
                  </Badge>
                }
              />

              <div className="flex items-end gap-4">
                <StatNum serif={ossCount} sub={`/ ${ossGoal}`} />
                <span
                  className="mb-1 font-mono text-[11px] tracking-[0.06em]"
                  style={{ color: "var(--fg-muted)" }}
                >
                  shipped this year
                </span>
              </div>

              <ProgressBar filled={ossCount} total={ossGoal} />
            </div>

            {featuredPost && (
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="group/post flex flex-1 flex-col"
                style={{ textDecoration: "none" }}
              >
                <div className="bento-card flex flex-1 flex-col">
                  <CardHead
                    label="featured post"
                    meta={`${formatDate(featuredPost.date)} · ${estimateReadingTime(featuredPost.body)} min`}
                  />

                  <h3
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 22,
                      lineHeight: 1.2,
                      color: "var(--fg-primary)",
                      margin: 0,
                    }}
                  >
                    {featuredPost.title}
                  </h3>

                  {featuredPost.description && (
                    <p
                      className="line-clamp-3 text-sm leading-relaxed"
                      style={{
                        fontFamily: "var(--font-sans)",
                        color: "var(--fg-secondary)",
                        margin: 0,
                      }}
                    >
                      {featuredPost.description}
                    </p>
                  )}

                  {featuredPost.tags && featuredPost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {featuredPost.tags.slice(0, 4).map((tag) => (
                        <Badge key={tag} variant="brand-soft">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <CardFoot comment="notes · public">
                    <span
                      className="transition-all duration-150 group-hover/post:tracking-[0.06em]"
                      style={{ color: "var(--fg-brand)" }}
                    >
                      read post →
                    </span>
                  </CardFoot>
                </div>
              </Link>
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
          <Link
            href="https://wristkit-web.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View wristkit"
            className="md:row-span-2 md:h-full"
          >
            <TodayActivityCard state={activityState} className="h-full" />
          </Link>
          <MiniPianoCard />
        </div>

        {/* The log gets the full width underneath, laid out as a shelf. */}
        <div className="mt-6">
          <LatestLogCard entries={logEntries} />
        </div>
      </section>

      {/* ═══════════════ GITHUB ═══════════════ */}
      <section aria-labelledby="sec-github">
        <SectHead id="sec-github" cmd="git log --contributions" meta="github.com/imnotannamaria" />
        <GithubCard username="imnotannamaria" />
      </section>
    </div>
  )
}
