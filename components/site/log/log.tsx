import { useTranslations } from "next-intl"
import { BooksIcon } from "@phosphor-icons/react/dist/ssr"
import { TYPE_PLURAL, type LogType } from "@/lib/log/constants"
import type { LogEntry } from "@/lib/log/validation"
import { ScreenLink } from "@/components/site/screen-link"
import { PageHeader } from "@/components/site/page-header"
import { ByType } from "./catalog"
import { Slips } from "./slips"
import "./log.css"

export function Log({ entries }: { entries: LogEntry[] | null }) {
  const t = useTranslations("log")
  const byType = new Map<LogType, LogEntry[]>()
  for (const entry of entries ?? []) {
    byType.set(entry.type, [...(byType.get(entry.type) ?? []), entry])
  }
  const groups = [...byType].map(([type, items]) => ({ type: t(`types.${type}`), items }))

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
              {t("parent")}
            </ScreenLink>{" "}
            / {t("label")}
          </>
        }
        count={entries?.length}
      >
        {t.rich("lede", {
          b: (words) => <span className="text-[var(--fg-primary)]">{words}</span>,
        })}
      </PageHeader>

      {groups.length === 0 ? (
        <p className="text-body-md font-sans text-[var(--fg-secondary)]">
          {entries === null ? t("down") : t("empty")}
        </p>
      ) : (
        <ByType groups={groups} draw={(items) => <Slips items={items} />} />
      )}
    </article>
  )
}
