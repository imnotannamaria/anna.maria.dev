"use client"

import { ContributionsCard } from "./contributions-card"

const USERNAME = "imnotannamaria"

/**
 * Throwaway discovery route.
 *
 * Three widths on purpose. Fifty-three columns share whatever width they are
 * given, so how big a square is is a property of the container, not of the
 * component — the reference screenshot looks chunky partly because it is a very
 * wide panel. The narrow one is where the floor kicks in and the grid scrolls.
 */
export default function ContributionsDiscoveryPage() {
  return (
    <div className="p-8">
      <h1 className="mb-1 font-mono text-lg" style={{ color: "var(--fg-primary)" }}>
        contributions — discovery
      </h1>
      <p className="mb-8 text-sm" style={{ color: "var(--fg-muted)" }}>
        real data for {USERNAME}, no react-github-calendar
      </p>

      <p className="mb-3 font-mono text-[11px]" style={{ color: "var(--fg-muted)" }}>
        {"// "} full width — the reference look
      </p>
      <ContributionsCard username={USERNAME} />

      <p className="mt-10 mb-3 font-mono text-[11px]" style={{ color: "var(--fg-muted)" }}>
        {"// "} as it sits on /about
      </p>
      <div className="max-w-5xl">
        <ContributionsCard username={USERNAME} />
      </div>

      <p className="mt-10 mb-3 font-mono text-[11px]" style={{ color: "var(--fg-muted)" }}>
        {"// "} as it sits on the home bento grid — below the floor, so it scrolls
      </p>
      <div className="max-w-md">
        <ContributionsCard username={USERNAME} />
      </div>
    </div>
  )
}
