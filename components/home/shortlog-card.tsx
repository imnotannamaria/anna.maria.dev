"use client"

import Link from "next/link"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { ArrowUpRightIcon } from "@phosphor-icons/react"
import { EASE_OUT } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { Tip } from "@/components/ui/tip"
import { SpotlightCard } from "@/app/components/entrepta/spotlight-card"
import { RollingNumber } from "@/app/components/entrepta/rolling-number"
import { ArrowLink } from "@/app/components/entrepta/arrow-link"
import { Skeleton } from "@/app/components/entrepta/skeleton"
import {
  CardComment,
  CardFooter,
  CardHeader,
  CardLabel,
  CardMeta,
} from "@/app/components/entrepta/card"
import { SHORTLOG_DAYS } from "@/lib/github/shortlog-constants"
import type { Shortlog, ShortlogCommit } from "@/lib/github/shortlog"
import type { CardState } from "@/lib/showcase/state"
import { siteConfig } from "@/lib/site-config"

export type ShortlogGoal = { shipped: number; goal: number; yearShort: string }

/**
 * `git shortlog -sn` for the projects on this site: commits in the last thirty days, one row
 * per project, busiest first, each bar measured against the busiest, and under every row the
 * last thing committed there. Below them, the projects that were quiet this month, dimmed,
 * with how long they have been.
 *
 * It replaced "oss '26", a count of projects shipped this year against a goal of six. That
 * card only had something to say until the goal was met; at 8 / 6 it was the same card every
 * day for the rest of the year. This one moves every week and says where the time is going,
 * and what was done with it. The goal survives as the footer comment, the size it earned once
 * it was met.
 *
 * It is the tall card of the section: the right column on its own, beside the featured
 * project and the featured post stacked. The first version sat above the post in that column
 * and made the featured project stretch to match two cards, half of it empty. Tall, it has the
 * room for the last commits, which is what fills it — not padding.
 *
 * The bars have no track: they are a chart against each other, not progress toward anything,
 * and a track would make the top row read as "100% done".
 */
export function ShortlogCard({
  state,
  goal,
  className,
}: {
  state: CardState<Shortlog>
  goal: ShortlogGoal
  className?: string
}) {
  const data = state.kind === "ok" || state.kind === "stale" ? state.data : null

  return (
    <SpotlightCard glow={480} className={className}>
      <CardHeader>
        <CardLabel as="h3">git shortlog</CardLabel>
        <CardMeta>last {SHORTLOG_DAYS} days</CardMeta>
      </CardHeader>

      {state.kind === "loading" ? (
        <BodySkeleton />
      ) : data ? (
        <Body data={data} />
      ) : (
        <Terminal kind={state.kind === "error" ? "error" : "empty"} />
      )}

      <CardFooter>
        <CardComment>{goalLine(goal)}</CardComment>
        <ArrowLink external href={siteConfig.socials.github} className="text-mono-sm">
          github
        </ArrowLink>
      </CardFooter>
    </SpotlightCard>
  )
}

/** "8 shipped in '26 · goal 6, +2". A goal passed is said as one, never as "-2 to go". */
function goalLine({ shipped, goal, yearShort }: ShortlogGoal) {
  const over = shipped - goal
  const status = over > 0 ? `goal ${goal}, +${over}` : over === 0 ? "goal met" : `${-over} to go`
  return `${shipped} shipped in ’${yearShort} · ${status}`
}

// ─── The body ─────────────────────────────────────────────────────────────────

/**
 * The hover is quiet on purpose: every row is a link, so it has to answer the pointer, and
 * that is all it has to do.
 *
 * The row under the cursor takes a faint version of the highlight an editor gives the line the
 * cursor is on, with a thin mark in the gutter where git draws a changed line. Its bar lights
 * up and a glint runs along it once; its count and commit line come up a step in contrast; the
 * arrow on the commit line says that one leaves the site, and pointing at the commit itself
 * underlines it. The rest of the card holds still. A first version also dimmed the other rows
 * and rolled the big figure to the row's count, and that was too much for a card whose job is
 * to be read.
 *
 * All of it is CSS on `:hover` and `:focus-within`, so there is no state and nothing for a
 * render to do. Tailwind v4 puts `hover:` behind `@media (hover: hover)`, which is what keeps a
 * tap on a phone going straight to the link.
 */
function Body({ data }: { data: Shortlog }) {
  const reduce = useReducedMotion() ?? false
  const max = data.rows[0]?.commits ?? 1

  // The trigger is the list, which has an honest box; a bar at scaleX 0 has no area and an
  // observer on it would never fire. The bars hear "show" through variants.
  const list: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.07, delayChildren: reduce ? 0 : 0.2 } },
  }
  const bar: Variants = {
    hidden: { scaleX: reduce ? 1 : 0 },
    show: { scaleX: 1, transition: { duration: reduce ? 0 : 0.6, ease: EASE_OUT } },
  }
  const fade: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: reduce ? 0 : 0.4 } },
  }

  return (
    <>
      <Figure
        value={data.total}
        caption={
          data.active === 0
            ? `commits in the last ${SHORTLOG_DAYS} days`
            : `commits across ${data.active} ${data.active === 1 ? "project" : "projects"}`
        }
      />

      {/* Whatever height the column gives the card beyond its content goes between the busy
          rows and the quiet ones, not into a gap under the footer. */}
      <div className="flex flex-1 flex-col justify-between gap-4">
        {/* A month with no commits is still `ok`: every project lands in the quiet list with
            its last commit, which says more than an empty frame would. */}
        {data.rows.length > 0 && (
          <motion.ul
            className="m-0 flex list-none flex-col p-0"
            variants={list}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {data.rows.map((row) => (
              <Row key={row.slug}>
                {/* Name, bar, count. The name truncates and the count never does: the column
                  is ~280px on a phone, and a number cut in half is a wrong number. */}
                <Link
                  href={`/projects/${row.slug}`}
                  className="focus-ring grid grid-cols-[minmax(0,8.5rem)_1fr_auto] items-center gap-3 rounded-[var(--radius-sm)]"
                >
                  <span className="text-mono-sm truncate font-mono text-[var(--fg-primary)]">
                    {row.title}
                  </span>
                  <span className="relative h-1.5" aria-hidden>
                    <motion.span
                      variants={bar}
                      className="absolute inset-y-0 left-0 overflow-hidden rounded-full bg-[var(--fg-brand)] transition-shadow duration-300 group-focus-within/row:shadow-[0_0_14px_color-mix(in_srgb,var(--fg-brand)_60%,transparent)] group-hover/row:shadow-[0_0_14px_color-mix(in_srgb,var(--fg-brand)_60%,transparent)]"
                      style={{ width: `${Math.max(4, (row.commits / max) * 100)}%`, originX: 0 }}
                    >
                      {/* The glint: a fixed gradient that translates, never a gradient string
                        rebuilt per frame. It runs out on hover and snaps back unseen, so it
                        only ever travels one way. `--fg-on-brand` because that is the ink
                        each theme guarantees reads on the brand fill. */}
                      <span className="absolute inset-y-0 left-0 w-1/2 -translate-x-full bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--fg-on-brand)_55%,transparent),transparent)] group-focus-within/row:translate-x-[260%] group-focus-within/row:transition-transform group-focus-within/row:duration-700 group-focus-within/row:ease-[var(--ease-out)] group-hover/row:translate-x-[260%] group-hover/row:transition-transform group-hover/row:duration-700 group-hover/row:ease-[var(--ease-out)]" />
                    </motion.span>
                  </span>
                  <span className="text-mono-sm font-mono whitespace-nowrap text-[var(--fg-muted)] tabular-nums transition-colors duration-150 group-focus-within/row:text-[var(--fg-secondary)] group-hover/row:text-[var(--fg-secondary)]">
                    {row.commits}
                    <span className="sr-only"> commits</span>
                  </span>
                </Link>
                {row.latest && <CommitLine project={row.title} commit={row.latest} />}
              </Row>
            ))}
          </motion.ul>
        )}

        {data.quiet.length > 0 && (
          <motion.div
            className="flex flex-col gap-1"
            variants={fade}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <QuietHeading />
            <ul className="m-0 flex list-none flex-col p-0">
              {data.quiet.map((row) => (
                <Row key={row.slug}>
                  <Link
                    href={`/projects/${row.slug}`}
                    className="focus-ring flex items-baseline justify-between gap-3 rounded-[var(--radius-sm)]"
                  >
                    {/* min-w-0: a flex item won't shrink below its content without it, and
                        `truncate` would never get the chance to cut. */}
                    <span className="text-mono-sm min-w-0 truncate font-mono text-[var(--fg-muted)] transition-colors duration-150 group-focus-within/row:text-[var(--fg-secondary)] group-hover/row:text-[var(--fg-secondary)]">
                      {row.title}
                    </span>
                    <span className="text-mono-xs font-mono whitespace-nowrap text-[var(--fg-muted)]">
                      {row.latest ? `${row.latest.ago} ago` : "—"}
                    </span>
                  </Link>
                  {row.latest && <CommitLine project={row.title} commit={row.latest} quiet />}
                </Row>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </>
  )
}

/** The rule and label over the quiet rows, shared with the skeleton so the two can't drift. */
function QuietHeading() {
  return (
    <h4 className="text-mono-xs m-0 border-t border-dashed border-[var(--border-subtle)] pt-3 font-mono font-normal tracking-[0.08em] text-[var(--fg-muted)] uppercase">
      quiet this month
    </h4>
  )
}

/**
 * One row's frame: the highlight and the gutter mark. The children are the row's links.
 *
 * Both bleed 12px into the card's padding, so the hit area and the text never move. Rows carry
 * their own vertical padding instead of a gap between them, so the highlights meet and the
 * pointer never falls into a space that belongs to no row.
 *
 * A quiet row is quieter in its colours, not in its opacity: its name is muted and its sha
 * loses the brand ink, and both come up when the row is pointed at. It used to sit at 70%
 * opacity, which put muted text on the card at 3.3:1 in dark mode and 3.0:1 in light — under
 * AA, on the half of the card that is text and nothing else.
 */
function Row({ children }: { children: React.ReactNode }) {
  return (
    <li className="group/row relative py-2">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -right-3 -left-3 rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--fg-brand)_5%,transparent)] opacity-0 transition-opacity duration-150 group-focus-within/row:opacity-100 group-hover/row:opacity-100"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-3 -left-3 w-0.5 rounded-full bg-[var(--fg-brand)] opacity-0 transition-opacity duration-150 group-focus-within/row:opacity-100 group-hover/row:opacity-100"
      />
      <div className="relative flex flex-col gap-1">{children}</div>
    </li>
  )
}

/**
 * sha, message, age, and the arrow that says it leaves the site. One line that truncates;
 * `title` keeps the whole message.
 *
 * The accessible name says which project and that it is a commit: eight links that read as
 * bare commit messages, out of context in a screen reader's link list, would be noise.
 */
function CommitLine({
  project,
  commit,
  quiet,
}: {
  project: string
  commit: ShortlogCommit
  /** A quiet row prints its age beside the name, and keeps its sha out of the brand ink. */
  quiet?: boolean
}) {
  return (
    // The row truncates the message; the tooltip is where the rest of it can be read.
    <Tip label={commit.message} wrap>
      <a
        href={commit.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Last commit to ${project}, ${commit.ago} ago: ${commit.message}`}
        className="focus-ring group/commit text-mono-xs grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-[var(--radius-sm)] font-mono text-[var(--fg-muted)] transition-colors duration-150 group-focus-within/row:text-[var(--fg-secondary)] group-hover/row:text-[var(--fg-secondary)]"
      >
        <span
          className={cn(
            "transition-colors duration-150",
            quiet
              ? "group-focus-within/row:text-[var(--fg-brand-text)] group-hover/row:text-[var(--fg-brand-text)]"
              : "text-[var(--fg-brand-text)]",
          )}
        >
          {commit.sha}
        </span>
        <span className="truncate group-hover/commit:underline group-hover/commit:decoration-[var(--border-strong)] group-hover/commit:underline-offset-2">
          {commit.message}
        </span>
        <span className="inline-flex items-center gap-1 whitespace-nowrap">
          {!quiet && commit.ago}
          {/* Space held for it always, so the line never reflows when it appears. */}
          <ArrowUpRightIcon
            aria-hidden
            size={10}
            className="opacity-0 transition-opacity duration-150 group-focus-within/row:opacity-100 group-hover/row:opacity-100"
          />
        </span>
      </a>
    </Tip>
  )
}

/**
 * The big figure and its caption. A number rolls in; anything else (the error's dash) is set
 * still, with words for a screen reader, since "em dash" is not a count.
 */
function Figure({ value, caption }: { value: number | null; caption: string }) {
  return (
    <div className="flex items-end gap-3">
      <span
        className="text-display-md font-serif italic"
        style={{
          color: value === null ? "var(--fg-muted)" : "var(--fg-brand)",
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {value === null ? (
          <>
            <span aria-hidden className="block h-10 leading-10">
              —
            </span>
            <span className="sr-only">unknown</span>
          </>
        ) : (
          <RollingNumber value={value} height={40} />
        )}
      </span>
      <span className="text-mono-sm mb-1 font-mono tracking-[0.06em] text-[var(--fg-muted)]">
        {caption}
      </span>
    </div>
  )
}

const COMMAND = `git shortlog -sn --since=${SHORTLOG_DAYS}.days.ago`

/**
 * Empty and error, as the command and what it printed.
 *
 * They used to be one muted line centred in a dashed frame, which said what happened and
 * nothing about the card. This is the card's own premise played straight: the header already
 * reads `git shortlog`, so when there is nothing to chart, the body is a terminal pane showing
 * that command run and its output, with a caret waiting at a fresh prompt. The figure stays on
 * top so the card keeps its shape — `0` when there is genuinely nothing, a dash when the answer
 * never came, which is not the same as zero.
 *
 * `empty` only happens when no project has a `github` URL, which is a fresh fork of this site
 * rather than a quiet month (a quiet month is `ok`, with every project in the quiet list). So
 * its output says what to do about it. `error` never prints why: the reason is for the logs,
 * and a status code on the home page tells a visitor nothing they can use.
 *
 * The pane is `--bg-canvas`, a step below the card, so it reads as inset rather than as
 * another card on top. The text is real text; only the prompts and the caret are decoration.
 */
function Terminal({ kind }: { kind: "empty" | "error" }) {
  return (
    <>
      <Figure
        value={kind === "error" ? null : 0}
        caption={
          kind === "error"
            ? `commits in the last ${SHORTLOG_DAYS} days`
            : "projects linked to github"
        }
      />

      <div className="text-mono-sm flex min-h-48 flex-1 flex-col gap-1.5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 font-mono [overflow-wrap:anywhere]">
        <p className="m-0 text-[var(--fg-primary)]">
          <Prompt />
          {COMMAND}
        </p>

        {kind === "error" ? (
          <>
            <p className="m-0 text-[var(--fg-secondary)]">
              {/* Spaces as expressions: a space between a tag and text is the kind the JSX
                  whitespace rules are allowed to eat, and "fatal:github" is what that looks like. */}
              <span className="text-[var(--status-error-fg)]">fatal:</span>
              {" github.com didn\u2019t answer"}
            </p>
            <p className="m-0 text-[var(--fg-muted)]">
              <span aria-hidden>{"# "}</span>the counts come back on their own
            </p>
          </>
        ) : (
          <>
            <p className="m-0 text-[var(--fg-secondary)]">no project here points at a repository</p>
            <p className="m-0 text-[var(--fg-muted)]">
              <span aria-hidden>{"# "}</span>add a github url to a project&rsquo;s frontmatter
            </p>
          </>
        )}

        <p aria-hidden className="m-0 mt-1">
          <Prompt />
          <span className="type-caret" />
        </p>

        <div className="mt-auto pt-4">
          <ArrowLink asChild className="text-mono-sm">
            <Link href="/projects">all projects</Link>
          </ArrowLink>
        </div>
      </div>
    </>
  )
}

function Prompt() {
  return (
    <span aria-hidden className="text-[var(--fg-brand)]">
      ${" "}
    </span>
  )
}

/**
 * The loaded card in grey, piece for piece: the figure, four busy rows with their commit lines,
 * the dashed rule and its label, and four quiet rows. Every line sits in
 * a box with the real line's type size, so its height is the real height and nothing moves
 * when GitHub answers. The label is real text — it is known before anything loads.
 */
function BodySkeleton() {
  return (
    <>
      <div className="flex flex-1 flex-col gap-4" aria-hidden>
        <div className="flex items-end gap-3">
          <Skeleton style={{ width: 74, height: 40, borderRadius: 4 }} />
          <Line size="sm" className="mb-1">
            <Skeleton style={{ width: 180, height: 9, borderRadius: 3 }} />
          </Line>
        </div>

        <div className="flex flex-1 flex-col justify-between gap-4">
          <div className="flex flex-col">
            {[88, 46, 22, 20].map((bar, i) => (
              <div key={bar} className="flex flex-col gap-1 py-2">
                <div className="grid grid-cols-[minmax(0,8.5rem)_1fr_auto] items-center gap-3">
                  <Line size="sm">
                    <Skeleton delay={i * 0.05} style={{ width: `${70 - i * 8}%`, height: 9 }} />
                  </Line>
                  <Skeleton
                    delay={i * 0.05}
                    style={{ width: `${bar}%`, height: 6, borderRadius: 999 }}
                  />
                  <Skeleton delay={i * 0.05} style={{ width: 16, height: 9, borderRadius: 3 }} />
                </div>
                <CommitSkeleton delay={i * 0.05} width={78 - i * 9} />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <QuietHeading />
            <div className="flex flex-col">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-1 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <Line size="sm">
                      <Skeleton
                        delay={0.2 + i * 0.05}
                        style={{ width: 72 - i * 6, height: 9, borderRadius: 3 }}
                      />
                    </Line>
                    <Skeleton
                      delay={0.2 + i * 0.05}
                      style={{ width: 44, height: 8, borderRadius: 3 }}
                    />
                  </div>
                  <CommitSkeleton delay={0.2 + i * 0.05} width={70 - i * 7} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Outside the aria-hidden box: a status under a hidden ancestor is never announced. */}
      <span className="sr-only" role="status">
        Loading recent commits
      </span>
    </>
  )
}

/** A box one real line tall at the given size, so a grey bar inside it takes that height. */
function Line({
  size,
  className,
  children,
}: {
  size: "sm" | "xs"
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        "flex items-center font-mono",
        size === "sm" ? "text-mono-sm" : "text-mono-xs",
        className,
      )}
    >
      {"\u200b"}
      {children}
    </span>
  )
}

/** sha, message, age — the commit line's three columns, in grey. */
function CommitSkeleton({ delay, width }: { delay: number; width: number }) {
  return (
    <Line size="xs" className="gap-2">
      <Skeleton delay={delay} style={{ width: 44, height: 8, borderRadius: 3 }} />
      <Skeleton delay={delay} style={{ width: `${width}%`, height: 8, borderRadius: 3 }} />
    </Line>
  )
}
