"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { ArrowUpRightIcon } from "@phosphor-icons/react"
import { EASE_OUT } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { Spotlight, useSpotlight } from "@/app/components/entrepta/spotlight"
import { useReveal } from "@/app/components/entrepta/reveal"
import { RollingNumber } from "@/app/components/entrepta/rolling-number"
import { ArrowLink } from "@/app/components/entrepta/arrow-link"
import { Skeleton } from "@/app/components/entrepta/skeleton"
import {
  cardVariants,
  CardComment,
  CardFooter,
  CardHeader,
  CardLabel,
  CardMeta,
} from "@/app/components/entrepta/card"
import { CardBlank } from "@/components/ui/card-blank"
import { SHORTLOG_ACTIVE_ROWS, SHORTLOG_DAYS } from "@/lib/github/shortlog-constants"
import type { Shortlog, ShortlogCommit, ShortlogRow } from "@/lib/github/shortlog"
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
  const { onMouseMove, spotlight } = useSpotlight(480)
  const reveal = useReveal()
  const data = state.kind === "ok" || state.kind === "stale" ? state.data : null

  return (
    <motion.div className={cn(cardVariants(), className)} onMouseMove={onMouseMove} {...reveal}>
      <Spotlight {...spotlight} />

      <CardHeader>
        <CardLabel as="h3">git shortlog</CardLabel>
        <CardMeta>last {SHORTLOG_DAYS} days</CardMeta>
      </CardHeader>

      {state.kind === "loading" ? (
        <BodySkeleton />
      ) : data ? (
        <Body data={data} />
      ) : (
        <CardBlank
          className="min-h-[10.5rem] flex-1"
          message={state.kind === "error" ? "couldn't reach github" : "a quiet month"}
        />
      )}

      <CardFooter>
        <CardComment>{goalLine(goal)}</CardComment>
        <ArrowLink external href={siteConfig.socials.github} className="text-mono-sm">
          github
        </ArrowLink>
      </CardFooter>
    </motion.div>
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
 * The hover is the editor's current line.
 *
 * Point at a project and its row takes the highlight an editor gives the line the cursor is
 * on, with a mark in the gutter where git draws a modified line. Its bar lights up and a glint
 * runs along it once; the other rows step back; and the big figure — the month's total —
 * rolls over to that project's own count, with the caption saying what share of the month it
 * was. Leave the list and it rolls back.
 *
 * That last part is the reason for the hover rather than decoration on top of it: the figure
 * and the rows were two readings of the same data that never touched, and now pointing at a
 * row answers the question the bar only gestures at.
 *
 * Mouse and keyboard only. A tap on a phone must go straight to the link, and iOS holds the
 * first tap back as a hover when a mouse handler changes the page, so `pointerType` gates it.
 * Moving between rows never clears the state — only leaving the whole list does — so the
 * figure rolls from one project to the next instead of dipping back to the total between them.
 */
function Body({ data }: { data: Shortlog }) {
  const reduce = useReducedMotion() ?? false
  const [active, setActive] = useState<string | null>(null)
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

  const hover = (slug: string) => ({
    onPointerEnter: (event: React.PointerEvent) => {
      if (event.pointerType === "mouse") setActive(slug)
    },
    onFocus: () => setActive(slug),
  })

  return (
    <>
      <Headline data={data} active={data.rows.find((r) => r.slug === active) ?? null} />

      {/* Whatever height the column gives the card beyond its content goes between the busy
          rows and the quiet ones, not into a gap under the footer. */}
      <div
        className="flex flex-1 flex-col justify-between gap-4"
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") setActive(null)
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActive(null)
        }}
      >
        <motion.ul
          className="m-0 flex list-none flex-col p-0"
          variants={list}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {data.rows.map((row) => (
            <Row
              key={row.slug}
              active={active === row.slug}
              dim={active !== null && active !== row.slug}
              {...hover(row.slug)}
            >
              {/* Name, bar, count. The name truncates and the count never does: the column
                  is ~280px on a phone, and a number cut in half is a wrong number. */}
              <Link
                href={`/projects/${row.slug}`}
                className="focus-ring grid grid-cols-[minmax(0,8.5rem)_1fr_auto] items-center gap-3 rounded-[var(--radius-sm)]"
              >
                <span className="text-mono-sm truncate font-mono text-[var(--fg-primary)] transition-colors duration-200 group-data-active/row:text-[var(--fg-brand-text)]">
                  {row.title}
                </span>
                <span className="relative h-1.5" aria-hidden>
                  <motion.span
                    variants={bar}
                    className="absolute inset-y-0 left-0 overflow-hidden rounded-full bg-[var(--fg-brand)] transition-shadow duration-300 group-data-active/row:shadow-[0_0_14px_color-mix(in_srgb,var(--fg-brand)_60%,transparent)]"
                    style={{ width: `${Math.max(4, (row.commits / max) * 100)}%`, originX: 0 }}
                  >
                    {/* The glint: a fixed gradient that translates, never a gradient string
                        rebuilt per frame. It runs out on hover and snaps back unseen, so it
                        only ever travels one way. `--fg-on-brand` because that is the ink
                        each theme guarantees reads on the brand fill. */}
                    <span className="absolute inset-y-0 left-0 w-1/2 -translate-x-full bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--fg-on-brand)_55%,transparent),transparent)] group-data-active/row:translate-x-[260%] group-data-active/row:transition-transform group-data-active/row:duration-700 group-data-active/row:ease-[var(--ease-out)]" />
                  </motion.span>
                </span>
                <span className="text-mono-sm font-mono whitespace-nowrap text-[var(--fg-muted)] tabular-nums transition-colors duration-200 group-data-active/row:text-[var(--fg-brand-text)]">
                  {row.commits}
                  <span className="sr-only"> commits</span>
                </span>
              </Link>
              {row.latest && <CommitLine project={row.title} commit={row.latest} />}
            </Row>
          ))}
        </motion.ul>

        {data.quiet.length > 0 && (
          <motion.div
            className="flex flex-col gap-1"
            variants={fade}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <h4 className="text-mono-xs m-0 border-t border-dashed border-[var(--border-subtle)] pt-3 font-mono font-normal tracking-[0.08em] text-[var(--fg-muted)] uppercase">
              quiet this month
            </h4>
            <ul className="m-0 flex list-none flex-col p-0">
              {data.quiet.map((row) => (
                <Row
                  key={row.slug}
                  quiet
                  active={active === row.slug}
                  dim={active !== null && active !== row.slug}
                  {...hover(row.slug)}
                >
                  <Link
                    href={`/projects/${row.slug}`}
                    className="focus-ring flex items-baseline justify-between gap-3 rounded-[var(--radius-sm)]"
                  >
                    <span className="text-mono-sm truncate font-mono text-[var(--fg-secondary)] transition-colors duration-200 group-data-active/row:text-[var(--fg-brand-text)]">
                      {row.title}
                    </span>
                    <span className="text-mono-xs font-mono whitespace-nowrap text-[var(--fg-muted)]">
                      {row.latest ? `${row.latest.ago} ago` : "—"}
                    </span>
                  </Link>
                  {row.latest && <CommitLine project={row.title} commit={row.latest} hideAgo />}
                </Row>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </>
  )
}

/**
 * The month's total, or — while a busy row is under the cursor — that project's count and its
 * share of the month.
 *
 * The figure keeps the total's width and sits right-aligned in it, padded with figure spaces
 * rather than shrinking: RollingNumber keys its digits by position, so "127" becoming "66"
 * without the pad would slide both digits a place to the right as they rolled. Padded, the
 * hundreds digit simply goes, and the other two turn where they stand.
 */
function Headline({ data, active }: { data: Shortlog; active: ShortlogRow | null }) {
  const reduce = useReducedMotion() ?? false
  const width = String(data.total).length
  const figure = String(active ? active.commits : data.total).padStart(width, " ")
  const caption = active
    ? `commits to ${active.title} · ${Math.round((active.commits / Math.max(data.total, 1)) * 100)}%`
    : `commits across ${data.active} ${data.active === 1 ? "project" : "projects"}`

  return (
    <div className="flex items-end gap-3">
      <span
        className="text-display-md inline-flex justify-end font-serif italic"
        style={{
          minWidth: `${width * 0.62}em`,
          color: "var(--fg-brand)",
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        <RollingNumber value={figure} height={40} />
      </span>
      <span className="relative mb-1 min-w-0 flex-1">
        <motion.span
          key={caption}
          initial={{ opacity: 0, y: reduce ? 0 : 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.25, ease: EASE_OUT }}
          className="text-mono-sm block truncate font-mono tracking-[0.06em] text-[var(--fg-muted)]"
        >
          {caption}
        </motion.span>
      </span>
    </div>
  )
}

/**
 * One row's frame: the current-line highlight, the gutter mark and the dimming. The children
 * are the row's links; the frame only listens.
 *
 * The highlight and the mark bleed 12px into the card's padding, so the hit area and the text
 * never move — the skin changes and nothing slides out from under the cursor. Rows carry
 * their own vertical padding instead of a gap between them, so the highlights meet and the
 * pointer never falls into a space that belongs to no row.
 *
 * A quiet row rests at 70% — the honest half of the card, but the second half — and comes up
 * to full when it is the one pointed at, like the rest.
 */
function Row({
  active,
  dim,
  quiet,
  children,
  ...handlers
}: {
  active: boolean
  dim: boolean
  quiet?: boolean
  children: React.ReactNode
  onPointerEnter: (event: React.PointerEvent) => void
  onFocus: () => void
}) {
  return (
    <li
      data-active={active || undefined}
      className="group/row relative py-2 transition-opacity duration-200"
      style={{ opacity: active ? 1 : dim ? 0.4 : quiet ? 0.7 : 1 }}
      {...handlers}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -right-3 -left-3 rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--fg-brand)_8%,transparent)] opacity-0 transition-opacity duration-200 group-data-active/row:opacity-100"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-2.5 -left-3 w-0.5 scale-y-0 rounded-full bg-[var(--fg-brand)] transition-transform duration-200 ease-[var(--ease-out)] group-data-active/row:scale-y-100"
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
  hideAgo,
}: {
  project: string
  commit: ShortlogCommit
  hideAgo?: boolean
}) {
  return (
    <a
      href={commit.url}
      target="_blank"
      rel="noopener noreferrer"
      title={commit.message}
      aria-label={`Last commit to ${project}, ${commit.ago} ago: ${commit.message}`}
      className="focus-ring group/commit text-mono-xs grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-[var(--radius-sm)] font-mono text-[var(--fg-muted)] transition-colors duration-200 group-data-active/row:text-[var(--fg-secondary)]"
    >
      <span className="rounded-[3px] px-1 text-[var(--fg-brand-text)] transition-colors duration-200 group-data-active/row:bg-[color-mix(in_srgb,var(--fg-brand)_14%,transparent)]">
        {commit.sha}
      </span>
      <span className="truncate group-hover/commit:underline group-hover/commit:decoration-[var(--border-strong)] group-hover/commit:underline-offset-2">
        {commit.message}
      </span>
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        {!hideAgo && commit.ago}
        {/* Space held for it always, so the line never reflows when it appears. */}
        <ArrowUpRightIcon
          aria-hidden
          size={10}
          className="-translate-x-1 text-[var(--fg-brand-text)] opacity-0 transition-[opacity,translate] duration-200 group-data-active/row:translate-x-0 group-data-active/row:opacity-100"
        />
      </span>
    </a>
  )
}

/** The figure and the rows in grey, at their own sizes, so nothing moves when GitHub answers. */
function BodySkeleton() {
  return (
    <>
      <div className="flex flex-1 flex-col gap-4" aria-hidden>
        <div className="flex items-end gap-3">
          <Skeleton style={{ width: 64, height: 40, borderRadius: 4 }} />
          <Skeleton className="mb-1" style={{ width: 170, height: 10, borderRadius: 3 }} />
        </div>
        <div className="flex flex-col">
          {Array.from({ length: SHORTLOG_ACTIVE_ROWS - 1 }, (_, i) => (
            <div key={i} className="flex flex-col gap-2 py-2">
              <div className="grid grid-cols-[minmax(0,8.5rem)_1fr_auto] items-center gap-3">
                <Skeleton delay={i * 0.05} style={{ width: "70%", height: 10, borderRadius: 3 }} />
                <Skeleton
                  delay={i * 0.05}
                  style={{ width: `${88 - i * 20}%`, height: 6, borderRadius: 999 }}
                />
                <Skeleton delay={i * 0.05} style={{ width: 18, height: 10, borderRadius: 3 }} />
              </div>
              <Skeleton
                delay={i * 0.05}
                style={{ width: `${80 - i * 8}%`, height: 8, borderRadius: 3 }}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Outside the aria-hidden box: a status under a hidden ancestor is never announced. */}
      <span className="sr-only" role="status">
        Loading recent commits
      </span>
    </>
  )
}
