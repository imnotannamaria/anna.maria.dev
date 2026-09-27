import { afterEach, describe, expect, it, vi } from "vitest"
import {
  ago,
  buildQuery,
  getShortlog,
  parseRepo,
  toShortlog,
  windowStart,
  type GraphQLShortlog,
  type ShortlogProject,
} from "./shortlog"
import { SHORTLOG_ACTIVE_ROWS, SHORTLOG_QUIET_ROWS } from "./shortlog-constants"

const LOGIN = "imnotannamaria"
const NOW = Date.parse("2026-09-26T12:00:00Z")

const gh = (name: string) => `https://github.com/imnotannamaria/${name}`
const project = (slug: string, repo = slug): ShortlogProject => ({
  slug,
  title: slug.replace("-", " "),
  github: gh(repo),
})

type Commit = { message: string; date: string; login?: string }

/** A response: counts for the window, and one alias per project in the order given. */
function response(counts: Record<string, number>, commits: (Commit[] | null)[]): GraphQLShortlog {
  const data: GraphQLShortlog = {
    user: {
      contributionsCollection: {
        commitContributionsByRepository: Object.entries(counts).map(([name, totalCount]) => ({
          contributions: { totalCount },
          repository: { url: gh(name) },
        })),
      },
    },
  }
  commits.forEach((list, i) => {
    data[`r${i}`] = list && {
      defaultBranchRef: {
        target: {
          history: {
            nodes: list.map((c, j) => ({
              abbreviatedOid: `sha${i}${j}`,
              messageHeadline: c.message,
              committedDate: c.date,
              url: `https://github.com/imnotannamaria/x/commit/${i}${j}`,
              author: { user: { login: c.login ?? LOGIN } },
            })),
          },
        },
      },
    }
  })
  return data
}

describe("toShortlog", () => {
  it("keeps only the repositories that are projects, busiest first", () => {
    const projects = [project("annamaria-app", "anna.maria.dev"), project("entrepta")]
    const result = toShortlog(
      response({ entrepta: 15, imnotannamaria: 3, "anna.maria.dev": 66 }, [[], []]),
      projects,
      LOGIN,
      NOW,
    )
    expect(result.rows.map((r) => [r.slug, r.commits])).toEqual([
      ["annamaria-app", 66],
      ["entrepta", 15],
    ])
    expect(result.total).toBe(81)
    expect(result.active).toBe(2)
  })

  it("matches the frontmatter URL whatever its case or trailing slash", () => {
    const projects = [{ slug: "from-anna", title: "from anna", github: `${gh("from-anna")}/` }]
    const result = toShortlog(response({ "From-Anna": 32 }, [[]]), projects, LOGIN, NOW)
    expect(result.rows.map((r) => r.commits)).toEqual([32])
  })

  it("adds up two entries that resolve to the same project", () => {
    const result = toShortlog(
      response({ entrepta: 4, Entrepta: 6 }, [[]]),
      [project("entrepta")],
      LOGIN,
      NOW,
    )
    expect(result.rows[0].commits).toBe(10)
  })

  it("gives each row her last commit, skipping merges, releases and other people", () => {
    const result = toShortlog(
      response({ entrepta: 3 }, [
        [
          { message: "Merge pull request #6 from x/y", date: "2026-09-26T10:00:00Z" },
          { message: "chore: version packages", date: "2026-09-26T09:00:00Z" },
          { message: "fix: someone else's", date: "2026-09-26T08:00:00Z", login: "bot" },
          { message: "fix(registry): card transitions", date: "2026-09-26T02:00:00Z" },
        ],
      ]),
      [project("entrepta")],
      LOGIN,
      NOW,
    )
    expect(result.rows[0].latest).toEqual({
      sha: "sha03",
      message: "fix(registry): card transitions",
      url: "https://github.com/imnotannamaria/x/commit/03",
      ago: "10h",
    })
  })

  it("never hands the card a commit link that isn't GitHub's own https", () => {
    const data = response({ entrepta: 1 }, [
      [
        { message: "evil", date: "2026-09-26T10:00:00Z" },
        { message: "fine", date: "2026-09-26T09:00:00Z" },
      ],
    ])
    const history = data.r0?.defaultBranchRef?.target.history
    if (!history) throw new Error("fixture")
    history.nodes[0].url = "javascript:alert(1)"
    const result = toShortlog(data, [project("entrepta")], LOGIN, NOW)
    expect(result.rows[0].latest?.message).toBe("fine")
  })

  it("lists the quiet projects under the busy ones, most recently touched first", () => {
    const projects = [
      project("entrepta"),
      project("wristkit"),
      project("mailroom"),
      project("tipfy"),
    ]
    const result = toShortlog(
      response({ entrepta: 5 }, [
        [{ message: "a", date: "2026-09-25T12:00:00Z" }],
        [{ message: "b", date: "2026-08-01T12:00:00Z" }],
        [{ message: "c", date: "2026-08-20T12:00:00Z" }],
        // A repository GitHub could not resolve comes back as null: the row stays, with no commit.
        null,
      ]),
      projects,
      LOGIN,
      NOW,
    )
    expect(result.rows.map((r) => r.slug)).toEqual(["entrepta"])
    expect(result.quiet.map((r) => [r.slug, r.latest?.ago])).toEqual([
      ["mailroom", "37d"],
      ["wristkit", "56d"],
      ["tipfy", undefined],
    ])
  })

  it("caps both lists, and still counts every busy project in the total", () => {
    const busy = Array.from({ length: SHORTLOG_ACTIVE_ROWS + 1 }, (_, i) => project(`busy-${i}`))
    const idle = Array.from({ length: SHORTLOG_QUIET_ROWS + 2 }, (_, i) => project(`idle-${i}`))
    const counts = Object.fromEntries(busy.map((p, i) => [p.slug, 10 + i]))
    const result = toShortlog(
      response(
        counts,
        [...busy, ...idle].map(() => []),
      ),
      [...busy, ...idle],
      LOGIN,
      NOW,
    )
    expect(result.rows).toHaveLength(SHORTLOG_ACTIVE_ROWS)
    expect(result.quiet).toHaveLength(SHORTLOG_QUIET_ROWS)
    expect(result.active).toBe(busy.length)
    expect(result.total).toBe(Object.values(counts).reduce((a, b) => a + b, 0))
  })
})

describe("buildQuery", () => {
  it("passes owners and names as variables, never inside the query text", () => {
    const { query, variables } = buildQuery([{ owner: "imnotannamaria", name: 'x") { evil' }])
    expect(query).not.toContain("evil")
    expect(query).toContain("r0: repository(owner: $o0, name: $n0)")
    expect(variables).toEqual({ o0: "imnotannamaria", n0: 'x") { evil' })
  })
})

describe("parseRepo", () => {
  it("reads owner and name from a repository URL, and nothing else", () => {
    expect(parseRepo("https://github.com/imnotannamaria/anna.maria.dev")).toEqual({
      owner: "imnotannamaria",
      name: "anna.maria.dev",
    })
    expect(parseRepo("https://github.com/imnotannamaria/from-anna/")).toEqual({
      owner: "imnotannamaria",
      name: "from-anna",
    })
    expect(parseRepo("https://github.com/imnotannamaria")).toBeNull()
    expect(parseRepo("https://gitlab.com/a/b")).toBeNull()
  })
})

describe("ago", () => {
  it("rounds down to the unit the card prints", () => {
    expect(ago("2026-09-26T11:40:00Z", NOW)).toBe("now")
    expect(ago("2026-09-26T02:00:00Z", NOW)).toBe("10h")
    expect(ago("2026-09-08T12:00:00Z", NOW)).toBe("18d")
    expect(ago("2026-04-10T12:00:00Z", NOW)).toBe("5mo")
  })
})

describe("windowStart", () => {
  it("is UTC midnight thirty days back, the same all day long", () => {
    const morning = Date.parse("2026-09-26T00:30:00Z")
    const night = Date.parse("2026-09-26T23:59:59Z")
    expect(windowStart(morning)).toBe("2026-08-27T00:00:00.000Z")
    expect(windowStart(night)).toBe(windowStart(morning))
  })
})

describe("getShortlog", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it("is empty, without asking GitHub, when no project points at a repository", async () => {
    const fetch = vi.fn()
    vi.stubGlobal("fetch", fetch)
    vi.stubEnv("GITHUB_TOKEN", "")
    expect(await getShortlog(LOGIN, [])).toEqual({ kind: "empty" })
    expect(
      await getShortlog(LOGIN, [
        { slug: "x", title: "x", github: "https://github.com/imnotannamaria" },
      ]),
    ).toEqual({ kind: "empty" })
    expect(fetch).not.toHaveBeenCalled()
  })

  it("is an error, not empty, when there are projects and no token", async () => {
    vi.stubEnv("GITHUB_TOKEN", "")
    const state = await getShortlog(LOGIN, [project("entrepta")])
    expect(state.kind).toBe("error")
  })

  it("keeps a month with no commits as ok, every project in the quiet list", async () => {
    vi.stubEnv("GITHUB_TOKEN", "t")
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          data: response({}, [[{ message: "feat: a", date: "2026-08-01T12:00:00Z" }]]),
        }),
      ),
    )
    const state = await getShortlog(LOGIN, [project("wristkit")])
    expect(state.kind).toBe("ok")
    if (state.kind !== "ok") return
    expect(state.data.rows).toEqual([])
    expect(state.data.quiet.map((r) => r.slug)).toEqual(["wristkit"])
  })
})
