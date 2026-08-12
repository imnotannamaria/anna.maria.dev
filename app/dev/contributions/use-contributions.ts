"use client"

import { useEffect, useMemo, useState } from "react"

export type ContributionDay = {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export type ContributionWeek = ContributionDay[]

/** A padding cell: a real day carries a date, these exist only to square the grid. */
const EMPTY: ContributionDay = { date: "", count: 0, level: 0 }

/**
 * The result carries the username it was fetched for, which is what lets the
 * hook reset without calling setState in the effect body: a result belonging to
 * a previous username simply isn't fresh, and that reads as loading.
 */
type Result = {
  user: string
  days: ContributionDay[] | null
  total: number | null
  error: string | null
}

export function useContributions(username: string) {
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status))
        return res.json()
      })
      .then((data) => {
        setResult({
          user: username,
          days: data.contributions,
          total: data.total?.lastYear ?? null,
          error: null,
        })
      })
      .catch((err) => {
        if (err.name === "AbortError") return
        setResult({ user: username, days: null, total: null, error: "couldn't load contributions" })
      })

    return () => controller.abort()
  }, [username])

  const fresh = result?.user === username ? result : null

  const weeks = useMemo<ContributionWeek[]>(() => {
    const days = fresh?.days
    if (!days?.length) return []

    // An ISO date-only string parses as UTC midnight, so the weekday has to be
    // read in UTC too — getDay() in a negative offset returns the day before.
    const firstWeekday = new Date(days[0].date).getUTCDay()
    const padded = [...Array.from({ length: firstWeekday }, () => EMPTY), ...days]

    const out: ContributionWeek[] = []
    for (let i = 0; i < padded.length; i += 7) {
      const week = padded.slice(i, i + 7)
      // The trailing week is padded too, so every column is a full seven cells
      // and the grid can't end on a ragged edge.
      while (week.length < 7) week.push(EMPTY)
      out.push(week)
    }
    return out
  }, [fresh])

  return {
    weeks,
    total: fresh?.total ?? null,
    error: fresh?.error ?? null,
    loading: !fresh,
  }
}
