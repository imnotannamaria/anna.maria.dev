/**
 * The document primitives every "open file" page is written in: the `#`/`##` label, the
 * serif section heading, the section wrapper, and the two inline emphases.
 *
 * These existed three times — inline in `app/about/page.tsx`, inline in
 * `app/contact/page.tsx`, and in `app/piano/parts.tsx`. `Section`, `Em` and `Strong` were
 * character-for-character identical in all three. `DocLabel` too.
 *
 * `DisplayH2` and `Prose` were **not**, and that is the interesting part: about used 40px
 * with no bottom margin, contact 40px with 16px, piano 36px with 8px; prose was `mb-8` at
 * 1.7 line-height on contact and `mb-6` at 1.65 on piano. Nobody decided that — it is three
 * copies drifting, which is exactly what the Standardization check in CLAUDE.md is about.
 *
 * Rather than silently restyle two pages, the differences became props with about's values
 * as the default, and each page passes what it already had. Nothing moves. The divergence is
 * now three visible arguments instead of three files, which is what makes settling on one
 * scale a five-minute decision later instead of an archaeology exercise.
 *
 * No `"use client"`: `Reveal` brings its own boundary, and `app/piano/piano-studio.tsx` is a
 * client component that renders `Section` and `DocLabel`, so this has to work from both sides.
 */

import type React from "react"
import { Reveal } from "@/components/ui/reveal"
import { cn } from "@/lib/utils"

export function Strong({ children }: { children: React.ReactNode }) {
  return <strong style={{ color: "var(--fg-primary)", fontWeight: 500 }}>{children}</strong>
}

export function Em({ children }: { children: React.ReactNode }) {
  return (
    <em style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--fg-brand)" }}>
      {children}
    </em>
  )
}

/**
 * The entrance lives here rather than at every call site. However many sections a page has,
 * one rule, and nothing to remember when it grows one more.
 */
export function DocLabel({ level, children }: { level: "#" | "##"; children: React.ReactNode }) {
  return (
    <Reveal>
      <div
        className="text-mono-sm mb-3 font-mono tracking-[0.08em] uppercase"
        style={{ color: "var(--fg-muted)" }}
      >
        <span aria-hidden style={{ color: "var(--fg-brand)" }}>
          {level}
        </span>{" "}
        {children}
      </div>
    </Reveal>
  )
}

export function DisplayH2({
  children,
  /** 40 on /about and /contact, 36 on /piano. Not a decision anyone made — see the note above. */
  size = 40,
  /** `0` on /about, `0 0 16px` on /contact, `0 0 8px` on /piano. Same story. */
  margin = "0",
}: {
  children: React.ReactNode
  size?: number
  margin?: string
}) {
  return (
    <Reveal delay={0.06}>
      <h2
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 400,
          fontSize: size,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          color: "var(--fg-primary)",
          margin,
        }}
      >
        {children}
      </h2>
    </Reveal>
  )
}

export function Prose({
  children,
  /** `mb-8` + 1.7 on /contact, `mb-6` + 1.65 on /piano. */
  className = "mb-6 text-body-lg leading-[1.65]",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={className}
      style={{ fontFamily: "var(--font-sans)", color: "var(--fg-secondary)", maxWidth: "60ch" }}
    >
      {children}
    </p>
  )
}

export function Section({
  id,
  first,
  children,
}: {
  id: string
  first?: boolean
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      style={{
        scrollMarginTop: 24,
        paddingTop: first ? 0 : 64,
        paddingBottom: 64,
        borderTop: first ? "none" : "1px solid var(--border-subtle)",
      }}
    >
      {children}
    </section>
  )
}

/**
 * The published/read/words strip under a post or project title.
 *
 * It was written twice, identically, once in each `[slug]/page.tsx` — and both drew their own
 * surface: `rounded-[var(--radius-lg)] border p-4` painted `--bg-surface`, which by convention
 * is the token for what sits *above* a card, not for a card. The same box `/piano`'s key map
 * used to be. It is `.bento-card` now, at the dense end, with `!grid` because the class sets
 * flex-column and this is four columns — the modifier pattern the piano song rows use.
 */
export function MetaGrid({ children }: { children: React.ReactNode }) {
  return (
    // Container queries, not viewport ones. On a case study this sits in a 760px column and
    // four columns is right; on a component doc one of the cells is a repo path, and at a wide
    // viewport the four-column rule fired anyway and broke `tree-card.tsx` across two lines
    // mid-word. Asking the box is the question that was always meant.
    // The `@container` is the outer div, never the grid itself: `container-type` establishes a
    // query container for an element's *descendants*, so `@sm:` on the same node would resolve
    // against an ancestor container instead — i.e. against nothing.
    <div className="@container">
      <dl className="bento-card bento-card-sm !grid grid-cols-1 !gap-3 @sm:grid-cols-2 @2xl:grid-cols-4">
        {children}
      </dl>
    </div>
  )
}

export function MetaCol({
  label,
  value,
  span,
}: {
  label: string
  value: React.ReactNode
  /** Takes the full row. For a value that is long and unbreakable, like a file path. */
  span?: boolean
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-0.5", span && "@sm:col-span-2 @2xl:col-span-4")}>
      <dt
        className="text-mono-xs font-mono tracking-[0.08em] uppercase"
        style={{ color: "var(--fg-muted)" }}
      >
        {label}
      </dt>
      {/* ReactNode rather than string: a case study passes a date, a component doc passes a
          row of badges. A string is still a ReactNode, so every existing call site is
          unchanged. */}
      <dd className="text-mono-md font-mono" style={{ color: "var(--fg-primary)", margin: 0 }}>
        {value}
      </dd>
    </div>
  )
}

/** Small keyboard-cap glyph used inline in prose (Z, Q, space, …). Only /piano uses it. */
export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="text-mono-sm font-mono"
      style={{
        padding: "1px 6px",
        border: "1px solid var(--border-strong)",
        borderRadius: 4,
        color: "var(--fg-primary)",
        background: "var(--bg-surface)",
      }}
    >
      {children}
    </kbd>
  )
}
