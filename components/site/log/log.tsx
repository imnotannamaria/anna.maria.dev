import { BooksIcon } from "@phosphor-icons/react/dist/ssr"
import { TYPE_PLURAL, type LogType } from "@/lib/log/constants"
import type { LogEntry } from "@/lib/log/validation"
import { ScreenLink } from "@/components/site/screen-link"
import { PageHeader } from "@/components/site/page-header"
import { Slips, ByType } from "./catalog"
import "./log.css"

export function Log({ entries }: { entries: LogEntry[] | null }) {
  const byType = new Map<LogType, LogEntry[]>()
  for (const entry of entries ?? []) {
    byType.set(entry.type, [...(byType.get(entry.type) ?? []), entry])
  }
  const groups = [...byType].map(([type, items]) => ({ type: TYPE_PLURAL[type], items }))

  return (
    <article className="st-room st-screen">
      <PageHeader
        icon={<BooksIcon aria-hidden size={13} weight="bold" />}
        label={
          <>
            <ScreenLink
              to="person"
              className="focus-ring underline decoration-[var(--border-strong)] decoration-dotted underline-offset-4 transition-colors hover:text-[var(--fg-brand-text)] hover:decoration-current"
            >
              anna, the person
            </ScreenLink>{" "}
            / log
          </>
        }
        count={entries?.length}
      >
        A single feed for <span className="text-[var(--fg-primary)]">everything</span> I finish:
        films, series, books, albums, podcasts and games.
      </PageHeader>

      {groups.length === 0 ? (
        <p className="text-body-md font-sans text-[var(--fg-secondary)]">
          {entries === null
            ? "The log lives in Postgres, and Postgres did not answer just now."
            : "Nothing logged yet."}
        </p>
      ) : (
        <ByType groups={groups} draw={(items) => <Slips items={items} />} />
      )}
    </article>
  )
}
