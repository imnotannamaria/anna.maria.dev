import { BriefcaseIcon } from "@phosphor-icons/react/dist/ssr"
import { Lede, PageLabel } from "@/components/site/page-header"
import { Suspense } from "react"
import { Reveal } from "@/app/components/entrepta/reveal"
import { calcYearsOfExp, yearsWord } from "@/lib/experience"
import { Apps } from "./apps"
import { CAREER } from "./career"
import { Contributions, ContributionsLoading } from "./contributions"
import { History } from "./history"
import { STACK } from "./stack-data"
import { Stack } from "./stack"
import "./professional.css"

export function Professional() {
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
            label="anna, the professional"
          />

          <Lede>
            I build things <span className="text-[var(--fg-primary)]">end to end</span>, from the UI
            and the front, web or mobile, all the way to shipping, and I&rsquo;ve been at it for
            about{" "}
            <span className="text-[var(--fg-primary)]">{yearsWord(years).toLowerCase()} years</span>{" "}
            across startups and bigger enterprise teams.
          </Lede>
        </div>

        <dl className="st-prof-now text-mono-sm font-mono">
          <dt className="text-mono-xs tracking-widest text-[var(--fg-muted)] uppercase">now</dt>
          {ongoing.map((entry) => (
            <dd key={entry.id} className="flex min-w-0 items-baseline gap-2">
              <span aria-hidden className="st-prof-dot" data-type={entry.type} />
              <span className="min-w-0">
                <span className="text-[var(--fg-primary)]">{entry.role}</span>
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
