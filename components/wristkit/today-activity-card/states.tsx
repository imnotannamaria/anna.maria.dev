"use client"

import type * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { revealViewport } from "@/components/ui/reveal"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import type { TodayData } from "./load"

const colors = {
  move: "var(--fg-brand)",
  exercise: "#10b981",
  steps: "#f59e0b",
  danger: "#f43f5e",
  warn: "#f59e0b",
}

function clamp01(x: number): number {
  if (Number.isNaN(x) || !Number.isFinite(x)) return 0
  return Math.min(1, Math.max(0, x))
}

/**
 * The rings are unchanged in shape; what's new is that they arrive instead of
 * appearing. Each one sweeps from empty to its value, outer first.
 *
 * The draw runs through Motion on `strokeDashoffset`. The hover response is CSS
 * on `stroke-width` — a presentation attribute, so a stylesheet can take it over
 * — because mixing the two on one element means every hover restarts the sweep.
 * Splitting them also means the hover inherits the global reduced-motion reset
 * for free, while the sweep asks `useReducedMotion` itself.
 *
 * The sweep is a variant driven from `Panel`, not a `whileInView` on the circle.
 * An IntersectionObserver aimed at an SVG child is unreliable — in practice only
 * the outer ring ever fired and the inner two snapped into place. The panel is an
 * HTML element with an honest box, so watching that works, and the label reaches
 * all three from one place.
 */
function Ring({
  r,
  value,
  max,
  color,
  cx,
  cy,
  index = 0,
}: {
  r: number
  value: number
  max: number
  color: string
  cx: number
  cy: number
  index?: number
}) {
  const reduce = useReducedMotion() ?? false
  const circ = 2 * Math.PI * r
  const p = clamp01(max > 0 ? value / max : 0)

  return (
    /*
     * The group scales and fades in; the arc draws inside it.
     *
     * The draw alone was not enough and it was never a bug: all three rings run
     * the same animation, but "the same animation" covers 80% of a circle for
     * move and about 10% for exercise on a 3-of-30-minute day. Identical motion,
     * an eighth of the distance — the inner rings read as popping into place.
     * The arrival is what makes each ring legible whatever its value is.
     */
    <motion.g
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
      variants={{
        hidden: { opacity: 0, scale: reduce ? 1 : 0.84 },
        show: {
          opacity: 1,
          scale: 1,
          transition: reduce
            ? { duration: 0 }
            : { duration: 0.5, ease: [0.2, 0.8, 0.2, 1], delay: index * 0.12 },
        },
      }}
    >
      {/* The track thickens with the arc. Left behind at 9 while the arc went to
          12, the arc overflowed its own track by 1.5px a side and the ring read
          as a rendering fault rather than a response. */}
      <circle
        className="wk-track"
        style={{ transitionDelay: `${index * 70}ms` }}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={9}
        strokeOpacity={0.18}
      />
      <motion.circle
        className="wk-ring"
        style={{ transitionDelay: `${index * 70}ms` }}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={9}
        strokeLinecap="round"
        strokeDasharray={circ}
        transform={`rotate(-90 ${cx} ${cy})`}
        variants={{
          hidden: { strokeDashoffset: circ },
          show: {
            strokeDashoffset: circ * (1 - p),
            transition: reduce
              ? { duration: 0 }
              : { duration: 1.1, ease: [0.2, 0.8, 0.2, 1], delay: 0.2 + index * 0.12 },
          },
        }}
      />
    </motion.g>
  )
}

/**
 * The card surface. Everything it does on hover — background, lift, shadow, and
 * the rings swelling inside it — lives in `.wk-panel` in globals.css.
 *
 * It used to be a `useState` re-rendering the whole card on every pointer enter
 * to do what `:hover` does for free, which is the pattern the contributions card
 * was rebuilt to get rid of. As CSS it also inherits the global reduced-motion
 * reset, which the JS version never did.
 */
function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  const { onMouseMove, spotlight } = useSpotlight(380)

  return (
    <motion.section
      className={`wk-panel ${className ?? ""}`}
      onMouseMove={onMouseMove}
      initial="hidden"
      whileInView="show"
      viewport={revealViewport}
      style={{
        containerType: "inline-size",
        color: "var(--fg-primary)",
        fontFamily: "var(--font-mono)",
      }}
    >
      <Spotlight {...spotlight} />
      {children}
    </motion.section>
  )
}

function Header({
  status,
  statusColor,
  live,
}: {
  status: string
  statusColor: string
  live?: boolean
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <h3
        className="inline-flex items-center gap-1.5"
        style={{
          margin: 0,
          fontWeight: 400,
          color: "var(--fg-secondary)",
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        <span aria-hidden="true" style={{ color: "var(--fg-brand)", fontSize: 10 }}>
          ◆
        </span>
        today / activity
      </h3>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          color: statusColor,
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {live && (
          <span
            style={{
              display: "inline-block",
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "currentColor",
              animation: "cursor-blink 1.2s step-start infinite",
            }}
          />
        )}
        {status}
      </span>
    </div>
  )
}

/** `index` only orders the entrance; the rows are otherwise identical. */
function MetricRow({
  dot,
  label,
  value,
  suffix,
  index = 0,
}: {
  dot: string
  label: string
  value: React.ReactNode
  suffix?: string
  index?: number
}) {
  // Asked here, not inherited: the global prefers-reduced-motion block only
  // zeroes CSS, and this row is animated through Motion like the rings above it.
  const reduce = useReducedMotion() ?? false

  return (
    <motion.div
      style={{ display: "flex", alignItems: "baseline", gap: 10 }}
      // The rings sweep for over a second; rows that snap in at frame one beside
      // them is what made the card read as half-animated.
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : 8 },
        show: {
          opacity: 1,
          y: 0,
          transition: reduce
            ? { duration: 0 }
            : { duration: 0.4, ease: [0.2, 0.8, 0.2, 1], delay: 0.3 + index * 0.1 },
        },
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: dot,
          flexShrink: 0,
          marginTop: 4,
          opacity: 0.7,
        }}
      />
      <span
        style={{
          color: "var(--fg-muted)",
          fontSize: 10,
          letterSpacing: "0.12em",
          minWidth: 64,
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span style={{ flex: 1, minWidth: 0, textAlign: "right" }}>
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 26,
            fontWeight: 400,
            fontStyle: "italic",
          }}
        >
          {value}
        </span>
        {suffix ? (
          <span style={{ color: "var(--fg-muted)", marginLeft: 6, fontSize: 11 }}>{suffix}</span>
        ) : null}
      </span>
    </motion.div>
  )
}

function Footer({
  left,
  right,
  style: extraStyle,
}: {
  left: React.ReactNode
  right: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        marginTop: 14,
        paddingTop: 12,
        borderTop: "1px dashed var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        ...extraStyle,
      }}
    >
      <span style={{ color: "var(--fg-muted)", fontSize: 11 }}>{left}</span>
      <span style={{ color: "var(--fg-secondary)", fontSize: 11 }}>{right}</span>
    </div>
  )
}

export function TodayActivityCardLoading({ className }: { className?: string }) {
  const cx = 72,
    cy = 72
  return (
    <Panel className={className}>
      <Header status="loading" statusColor={"var(--fg-muted)"} />
      <div
        className="wk-activity-grid"
        style={{
          flex: 1,
          marginTop: 12,
          display: "grid",
          gap: 20,
          alignItems: "center",
          alignContent: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg
            width={144}
            height={144}
            viewBox="0 0 144 144"
            style={{ width: "100%", maxWidth: 144, height: "auto" }}
            role="img"
            aria-label="Activity rings"
          >
            <title>Activity rings</title>
            <Ring index={0} r={52} value={1} max={1} color={colors.move} cx={cx} cy={cy} />
            <Ring index={1} r={38} value={1} max={1} color={colors.exercise} cx={cx} cy={cy} />
            <Ring index={2} r={24} value={1} max={1} color={colors.steps} cx={cx} cy={cy} />
          </svg>
        </div>
        <div style={{ opacity: 0.75 }}>
          <MetricRow index={0} dot={colors.move} label="Move" value="—" suffix="kcal" />
          <div style={{ margin: "10px 0", borderTop: `1px dotted ${"var(--border-subtle)"}` }} />
          <MetricRow index={1} dot={colors.exercise} label="Exercise" value="—" suffix="min" />
          <div style={{ margin: "10px 0", borderTop: `1px dotted ${"var(--border-subtle)"}` }} />
          <MetricRow index={2} dot={colors.steps} label="Steps" value="—" />
        </div>
      </div>
      <Footer
        left="// syncing…"
        right={<output>waiting for data</output>}
        style={{ marginTop: "auto" }}
      />
    </Panel>
  )
}

export function TodayActivityCardEmpty({ className }: { className?: string }) {
  const cx = 72,
    cy = 72
  return (
    <Panel className={className}>
      <Header status="empty" statusColor={"var(--fg-muted)"} />
      <div
        className="wk-activity-grid"
        style={{
          flex: 1,
          marginTop: 12,
          display: "grid",
          gap: 20,
          alignItems: "center",
          alignContent: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg
            width={144}
            height={144}
            viewBox="0 0 144 144"
            style={{ width: "100%", maxWidth: 144, height: "auto" }}
            role="img"
            aria-label="No activity yet"
          >
            <title>No activity yet</title>
            <Ring index={0} r={52} value={0} max={1} color={colors.move} cx={cx} cy={cy} />
            <Ring index={1} r={38} value={0} max={1} color={colors.exercise} cx={cx} cy={cy} />
            <Ring index={2} r={24} value={0} max={1} color={colors.steps} cx={cx} cy={cy} />
          </svg>
        </div>
        <div>
          <MetricRow index={0} dot={colors.move} label="Move" value="—" suffix="kcal" />
          <div style={{ margin: "10px 0", borderTop: `1px dotted ${"var(--border-subtle)"}` }} />
          <MetricRow index={1} dot={colors.exercise} label="Exercise" value="—" suffix="min" />
          <div style={{ margin: "10px 0", borderTop: `1px dotted ${"var(--border-subtle)"}` }} />
          <MetricRow index={2} dot={colors.steps} label="Steps" value="—" />
        </div>
      </div>
      <Footer
        left="// no data yet — run the shortcut on iPhone"
        right={<span style={{ color: "var(--fg-muted)" }}>install shortcut →</span>}
        style={{ marginTop: "auto" }}
      />
    </Panel>
  )
}

export function TodayActivityCardError({ className }: { className?: string }) {
  return (
    <Panel className={className}>
      <Header status="error" statusColor={colors.danger} />
      <div
        style={{ flex: 1, marginTop: 12, color: "var(--fg-muted)", fontSize: 13, lineHeight: 1.5 }}
      >
        <div style={{ color: "var(--fg-primary)", marginBottom: 6 }}>Something went wrong.</div>
        <div>We couldn&apos;t load today&apos;s activity. Try again later.</div>
      </div>
      <Footer
        left="// showing nothing rather than guessing"
        right={<span style={{ color: "var(--fg-muted)" }}>see docs</span>}
        style={{ marginTop: "auto" }}
      />
    </Panel>
  )
}

export function TodayActivityCardStale({
  data,
  className,
}: {
  data: TodayData
  className?: string
}) {
  const cx = 72,
    cy = 72
  return (
    <Panel className={className}>
      <Header status="stale" statusColor={colors.warn} />
      <div
        className="wk-activity-grid"
        style={{
          flex: 1,
          marginTop: 12,
          display: "grid",
          gap: 20,
          alignItems: "center",
          alignContent: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg
            width={144}
            height={144}
            viewBox="0 0 144 144"
            style={{ width: "100%", maxWidth: 144, height: "auto" }}
            role="img"
            aria-label="Activity rings"
          >
            <title>Activity rings</title>
            <Ring
              index={0}
              r={52}
              value={data.kcal}
              max={data.kcalGoal}
              color={colors.move}
              cx={cx}
              cy={cy}
            />
            <Ring
              index={1}
              r={38}
              value={data.exerciseMinutes}
              max={data.exerciseGoal}
              color={colors.exercise}
              cx={cx}
              cy={cy}
            />
            <Ring
              index={2}
              r={24}
              value={data.steps}
              max={data.stepsGoal}
              color={colors.steps}
              cx={cx}
              cy={cy}
            />
          </svg>
        </div>
        <div>
          <MetricRow
            index={0}
            dot={colors.move}
            label="Move"
            value={Math.round(data.kcal)}
            suffix="kcal"
          />
          <div style={{ margin: "10px 0", borderTop: `1px dotted ${"var(--border-subtle)"}` }} />
          <MetricRow
            index={1}
            dot={colors.exercise}
            label="Exercise"
            value={Math.round(data.exerciseMinutes)}
            suffix="min"
          />
          <div style={{ margin: "10px 0", borderTop: `1px dotted ${"var(--border-subtle)"}` }} />
          <MetricRow index={2} dot={colors.steps} label="Steps" value={Math.round(data.steps)} />
        </div>
      </div>
      <Footer
        left={`// last sync ${data.hoursSinceSync}h ago`}
        right={<span style={{ color: colors.warn }}>run shortcut</span>}
        style={{ marginTop: "auto" }}
      />
    </Panel>
  )
}

export function TodayActivityCardOk({ data, className }: { data: TodayData; className?: string }) {
  const cx = 72,
    cy = 72
  return (
    <Panel className={className}>
      <Header status="synced" statusColor={colors.exercise} live />
      <div
        className="wk-activity-grid"
        style={{
          flex: 1,
          marginTop: 12,
          display: "grid",
          gap: 20,
          alignItems: "center",
          alignContent: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg
            width={144}
            height={144}
            viewBox="0 0 144 144"
            style={{ width: "100%", maxWidth: 144, height: "auto" }}
            role="img"
            aria-label="Activity rings"
          >
            <title>Activity rings</title>
            <Ring
              index={0}
              r={52}
              value={data.kcal}
              max={data.kcalGoal}
              color={colors.move}
              cx={cx}
              cy={cy}
            />
            <Ring
              index={1}
              r={38}
              value={data.exerciseMinutes}
              max={data.exerciseGoal}
              color={colors.exercise}
              cx={cx}
              cy={cy}
            />
            <Ring
              index={2}
              r={24}
              value={data.steps}
              max={data.stepsGoal}
              color={colors.steps}
              cx={cx}
              cy={cy}
            />
          </svg>
        </div>
        <div>
          <MetricRow
            index={0}
            dot={colors.move}
            label="Move"
            value={Math.round(data.kcal)}
            suffix="kcal"
          />
          <div style={{ margin: "10px 0", borderTop: `1px dotted ${"var(--border-subtle)"}` }} />
          <MetricRow
            index={1}
            dot={colors.exercise}
            label="Exercise"
            value={Math.round(data.exerciseMinutes)}
            suffix="min"
          />
          <div style={{ margin: "10px 0", borderTop: `1px dotted ${"var(--border-subtle)"}` }} />
          <MetricRow index={2} dot={colors.steps} label="Steps" value={Math.round(data.steps)} />
        </div>
      </div>
      <Footer
        left="// up to date"
        right={`synced ${data.lastSyncLabel}`}
        style={{ marginTop: "auto" }}
      />
    </Panel>
  )
}
