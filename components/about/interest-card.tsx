"use client"

/**
 * One of the three cards under "outside of code".
 *
 * They were `.bento-card` with a hand-rolled footer — a dashed `border-top` and a glyph —
 * and no spotlight, which made them the only cards on /about that didn't look like the
 * cards on the home page. This is the shared shape instead: `CardHeader` names it, `CardFooter`
 * carries the `//` comment and the accent, and the glow trails the cursor like everywhere
 * else. The dashed rule is gone because `CardFooter` doesn't draw one.
 *
 * `icon` arrives as an already-rendered element. A component reference is not serializable
 * across the server/client boundary; an element is.
 */

import { CardComment, CardFooter, CardHeader, CardLabel } from "@/app/components/entrepta/card"
import { Reveal } from "@/app/components/entrepta/reveal"
import { SpotlightCard } from "@/app/components/entrepta/spotlight-card"

export function InterestCard({
  label,
  icon,
  foot,
  glyph,
  children,
  index = 0,
}: {
  label: string
  icon: React.ReactNode
  foot: string
  glyph: string
  children: React.ReactNode
  index?: number
}) {
  return (
    <Reveal index={index} className="flex flex-col">
      <SpotlightCard glow={280} className="flex-1">
        <CardHeader>
          <CardLabel as="h3">{label}</CardLabel>
        </CardHeader>

        <span
          className="relative grid place-items-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: "var(--radius-md)",
            background: "var(--bg-surface-brand)",
            color: "var(--fg-brand)",
          }}
        >
          {icon}
        </span>

        <p
          className="text-body-md relative m-0 leading-relaxed"
          style={{ fontFamily: "var(--font-sans)", color: "var(--fg-secondary)" }}
        >
          {children}
        </p>

        <CardFooter>
          <CardComment>{foot}</CardComment>
          <span aria-hidden style={{ color: "var(--fg-brand)" }}>
            {glyph}
          </span>
        </CardFooter>
      </SpotlightCard>
    </Reveal>
  )
}
