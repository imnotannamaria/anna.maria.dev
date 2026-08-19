import "server-only"

import type { CardState } from "@/lib/showcase/state"

export type ContributionLevel = 0 | 1 | 2 | 3 | 4
export type ContributionDay = { date: string; count: number; level: ContributionLevel }
export type ContributionWeek = ContributionDay[]
export type ContributionYear = { weeks: ContributionWeek[]; total: number }

/** A padding cell: a real day carries a date, these only square off the grid. */
const EMPTY: ContributionDay = { date: "", count: 0, level: 0 }

const LEVELS: Record<string, ContributionLevel> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
}

// No from/to: contributionsCollection defaults to the last twelve months, which
// is exactly the range we want. Passing dates would mean computing them on the
// server and is a timezone trap for no gain.
const QUERY = `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`

type GraphQLDay = { date: string; contributionCount: number; contributionLevel: string }
type GraphQLWeek = { contributionDays: GraphQLDay[] }

/**
 * A year of public contributions, as a state rather than a nullable.
 *
 * A state rather than a throw, for the reason it always was: this feeds a card on two pages
 * and neither should fail to render because a token is missing locally or GitHub is having a
 * moment. What changed is that it used to return `null` for four different things — no token,
 * a non-200, a GraphQL error, and an account with no contributions — so the card had a single
 * `if (!data)` branch doing all four jobs and told visitors "no contributions yet" when the
 * truth was "I could not reach GitHub". One of those is about the account and three are about
 * this server; they are different sentences and the card can only say the right one if the
 * difference survives the return.
 */
export async function getContributions(login: string): Promise<CardState<ContributionYear>> {
  const token = process.env.GITHUB_TOKEN
  if (!token) return { kind: "error", message: "GITHUB_TOKEN not set" }

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables: { login } }),
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      console.error(`[contributions] GitHub responded ${res.status}`)
      return { kind: "error", message: `GitHub responded ${res.status}` }
    }

    const json = await res.json()
    if (json.errors) {
      // GitHub reports a bad login or an exhausted quota as 200 + an `errors`
      // array, so this isn't covered by the `!res.ok` branch above. Log the
      // message only — never the response body, which echoes the query and
      // could end up carrying more than intended in a future edit.
      console.error("[contributions] GraphQL error:", json.errors[0]?.message)
      return { kind: "error", message: "GraphQL error" }
    }

    const calendar = json?.data?.user?.contributionsCollection?.contributionCalendar
    // The one branch that is genuinely about the account rather than about this server: the
    // request worked and the answer is that there is nothing to draw.
    if (!calendar?.weeks?.length) return { kind: "empty" }

    const weeks: ContributionWeek[] = calendar.weeks.map((week: GraphQLWeek, i: number) => {
      const days: ContributionDay[] = week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: LEVELS[day.contributionLevel] ?? 0,
      }))

      if (days.length === 7) return days

      // GitHub truncates the first week at its start and the last at its end,
      // so the padding goes on opposite sides. Every column ends up seven
      // cells, which is what lets the grid be a plain flex row of columns.
      const pad = Array.from({ length: 7 - days.length }, () => EMPTY)
      return i === 0 ? [...pad, ...days] : [...days, ...pad]
    })

    return { kind: "ok", data: { weeks, total: calendar.totalContributions } }
  } catch (err) {
    // Logged server-side only — never returned to the caller, which is what
    // the security check means by no stack traces in a response. `err.message`
    // rather than the error object itself: a thrown fetch error can carry the
    // request that produced it, and the request carries the Authorization
    // header.
    console.error("[contributions] fetch failed:", err instanceof Error ? err.message : err)
    return { kind: "error", message: "fetch failed" }
  }
}
