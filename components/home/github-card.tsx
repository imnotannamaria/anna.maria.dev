"use client"

import { cardVariants } from "@/app/components/entrepta/card"
import { motion } from "motion/react"
import { ArrowLink } from "@/app/components/entrepta/arrow-link"
import {
  CardComment,
  CardFooter,
  CardHeader,
  CardLabel,
  CardMeta,
} from "@/app/components/entrepta/card"
import { useReveal } from "@/app/components/entrepta/reveal"
import { Spotlight, useSpotlight } from "@/app/components/entrepta/spotlight"
import { GithubCalendar } from "@/components/about/github-calendar"
import type { ContributionYear } from "@/lib/github/contributions"
import type { CardState } from "@/lib/showcase/state"

/**
 * The frame around the calendar. It used to be `.bento-card` copied out by
 * hand into inline styles, with a React state hook driving the hover so it
 * could also lift and cast a shadow. Everything it was reimplementing already
 * exists: the class does the surface, `CardHeader` and `CardFooter` do the chrome,
 * `ArrowLink` does the link. The lift went with the state — no other card on
 * the page lifts, and keeping it meant keeping a re-render on every pointer
 * enter to do what CSS does free.
 *
 * `data` is fetched by the page, server-side — see `lib/github/contributions.ts`
 * — so the grid is in the served HTML instead of behind a client fetch.
 */
export function GithubCard({
  username,
  state,
}: {
  username: string
  state: CardState<ContributionYear>
}) {
  const { onMouseMove, spotlight } = useSpotlight(700)
  const reveal = useReveal()

  return (
    <motion.div className={cardVariants()} onMouseMove={onMouseMove} {...reveal}>
      <Spotlight {...spotlight} />

      <CardHeader>
        <CardLabel as="h3">contributions</CardLabel>
        <CardMeta>{username}</CardMeta>
      </CardHeader>

      <GithubCalendar state={state} />

      {/* Same dashed rule the tree and oss footers use — spelled with the token,
          not Tailwind's default border colour, which is a different grey. */}
      <CardFooter className="border-t border-dashed border-(--border-subtle) pt-3">
        <CardComment>public activity · last 12 months</CardComment>
        <span style={{ color: "var(--fg-brand)" }}>
          <ArrowLink
            href={`https://github.com/${username}`}
            external
            className="text-mono-sm text-(--fg-brand)"
          >
            github
          </ArrowLink>
        </span>
      </CardFooter>
    </motion.div>
  )
}
