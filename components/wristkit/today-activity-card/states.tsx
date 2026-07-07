"use client"

import { useState } from "react"
import type * as React from "react"
import type { TodayData } from "./load"

const colors = {
  move: "#7c6bff",
  exercise: "#10b981",
  steps: "#f59e0b",
  danger: "#f43f5e",
  warn: "#f59e0b",
}

function clamp01(x: number): number {
  if (Number.isNaN(x) || !Number.isFinite(x)) return 0
  return Math.min(1, Math.max(0, x))
}

function Ring({
  r,
  value,
  max,
  color,
  cx,
  cy,
}: {
  r: number
  value: number
  max: number
  color: string
  cx: number
  cy: number
}) {
  const circ = 2 * Math.PI * r
  const p = clamp01(max > 0 ? value / max : 0)
  return (
    <>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={9}
        strokeOpacity={0.18}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={9}
        strokeLinecap="round"
        strokeDasharray={`${circ * p} ${circ}`}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </>
  )
}

function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false)
  return (
    <section
      className={className}
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${hovered ? "var(--fg-brand)" : "var(--border-strong)"}`,
        borderRadius: "var(--radius-xl)",
        padding: 18,
        color: "var(--fg-primary)",
        fontFamily: "var(--font-mono)",
        display: "flex",
        flexDirection: "column",
        transition:
          "border-color 200ms var(--ease-out), box-shadow 200ms var(--ease-out), transform 200ms var(--ease-out)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </section>
  )
}

function Header({ status, statusColor }: { status: string; statusColor: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
      <span
        style={{
          color: "var(--fg-secondary)",
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        Today / Activity
      </span>
      <span
        style={{
          color: statusColor,
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {status}
      </span>
    </div>
  )
}

function MetricRow({
  dot,
  label,
  value,
  suffix,
}: {
  dot: string
  label: string
  value: React.ReactNode
  suffix?: string
}) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
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
          minWidth: 78,
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
    </div>
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
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(0,1.15fr)",
          gap: 20,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg
            width={144}
            height={144}
            viewBox="0 0 144 144"
            role="img"
            aria-label="Activity rings"
          >
            <title>Activity rings</title>
            <Ring r={52} value={1} max={1} color={colors.move} cx={cx} cy={cy} />
            <Ring r={38} value={1} max={1} color={colors.exercise} cx={cx} cy={cy} />
            <Ring r={24} value={1} max={1} color={colors.steps} cx={cx} cy={cy} />
          </svg>
        </div>
        <div style={{ opacity: 0.75 }}>
          <MetricRow dot={colors.move} label="Move" value="—" suffix="kcal" />
          <div style={{ margin: "10px 0", borderTop: `1px dotted ${"var(--border-subtle)"}` }} />
          <MetricRow dot={colors.exercise} label="Exercise" value="—" suffix="min" />
          <div style={{ margin: "10px 0", borderTop: `1px dotted ${"var(--border-subtle)"}` }} />
          <MetricRow dot={colors.steps} label="Steps" value="—" />
        </div>
      </div>
      <Footer left="// syncing…" right={<output>waiting for data</output>} />
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
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(0,1.15fr)",
          gap: 20,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg
            width={144}
            height={144}
            viewBox="0 0 144 144"
            role="img"
            aria-label="No activity yet"
          >
            <title>No activity yet</title>
            <Ring r={52} value={0} max={1} color={colors.move} cx={cx} cy={cy} />
            <Ring r={38} value={0} max={1} color={colors.exercise} cx={cx} cy={cy} />
            <Ring r={24} value={0} max={1} color={colors.steps} cx={cx} cy={cy} />
          </svg>
        </div>
        <div>
          <MetricRow dot={colors.move} label="Move" value="—" suffix="kcal" />
          <div style={{ margin: "10px 0", borderTop: `1px dotted ${"var(--border-subtle)"}` }} />
          <MetricRow dot={colors.exercise} label="Exercise" value="—" suffix="min" />
          <div style={{ margin: "10px 0", borderTop: `1px dotted ${"var(--border-subtle)"}` }} />
          <MetricRow dot={colors.steps} label="Steps" value="—" />
        </div>
      </div>
      <Footer
        left="// no data yet — run the shortcut on iPhone"
        right={<span style={{ color: "var(--fg-muted)" }}>install shortcut →</span>}
      />
    </Panel>
  )
}

export function TodayActivityCardError({ className }: { className?: string }) {
  return (
    <Panel className={className}>
      <Header status="error" statusColor={colors.danger} />
      <div style={{ marginTop: 12, color: "var(--fg-muted)", fontSize: 13, lineHeight: 1.5 }}>
        <div style={{ color: "var(--fg-primary)", marginBottom: 6 }}>Something went wrong.</div>
        <div>We couldn&apos;t load today&apos;s activity. Try again later.</div>
      </div>
      <Footer
        left="// showing nothing rather than guessing"
        right={<span style={{ color: "var(--fg-muted)" }}>see docs</span>}
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
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(0,1.15fr)",
          gap: 20,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg
            width={144}
            height={144}
            viewBox="0 0 144 144"
            role="img"
            aria-label="Activity rings"
          >
            <title>Activity rings</title>
            <Ring
              r={52}
              value={data.kcal}
              max={data.kcalGoal}
              color={colors.move}
              cx={cx}
              cy={cy}
            />
            <Ring
              r={38}
              value={data.exerciseMinutes}
              max={data.exerciseGoal}
              color={colors.exercise}
              cx={cx}
              cy={cy}
            />
            <Ring
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
          <MetricRow dot={colors.move} label="Move" value={Math.round(data.kcal)} suffix="kcal" />
          <div style={{ margin: "10px 0", borderTop: `1px dotted ${"var(--border-subtle)"}` }} />
          <MetricRow
            dot={colors.exercise}
            label="Exercise"
            value={Math.round(data.exerciseMinutes)}
            suffix="min"
          />
          <div style={{ margin: "10px 0", borderTop: `1px dotted ${"var(--border-subtle)"}` }} />
          <MetricRow dot={colors.steps} label="Steps" value={Math.round(data.steps)} />
        </div>
      </div>
      <Footer
        left={`// last sync ${data.hoursSinceSync}h ago`}
        right={<span style={{ color: colors.warn }}>run shortcut</span>}
      />
    </Panel>
  )
}

export function TodayActivityCardOk({ data, className }: { data: TodayData; className?: string }) {
  const cx = 72,
    cy = 72
  return (
    <Panel className={className}>
      <Header status="synced" statusColor={colors.exercise} />
      <div
        style={{
          flex: 1,
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(0,1.15fr)",
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
            role="img"
            aria-label="Activity rings"
          >
            <title>Activity rings</title>
            <Ring
              r={52}
              value={data.kcal}
              max={data.kcalGoal}
              color={colors.move}
              cx={cx}
              cy={cy}
            />
            <Ring
              r={38}
              value={data.exerciseMinutes}
              max={data.exerciseGoal}
              color={colors.exercise}
              cx={cx}
              cy={cy}
            />
            <Ring
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
          <MetricRow dot={colors.move} label="Move" value={Math.round(data.kcal)} suffix="kcal" />
          <div style={{ margin: "10px 0", borderTop: `1px dotted ${"var(--border-subtle)"}` }} />
          <MetricRow
            dot={colors.exercise}
            label="Exercise"
            value={Math.round(data.exerciseMinutes)}
            suffix="min"
          />
          <div style={{ margin: "10px 0", borderTop: `1px dotted ${"var(--border-subtle)"}` }} />
          <MetricRow dot={colors.steps} label="Steps" value={Math.round(data.steps)} />
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
