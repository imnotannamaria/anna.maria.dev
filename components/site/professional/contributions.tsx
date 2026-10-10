import { GithubLogoIcon } from "@phosphor-icons/react/dist/ssr"
import { ArrowLink } from "@/app/components/entrepta/arrow-link"
import { CardComment, CardFooter } from "@/app/components/entrepta/card"
import { GithubCalendar } from "@/components/about/github-calendar"
import { getContributions, type ContributionYear } from "@/lib/github/contributions"
import type { CardState } from "@/lib/showcase/state"
import { siteConfig } from "@/lib/site-config"
import { Tile } from "@/components/site/tile"

function Frame({ state }: { state: CardState<ContributionYear> }) {
  const user = siteConfig.githubUser

  return (
    <Tile label="contributions" icon={<GithubLogoIcon />} note={user} size="md">
      <GithubCalendar state={state} />
      <CardFooter className="border-t border-dashed border-[var(--border-subtle)] pt-3">
        <CardComment>public activity · last 12 months</CardComment>
        <ArrowLink
          href={`https://github.com/${user}`}
          external
          className="text-[var(--fg-brand-text)]"
        >
          github
        </ArrowLink>
      </CardFooter>
    </Tile>
  )
}

export async function Contributions() {
  return <Frame state={await getContributions(siteConfig.githubUser)} />
}

export function ContributionsLoading() {
  return <Frame state={{ kind: "loading" }} />
}
