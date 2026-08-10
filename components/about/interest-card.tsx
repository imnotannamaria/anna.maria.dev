"use client"

/**
 * One of the three cards under "outside of code".
 *
 * They were `.bento-card` with a hand-rolled footer — a dashed `border-top` and a glyph —
 * and no spotlight, which made them the only cards on /about that didn't look like the
 * cards on the home page. This is the shared shape instead: `CardHead` names it, `CardFoot`
 * carries the `//` comment and the accent, and the glow trails the cursor like everywhere
 * else. The dashed rule is gone because `CardFoot` doesn't draw one.
 *
 * `icon` arrives as an already-rendered element. A component reference is not serializable
 * across the server/client boundary; an element is.
 */

import { motion } from "motion/react"
import { CardFoot, CardHead } from "@/components/ui/card-parts"
import { useReveal } from "@/components/ui/reveal"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"

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
  const { onMouseMove, spotlight } = useSpotlight(280)
  const reveal = useReveal(index * 0.06)

  return (
    <motion.div className="bento-card h-full" onMouseMove={onMouseMove} {...reveal}>
      <Spotlight {...spotlight} />

      <CardHead label={label} as="h3" />

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
        className="relative m-0 text-[13px] leading-relaxed"
        style={{ fontFamily: "var(--font-sans)", color: "var(--fg-secondary)" }}
      >
        {children}
      </p>

      <CardFoot comment={foot}>
        <span aria-hidden style={{ color: "var(--fg-brand)" }}>
          {glyph}
        </span>
      </CardFoot>
    </motion.div>
  )
}
