"use client"

import { motion } from "motion/react"
import { ArrowLink } from "@/components/ui/arrow-link"
import { CardFoot, CardHead } from "@/components/ui/card-parts"
import { useReveal } from "@/components/ui/reveal"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import { ContributionsCalendar } from "./contributions-calendar"

/**
 * The same frame `GithubCard` already had — `.bento-card`, `CardHead`,
 * `CardFoot`, the spotlight and the shared entrance. Only the calendar inside it
 * is new, which is the point: the rewrite replaces the library, not the card.
 */
export function ContributionsCard({ username }: { username: string }) {
  const { onMouseMove, spotlight } = useSpotlight(700)
  const reveal = useReveal()

  return (
    <motion.div className="bento-card" onMouseMove={onMouseMove} {...reveal}>
      <Spotlight {...spotlight} />

      <CardHead label="contributions" as="h3" meta={username} />

      <ContributionsCalendar username={username} />

      <CardFoot
        comment="public activity · last 12 months"
        className="border-t border-dashed border-(--border-subtle) pt-3"
      >
        <ArrowLink
          href={`https://github.com/${username}`}
          external
          className="text-[11px] text-(--fg-brand)"
        >
          github
        </ArrowLink>
      </CardFoot>
    </motion.div>
  )
}
