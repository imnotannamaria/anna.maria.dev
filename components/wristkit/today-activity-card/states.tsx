"use client"

/**
 * wristkit v2's card, on this site's surface.
 *
 * The markup, the five states and the stylesheet are wristkit's. Three things are the site's,
 * because v2 as it ships stands still and every other card here does not:
 *
 * - the surface is entrepta's Card (`cardVariants()`), with the spotlight trailing the cursor;
 * - the rings arrive: each one fades up and sweeps from empty to its value, outer first, and
 *   the metric rows follow;
 * - on hover the rings thicken, in `styles.css`.
 *
 * It is `cardVariants()` with the hook rather than `SpotlightCard` because the panel is a
 * `section` that drives its own entrance: the variant labels below start here and reach the
 * rings and the rows through context.
 *
 * `index.tsx` and `load.ts` beside this are the site's too: the first does not re-export the
 * loader (that pulls the Postgres client into client bundles), the second reads the shared
 * connection through `lib/db/client.ts`.
 */

import type * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { cardVariants } from "@/app/components/entrepta/card"
import { Spotlight, useSpotlight } from "@/app/components/entrepta/spotlight"
import { EASE_OUT, revealViewport } from "@/lib/motion"
import { cn } from "@/lib/utils"
import type { TodayData } from "./load"
import "./styles.css"

const METRICS = [
  { id: "move", label: "Move", value: "kcal", goal: "kcalGoal", unit: "kcal" },
  {
    id: "exercise",
    label: "Exercise",
    value: "exerciseMinutes",
    goal: "exerciseGoal",
    unit: "min",
  },
  { id: "steps", label: "Steps", value: "steps", goal: "stepsGoal", unit: "steps" },
] as const

type DisplayKind = "loading" | "empty" | "error" | "stale" | "ok"

/**
 * The rings. They answer to the `hidden` and `show` labels of the panel around them.
 *
 * The sweep is a variant driven from the panel, never a `whileInView` on the circle: an
 * IntersectionObserver aimed at an SVG child is unreliable, and in practice only the outer
 * ring fired while the inner two snapped into place. The panel is an HTML element with an
 * honest box, so it watches and the label reaches all three.
 *
 * The group scales and fades in as well as the arc drawing, because the draw alone is not
 * equal to the eye: the same animation covers 80% of a circle for move and a tenth of one for
 * exercise on a quiet day, and the short ones read as popping into place.
 */
export function ActivityRings({ data, kind = "ok" }: { data?: TodayData; kind?: DisplayKind }) {
  // Asked here, not inherited: the reduced-motion block in the stylesheet only reaches CSS.
  const reduce = useReducedMotion() ?? false

  return (
    <svg className="wk-rings" viewBox="0 0 200 200" role="img" aria-label="Activity rings">
      <title>Activity rings</title>
      {METRICS.map((metric, index) => {
        const radius = 84 - index * 23
        const circumference = 2 * Math.PI * radius
        const value = data?.[metric.value] ?? 0
        const goal = data?.[metric.goal] ?? 0
        const progress =
          goal > 0 && Number.isFinite(value) ? Math.max(0, Math.min(value / goal, 1)) : 0
        return (
          <motion.g
            key={metric.id}
            className={`wk-ring wk-ring--${metric.id}`}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            variants={{
              hidden: { opacity: 0, scale: reduce ? 1 : 0.84 },
              show: {
                opacity: 1,
                scale: 1,
                transition: reduce
                  ? { duration: 0 }
                  : { duration: 0.5, ease: EASE_OUT, delay: index * 0.12 },
              },
            }}
          >
            <circle className="wk-ring-track" cx="100" cy="100" r={radius} />
            {kind === "loading" ? (
              // The orbit is CSS, on `stroke-dashoffset`. Motion stays off this circle, or the
              // two would be driving one property.
              <circle
                className="wk-ring-value"
                cx="100"
                cy="100"
                r={radius}
                pathLength="100"
                strokeDasharray="18 82"
                transform="rotate(-90 100 100)"
              />
            ) : progress > 0 ? (
              // A zero-length dash with round caps still paints a dot, so an empty ring draws
              // no value arc at all.
              //
              // Measured in real length, not `pathLength="100"` as wristkit ships it: on a
              // Motion element `pathLength` is Motion's own 0-to-1 value and it would take over
              // the dash pattern.
              <motion.circle
                className="wk-ring-value"
                cx="100"
                cy="100"
                r={radius}
                strokeDasharray={circumference}
                transform="rotate(-90 100 100)"
                variants={{
                  hidden: { strokeDashoffset: circumference },
                  show: {
                    strokeDashoffset: circumference * (1 - progress),
                    transition: reduce
                      ? { duration: 0 }
                      : { duration: 1.1, ease: EASE_OUT, delay: 0.2 + index * 0.12 },
                  },
                }}
              />
            ) : null}
          </motion.g>
        )
      })}
      <path className="wk-ring-center" d="M94 99h12m-5-5 5 5-5 5" />
    </svg>
  )
}

function ActivityPanel({
  kind,
  data,
  className,
}: {
  kind: DisplayKind
  data?: TodayData
  className?: string
}) {
  const reduce = useReducedMotion() ?? false
  const { onMouseMove, spotlight } = useSpotlight(380)

  const status = kind === "ok" ? "synced" : kind
  const notes: Record<DisplayKind, React.ReactNode> = {
    ok: "Up to date",
    loading: "Syncing your activity…",
    empty: "No data yet. Run the Shortcut on your iPhone.",
    error: "Something went wrong. We couldn't load today's activity.",
    stale: `Last sync ${data?.hoursSinceSync ?? 0}h ago. Run the Shortcut to update.`,
  }
  return (
    <motion.section
      // `gap-0`: the body carries its own 32px of air above and below, and the Card's gap on
      // top of that would push the three parts apart.
      className={cn(cardVariants(), "wk-activity gap-0", className)}
      data-state={kind}
      aria-label="Today's activity"
      aria-busy={kind === "loading"}
      onMouseMove={onMouseMove}
      // The surface itself does not animate here: on the home page the tile brings it in.
      // These labels only start the rings and the rows.
      initial="hidden"
      whileInView="show"
      viewport={revealViewport}
    >
      <Spotlight {...spotlight} />

      <header className="wk-activity-header">
        <span className="wk-activity-label">
          <span aria-hidden>↗</span> Today / Activity
        </span>
        <span className="wk-activity-status">
          <span aria-hidden className="wk-status-dot" />
          {status}
        </span>
      </header>
      <div className="wk-activity-body">
        <ActivityRings kind={kind} data={data} />
        <dl className="wk-metrics">
          {METRICS.map((metric, index) => (
            <motion.div
              key={metric.id}
              className={`wk-metric wk-ring--${metric.id}`}
              // The rings sweep for over a second; rows that snap in at frame one beside them
              // make the card read as half-animated.
              variants={{
                hidden: { opacity: 0, y: reduce ? 0 : 8 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: reduce
                    ? { duration: 0 }
                    : { duration: 0.4, ease: EASE_OUT, delay: 0.3 + index * 0.1 },
                },
              }}
            >
              <dt>
                <span className="wk-metric-dot" aria-hidden />
                {metric.label}
              </dt>
              <dd>
                <span className="wk-metric-value">
                  {data ? Math.round(data[metric.value]).toLocaleString("en-US") : "—"}
                </span>
                <span className="wk-metric-goal">
                  {data ? `/ ${data[metric.goal].toLocaleString("en-US")} ` : ""}
                  {metric.unit}
                </span>
              </dd>
            </motion.div>
          ))}
        </dl>
      </div>
      <footer className="wk-activity-footer">
        <span aria-live="polite">{notes[kind]}</span>
        {kind === "ok" && data ? (
          <time dateTime={data.lastSyncIso}>Synced {data.lastSyncLabel}</time>
        ) : null}
        {kind === "empty" ? <span>Install Shortcut to connect.</span> : null}
        {kind === "error" ? <span>Please try again later.</span> : null}
      </footer>
    </motion.section>
  )
}

export function TodayActivityCardLoading({ className }: { className?: string }) {
  return <ActivityPanel kind="loading" className={className} />
}
export function TodayActivityCardEmpty({ className }: { className?: string }) {
  return <ActivityPanel kind="empty" className={className} />
}
export function TodayActivityCardError({ className }: { className?: string }) {
  return <ActivityPanel kind="error" className={className} />
}
export function TodayActivityCardStale({
  data,
  className,
}: {
  data: TodayData
  className?: string
}) {
  return <ActivityPanel kind="stale" data={data} className={className} />
}
export function TodayActivityCardOk({ data, className }: { data: TodayData; className?: string }) {
  return <ActivityPanel kind="ok" data={data} className={className} />
}
