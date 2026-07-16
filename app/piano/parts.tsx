import type React from "react"

/**
 * Presentational primitives shared between the server page (hero, key mapping)
 * and the client studio (keyboard, songs). Pure components — no hooks — so they
 * stay cheap in the client bundle.
 */

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

export function DocLabel({ level, children }: { level: "#" | "##"; children: React.ReactNode }) {
  return (
    <div
      className="mb-3 font-mono text-xs tracking-[0.08em] uppercase"
      style={{ color: "var(--fg-muted)" }}
    >
      <span aria-hidden style={{ color: "var(--fg-brand)" }}>
        {level}
      </span>{" "}
      {children}
    </div>
  )
}

export function DisplayH2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-serif)",
        fontWeight: 400,
        fontSize: 36,
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
        color: "var(--fg-primary)",
        margin: "0 0 8px",
      }}
    >
      {children}
    </h2>
  )
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-6 text-[15px] leading-[1.65]"
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

/** Small keyboard-cap glyph used inline in prose (Z, Q, space, …). */
export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="font-mono text-[12px]"
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
