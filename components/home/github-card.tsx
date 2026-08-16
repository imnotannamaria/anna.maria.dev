"use client"

import { motion } from "motion/react"
import { ArrowLink } from "@/components/ui/arrow-link"
import { CardFoot, CardHead } from "@/components/ui/card-parts"
import { useReveal } from "@/components/ui/reveal"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import { GithubCalendar } from "@/components/about/github-calendar"
import type { ContributionYear } from "@/lib/github/contributions"

/**
 * The frame around the calendar. It used to be `.bento-card` copied out by
 * hand into inline styles, with a React state hook driving the hover so it
 * could also lift and cast a shadow. Everything it was reimplementing already
 * exists: the class does the surface, `CardHead` and `CardFoot` do the chrome,
 * `ArrowLink` does the link. The lift went with the state — no other card on
 * the page lifts, and keeping it meant keeping a re-render on every pointer
 * enter to do what CSS does free.
 *
 * `data` is fetched by the page, server-side — see `lib/github/contributions.ts`
 * — so the grid is in the served HTML instead of behind a client fetch.
 */
export function GithubCard({
  username,
  data,
}: {
  username: string
  data: ContributionYear | null
}) {
  const { onMouseMove, spotlight } = useSpotlight(700)
  const reveal = useReveal()

  return (
    <motion.div className="bento-card" onMouseMove={onMouseMove} {...reveal}>
      <Spotlight {...spotlight} />

      <CardHead label="contributions" as="h3" meta={username} />

      <GithubCalendar data={data} />

      {/* Same dashed rule the tree and oss footers use — spelled with the token,
          not Tailwind's default border colour, which is a different grey. */}
      <CardFoot
        comment="public activity · last 12 months"
        className="border-t border-dashed border-(--border-subtle) pt-3"
      >
        <span style={{ color: "var(--fg-brand)" }}>
          <ArrowLink
            href={`https://github.com/${username}`}
            external
            className="text-mono-sm text-(--fg-brand)"
          >
            github
          </ArrowLink>
        </span>
      </CardFoot>
    </motion.div>
  )
}
