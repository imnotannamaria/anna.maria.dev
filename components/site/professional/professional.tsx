import { useTranslations } from "next-intl"
import { BriefcaseIcon } from "@phosphor-icons/react/dist/ssr"
import { Lede, PageLabel } from "@/components/site/page-header"
import { Suspense } from "react"
import { Reveal } from "@/app/components/entrepta/reveal"
import { CAREER_START_YEAR, calcYearsOfExp } from "@/lib/experience"
import { Apps } from "./apps"
import { CAREER } from "./career"
import { Contributions, ContributionsLoading } from "./contributions"
import { History } from "./history"
import { STACK } from "./stack-data"
import { Stack } from "./stack"
import "./professional.css"

export function Professional() {
  const t = useTranslations("professional")
  const career = useTranslations("career")
  const now = new Date()

  const today = [now.getFullYear(), now.getMonth() + 1, now.getDate()] as const
  const years = calcYearsOfExp(now)
  const ongoing = CAREER.filter((entry) => entry.current)

  return (
    <article className="st-room st-prof">
      <header className="st-prof-header">
        <div className="flex flex-col justify-center gap-4">
          <PageLabel
            icon={<BriefcaseIcon aria-hidden size={13} weight="bold" />}
            label={t("label")}
          />

          <Lede className="st-lede-wide">
            {t.rich("lede", {
              b: (words) => <span className="st-lede-keep text-[var(--fg-primary)]">{words}</span>,
              // the chain of arrows stays on one line: broken in the middle it stops reading as a path
              flow: (words) => <span className="st-lede-flow">{words}</span>,
              // the years are left as the sum, on purpose: the joke is that you do the maths
              now: String(now.getFullYear()),
              since: String(CAREER_START_YEAR),
            })}
          </Lede>
        </div>

        <dl className="st-prof-now text-mono-sm font-mono">
          <dt className="text-mono-xs tracking-widest text-[var(--fg-muted)] uppercase">
            {t("now")}
          </dt>
          {ongoing.map((entry) => (
            <dd key={entry.id} className="flex min-w-0 items-baseline gap-2">
              <span aria-hidden className="st-prof-dot" data-type={entry.type} />
              <span className="min-w-0">
                <span className="text-[var(--fg-primary)]">{career(`${entry.id}.role`)}</span>
                <span className="text-[var(--fg-muted)]"> · {entry.org}</span>
              </span>
            </dd>
          ))}
        </dl>
      </header>

      <Reveal index={0}>
        <History entries={CAREER} today={today} careerYears={years} />
      </Reveal>

      <Reveal index={1}>
        <Suspense fallback={<ContributionsLoading />}>
          <Contributions />
        </Suspense>
      </Reveal>

      <Stack groups={STACK} />
      <Apps />
    </article>
  )
}
