import "server-only"

import type { CardState } from "@/lib/showcase/state"
import { SHORTLOG_ACTIVE_ROWS, SHORTLOG_DAYS, SHORTLOG_QUIET_ROWS } from "./shortlog-constants"

export type ShortlogProject = { slug: string; title: string; github: string }

export type ShortlogCommit = {
  sha: string
  message: string
  url: string
  /** "3h", "18d", "5mo". Worked out on the server, per request: see `ago`. */
  ago: string
}

export type ShortlogRow = {
  slug: string
  title: string
  /** Commits in the window. 0 for a quiet row. */
  commits: number
  /** Her last commit on the default branch, merges and releases skipped. */
  latest?: ShortlogCommit
}

export type Shortlog = {
  /** Projects with a commit in the window, busiest first, at most SHORTLOG_ACTIVE_ROWS. */
  rows: ShortlogRow[]
  /** Projects without one, most recently touched first, at most SHORTLOG_QUIET_ROWS. */
  quiet: ShortlogRow[]
  /** Commits across every active project, not only the rows drawn. */
  total: number
  /** How many projects had a commit in the window. */
  active: number
}

type GraphQLCommit = {
  abbreviatedOid: string
  messageHeadline: string
  committedDate: string
  url: string
  author: { user: { login: string } | null } | null
}

type GraphQLRepoAlias = {
  defaultBranchRef: { target: { history?: { nodes: GraphQLCommit[] } } } | null
} | null

/** `user` for the counts, then one `r<i>` alias per project for its last commit. */
export type GraphQLShortlog = {
  user: {
    contributionsCollection: {
      commitContributionsByRepository: {
        contributions: { totalCount: number }
        repository: { url: string }
      }[]
    }
  } | null
  [alias: `r${number}`]: GraphQLRepoAlias | undefined
}

/** Merges and the changesets release commit say nothing about the work. */
const NOISE = /^(Merge (pull request|branch)|chore: version packages)/i

function repoKey(url: string) {
  return url.toLowerCase().replace(/\/+$/, "")
}

/** "owner/name" out of a frontmatter URL, or null for anything that isn't a repository. */
export function parseRepo(url: string): { owner: string; name: string } | null {
  const match = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+?)\/?$/i.exec(url)
  return match ? { owner: match[1], name: match[2] } : null
}

/**
 * One request for both halves of the card: the month's counts from `contributionsCollection`,
 * and each project's last commit through one aliased `repository` per project (`r0`, `r1`…).
 * The quiet projects need the alias — they have no contributions in the window, so the
 * collection never mentions them.
 *
 * Owners and names travel as variables, never spliced into the query text: they come from
 * frontmatter, and a variable cannot change the shape of the query.
 */
export function buildQuery(repos: { owner: string; name: string }[]) {
  const params = repos.map((_, i) => `$o${i}: String!, $n${i}: String!`).join(", ")
  const aliases = repos
    .map(
      (_, i) => `r${i}: repository(owner: $o${i}, name: $n${i}) {
        defaultBranchRef { target { ... on Commit { history(first: 20) { nodes {
          abbreviatedOid messageHeadline committedDate url author { user { login } }
        } } } } }
      }`,
    )
    .join("\n")
  const variables = Object.fromEntries(
    repos.flatMap((r, i) => [
      [`o${i}`, r.owner],
      [`n${i}`, r.name],
    ]),
  )
  // `to` is left out: GitHub fills it with now (or `from` + a year, whichever is sooner).
  const query = `
    query ($login: String!, $from: DateTime!${params ? `, ${params}` : ""}) {
      user(login: $login) {
        contributionsCollection(from: $from) {
          commitContributionsByRepository(maxRepositories: 25) {
            contributions { totalCount }
            repository { url }
          }
        }
      }
      ${aliases}
    }
  `
  return { query, variables }
}

/**
 * How long ago, as the card prints it. On the server and per request, never in the component:
 * a relative time computed on both sides of hydration is a mismatch waiting for a render that
 * straddles the hour. The fetch is cached for an hour, so `now` is taken after it.
 */
export function ago(iso: string, now: number): string {
  const hours = Math.max(0, Math.floor((now - Date.parse(iso)) / 3_600_000))
  if (hours < 1) return "now"
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return days < 60 ? `${days}d` : `${Math.floor(days / 30)}mo`
}

/**
 * The response, narrowed to the repositories that are projects on this site.
 *
 * Only those: the profile README and coursework have commits too, and a card under
 * `ls ./work` naming a repo with no page to link to would be the one row that goes nowhere.
 * The match is on the `github` URL in the project's frontmatter, so a new project shows up
 * here the day its MDX lands, with no list to keep in step.
 */
export function toShortlog(
  data: GraphQLShortlog,
  projects: ShortlogProject[],
  login: string,
  now: number,
): Shortlog {
  const byRepo = new Map(projects.map((p) => [repoKey(p.github), p]))
  const commits = new Map<string, number>()
  for (const { contributions, repository } of data.user?.contributionsCollection
    .commitContributionsByRepository ?? []) {
    const project = byRepo.get(repoKey(repository.url))
    if (!project) continue
    // Two entries can point at one project if a repo was renamed; GitHub reports them apart.
    commits.set(project.slug, (commits.get(project.slug) ?? 0) + contributions.totalCount)
  }

  // When each project last moved, for ordering the quiet ones. Kept beside the rows rather
  // than on them: the card has no use for the raw timestamp, only for `ago`.
  const lastAt = new Map<string, string>()
  const rows: ShortlogRow[] = projects.map((project, i) => {
    const nodes = data[`r${i}`]?.defaultBranchRef?.target.history?.nodes ?? []
    // The URL becomes an href, so it has to be GitHub's own https before it gets that far. It
    // comes from GitHub's API and always is; this is the check that keeps it so.
    const last = nodes.find(
      (n) =>
        n.author?.user?.login === login &&
        !NOISE.test(n.messageHeadline) &&
        n.url.startsWith("https://github.com/"),
    )
    if (last) lastAt.set(project.slug, last.committedDate)
    return {
      slug: project.slug,
      title: project.title,
      commits: commits.get(project.slug) ?? 0,
      latest: last && {
        sha: last.abbreviatedOid,
        message: last.messageHeadline,
        url: last.url,
        ago: ago(last.committedDate, now),
      },
    }
  })

  const active = rows.filter((r) => r.commits > 0).sort((a, b) => b.commits - a.commits)
  // ISO timestamps sort as strings; a project with no commit of hers at all sorts last.
  const when = (r: ShortlogRow) => lastAt.get(r.slug) ?? ""
  const quiet = rows.filter((r) => r.commits === 0).sort((a, b) => when(b).localeCompare(when(a)))

  return {
    rows: active.slice(0, SHORTLOG_ACTIVE_ROWS),
    quiet: quiet.slice(0, SHORTLOG_QUIET_ROWS),
    total: active.reduce((sum, row) => sum + row.commits, 0),
    active: active.length,
  }
}

/**
 * Start of the window: UTC midnight, SHORTLOG_DAYS ago.
 *
 * Midnight rather than "now minus thirty days", because `from` is in the request body and the
 * body is the cache key. A timestamp to the millisecond made every request a different key,
 * and `revalidate: 3600` would have cached nothing. Rounded to the day, one hour's visitors
 * share one fetch. An ISO timestamp all the way through, never `new Date("YYYY-MM-DD")`.
 */
export function windowStart(now: number): string {
  const today = new Date(now)
  today.setUTCHours(0, 0, 0, 0)
  return new Date(today.getTime() - SHORTLOG_DAYS * 86_400_000).toISOString()
}

/**
 * The same contract as `getContributions`: a state, never a throw.
 *
 * `error` is about this server: no token, a non-200, a GraphQL error. `empty` is about the
 * content, and it is decided before asking GitHub anything: no project has a `github` URL that
 * points at a repository, which is a fresh fork of this site. A month with no commits is not
 * `empty`. It is `ok` with no busy rows, and every project in the quiet list with its last
 * commit, which says far more than a blank frame would.
 */
export async function getShortlog(
  login: string,
  projects: ShortlogProject[],
): Promise<CardState<Shortlog>> {
  // A project whose `github` isn't a repository URL can't be asked about; it drops out here
  // rather than failing the whole query.
  const repos = projects.flatMap((p) => {
    const repo = parseRepo(p.github)
    return repo ? [{ project: p, ...repo }] : []
  })
  if (repos.length === 0) return { kind: "empty" }

  // After the empty check: a fork with no projects yet has nothing to ask about, and "couldn't
  // reach github" would blame a token it doesn't need.
  const token = process.env.GITHUB_TOKEN
  if (!token) return { kind: "error", message: "GITHUB_TOKEN not set" }

  const { query, variables } = buildQuery(repos)

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { login, from: windowStart(Date.now()), ...variables },
      }),
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      console.error(`[shortlog] GitHub responded ${res.status}`)
      return { kind: "error", message: `GitHub responded ${res.status}` }
    }

    const json = await res.json()
    const data = json?.data as GraphQLShortlog | undefined
    if (json.errors) {
      // 200 plus an `errors` array is how GitHub reports a bad login or a spent quota — and
      // also a single repository it can't resolve, renamed or made private. That last one
      // costs one row its last commit, not the card, so only a missing `user` is fatal.
      // The message only: the body echoes the query back.
      console.error("[shortlog] GraphQL error:", json.errors[0]?.message)
      if (!data?.user) return { kind: "error", message: "GraphQL error" }
    }
    if (!data?.user) return { kind: "error", message: "unexpected response" }

    const shortlog = toShortlog(
      data,
      repos.map((r) => r.project),
      login,
      Date.now(),
    )
    return { kind: "ok", data: shortlog }
  } catch (err) {
    // `err.message`, never the error: a failed fetch can carry its request, and the request
    // carries the Authorization header.
    console.error("[shortlog] fetch failed:", err instanceof Error ? err.message : err)
    return { kind: "error", message: "fetch failed" }
  }
}
