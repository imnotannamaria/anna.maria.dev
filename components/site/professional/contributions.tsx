import { useTranslations } from "next-intl"
import { CalendarDotsIcon, GithubLogoIcon } from "@phosphor-icons/react/dist/ssr"
import { Hint } from "@/components/site/hint"
import { ArrowLink } from "@/app/components/entrepta/arrow-link"
import { CardFooter } from "@/app/components/entrepta/card"
import { GithubCalendar } from "@/components/about/github-calendar"
import { getContributions, type ContributionYear } from "@/lib/github/contributions"
import type { CardState } from "@/lib/card-state"
import { siteConfig } from "@/lib/site-config"
import { Tile } from "@/components/site/tile"

function Frame({ state }: { state: CardState<ContributionYear> }) {
  const t = useTranslations("professional")
  const user = siteConfig.githubUser

  return (
    <Tile label={t("contributions")} icon={<GithubLogoIcon />} note={user} size="md">
      <GithubCalendar state={state} />
      <CardFooter className="border-t border-dashed border-[var(--border-subtle)] pt-3">
        <Hint icon={<CalendarDotsIcon aria-hidden size={13} />}>
          <span>{t("activity")}</span>
        </Hint>
        <ArrowLink
          href={`https://github.com/${user}`}
          external
          className="text-[var(--fg-brand-text)]"
        >
          {t("github")}
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
