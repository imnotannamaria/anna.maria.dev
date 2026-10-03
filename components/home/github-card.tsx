import { ArrowLink } from "@/app/components/entrepta/arrow-link"
import {
  CardComment,
  CardFooter,
  CardHeader,
  CardLabel,
  CardMeta,
} from "@/app/components/entrepta/card"
import { Reveal } from "@/app/components/entrepta/reveal"
import { SpotlightCard } from "@/app/components/entrepta/spotlight-card"
import { GithubCalendar } from "@/components/about/github-calendar"
import type { ContributionYear } from "@/lib/github/contributions"
import type { CardState } from "@/lib/showcase/state"

/**
 * The frame around the calendar: entrepta's `SpotlightCard`, with `CardHeader` and
 * `CardFooter` for the chrome and `ArrowLink` for the link.
 *
 * It holds no hook of its own any more — the card carries the spotlight and `Reveal` the
 * entrance — so this file is a server component, and only the calendar inside it is client
 * code. The calendar is the site's own, in `components/about/github-calendar.tsx`: entrepta's
 * `ContributionGrid` was tried in its place and did not stay.
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
  return (
    <Reveal>
      <SpotlightCard glow={700}>
        <CardHeader>
          <CardLabel as="h3">contributions</CardLabel>
          <CardMeta>{username}</CardMeta>
        </CardHeader>

        <GithubCalendar state={state} />

        {/* Same dashed rule the tree and oss footers use — spelled with the token,
            not Tailwind's default border colour, which is a different grey. */}
        <CardFooter className="border-t border-dashed border-(--border-subtle) pt-3">
          <CardComment>public activity · last 12 months</CardComment>
          <span style={{ color: "var(--fg-brand-text)" }}>
            <ArrowLink
              href={`https://github.com/${username}`}
              external
              className="text-mono-sm text-(--fg-brand-text)"
            >
              github
            </ArrowLink>
          </span>
        </CardFooter>
      </SpotlightCard>
    </Reveal>
  )
}
