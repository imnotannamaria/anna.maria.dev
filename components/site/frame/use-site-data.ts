"use client"

import { useSitePath } from "@/components/site/i18n"
import { useLocale } from "next-intl"
import { useEffect, useState } from "react"
import type { LogSummary, SiteData } from "./site-data"

/** One request for the whole session, shared by the terminal and the chat. */
let pending: Promise<LogSummary[] | null> | undefined

// in the page's language: a change of language reloads the page, so one answer is enough
const loadLog = (locale: string) =>
  (pending ??= fetch(`/api/v1/site/log?lang=${locale}`)
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
    .then((body: { entries: LogSummary[] }) => body.entries)
    .catch(() => {
      // let a later visit to the side try again
      pending = undefined
      return null
    }))

/**
 * The site's data with the log filled in. The rest is static and comes from the layout; the log
 * lives in Postgres, so it is fetched, and only once one of the two sides that print it (/back,
 * /ai) has actually been opened.
 */
export function useSiteData(data: SiteData): SiteData {
  const pathname = useSitePath()
  const wanted = pathname === "/back" || pathname === "/ai"
  const locale = useLocale()
  const [log, setLog] = useState<LogSummary[] | null>()

  useEffect(() => {
    // Asked for when a side that prints it opens. After a failure the answer stays null until
    // the visitor leaves the side and comes back, which runs this again.
    if (!wanted || Array.isArray(log)) return
    let alive = true
    loadLog(locale).then((entries) => {
      if (alive) setLog(entries)
    })
    return () => {
      alive = false
    }
    // `log` is left out on purpose: with it, a failure would ask again in a loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wanted])

  return { ...data, log }
}
