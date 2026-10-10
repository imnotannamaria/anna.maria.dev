import type { SiteData } from "../site-data"
import { PAGES } from "../front/pages"
import type { Folder, FileSystem } from "./shell"

/** The site as a file tree for the terminal, and the screen each file opens. */
const ROUTES: [method: string, path: string, keep: string][] = [
  ["POST", "/api/v1/wristkit/sync", "rate limit 30/5min · api key · zod"],
  ["GET", "/api/v1/poster/:id", "stored urls only, never an open proxy"],
  ["POST", "/api/v1/admin/log", "authkit + allowlist · zod"],
  ["PATCH", "/api/v1/admin/log/:id", "authkit + allowlist · zod"],
  ["DELETE", "/api/v1/admin/log/:id", "authkit + allowlist"],
  ["POST", "/api/v1/admin/roadmap", "authkit + allowlist · zod"],
  ["PATCH", "/api/v1/admin/roadmap/:id", "authkit + allowlist · zod"],
  ["DELETE", "/api/v1/admin/roadmap/:id", "authkit + allowlist"],
  ["POST", "/api/contact", "honeypot · zod → resend"],
  ["GET", "/api/now-playing", "spotify client credentials"],
  ["GET", "/api/og", "@vercel/og"],
]

const TABLES: Record<string, [column: string, type: string][]> = {
  log_entries: [
    ["id", "uuid pk"],
    ["slug", "text unique"],
    ["type", "text"],
    ["title", "text"],
    ["creator", "text?"],
    ["year", "integer?"],
    ["rating", "numeric?"],
    ["favorite", "boolean"],
    ["note", "text?"],
    ["poster_url", "text?"],
    ["external_url", "text?"],
    ["logged_at", "date"],
    ["published", "boolean"],
  ],
  roadmap_items: [
    ["id", "uuid pk"],
    ["slug", "text unique"],
    ["title", "text"],
    ["blurb", "text?"],
    ["status", "text = raw"],
    ["position", "integer"],
    ["plan_url", "text?"],
    ["shipped_at", "date?"],
  ],
  wristkit_samples: [
    ["id", "bigserial pk"],
    ["user_id", "uuid?"],
    ["metric", "text"],
    ["value", "numeric"],
    ["unit", "text"],
    ["recorded_at", "timestamptz"],
    ["source", "text?"],
    ["ingested_at", "timestamptz"],
  ],
}

function table(lines: string[][]): string {
  if (lines.length === 0) return ""
  const widths = lines[0].map((_, column) => Math.max(...lines.map((line) => line[column].length)))
  return lines
    .map((line) =>
      line
        .map((cell, column) => (column === line.length - 1 ? cell : cell.padEnd(widths[column])))
        .join("   "),
    )
    .join("\n")
}

function page(title: string, description: string, ...body: string[]): string {
  return [title.toUpperCase(), description, ...(body.length ? ["", ...body] : [])].join("\n")
}

const NO_DB = "this one lives in postgres, and postgres did not answer just now."

function count(values: string[]): string {
  const total = new Map<string, number>()
  for (const value of values) total.set(value, (total.get(value) ?? 0) + 1)
  return [...total].map(([name, n]) => `${name} ${n}`).join(" · ")
}

const tagline = (id: string) => PAGES.find((page) => page.id === id)?.tagline ?? ""

export function buildFiles(data: SiteData): FileSystem {
  const { years, email, socials, jobs, stack, apps, posts, projects, log } = data

  const root: Folder = {
    "home.txt": page(
      "home",
      `Full-stack Software Engineer, ${years} years building things end to end.`,
      "six doors, one per page:",
      table(
        PAGES.filter((item) => item.id !== "home").map((item) => [`  ${item.id}`, item.tagline]),
      ),
    ),

    "person.txt": page(
      "anna, the person",
      tagline("person"),
      "I'm Anna, from Pernambuco, and I live in Tamandaré, right by the beach.",
      "The gym is my daily reset button, five times a week, pretty much non negotiable.",
      "I'm a big fan of horror films, Mike Flanagan and Drag Race. I play a few",
      "instruments, all of them mediocrely, and I love every kind of music, mostly pop.",
      "I also answer to Abimaela, the cat in the corner.",
      "",
      "on the page:",
      "  camera roll · me, as a playlist · wristkit rings · emojis & gifs I overuse",
      "  the weather in Tamandaré · stickers · the log shelf · everyday things",
    ),

    "professional.txt": page(
      "anna, the professional",
      tagline("professional"),
      "I build things end to end, from the UI and the front, web or mobile, to shipping.",
      `About ${years} years across startups and bigger enterprise teams.`,
      "",
      "work and academic history:",
      table(
        jobs.map((t) => [
          `  ${t.current ? "now" : "before"}`,
          t.type,
          `${t.org} · ${t.role}`,
          `${t.from}–${t.current && t.type === "work" ? "" : t.until}`,
        ]),
      ),
      "",
      "stack:",
      table(stack.map((group) => [`  ${group.key}`, group.items.join(", ")])),
      "",
      "apps:",
      `  ${apps.map((app) => app.name).join(" · ")}`,
    ),

    notes: Object.fromEntries(
      posts.map((post) => [
        `${post.slug}.txt`,
        page(
          post.title,
          post.description,
          table([
            ["date", post.date.slice(0, 10)],
            ["tags", post.tags.join(", ")],
          ]),
        ),
      ]),
    ),

    projects: Object.fromEntries(
      projects.map((project) => [
        `${project.slug}.txt`,
        page(
          project.title,
          project.description,
          table([
            ["kind", project.type === "library" ? "open source" : project.type],
            ["date", project.date.slice(0, 10)],
            ["tags", project.tags.join(", ")],
            ...(project.github ? [["code", project.github]] : []),
            ...(project.live ? [["live", project.live]] : []),
          ]),
        ),
      ]),
    ),

    "wall-of-love.txt": page(
      "wall of love",
      tagline("wall-of-love"),
      "no letters yet. the wall on the page is showing placeholders.",
    ),

    "log.txt": page(
      "log",
      "Everything I finish: films, series, books, albums, podcasts and games. Rated when my heart demands.",
      ...(log === null
        ? [NO_DB]
        : [
            `${log.length} entries: ${count(log.map((entry) => entry.type))}`,
            "",
            "latest:",
            table(
              [...log]
                .sort((a, b) => b.loggedAt.localeCompare(a.loggedAt))
                .slice(0, 6)
                .map((entry) => [
                  `  ${entry.loggedAt}`,
                  entry.type,
                  entry.creator ? `${entry.title} — ${entry.creator}` : entry.title,
                ]),
            ),
          ]),
    ),

    "contact.txt": page(
      "contact",
      "Get in touch. Open to OSS collaborations and tech conversations.",
      table([
        ["email", email],
        ["github", socials.github],
        ["linkedin", socials.linkedin],
        ["x", socials.x],
      ]),
      "",
      "the postcard is on the page. this terminal does not send mail yet.",
    ),

    api: {
      "routes.txt": table([["METHOD", "PATH", "WHAT STANDS IN FRONT OF IT"], ...ROUTES]),
    },

    db: Object.fromEntries(
      Object.entries(TABLES).map(([name, columns]) => [`${name}.sql`, table(columns)]),
    ),

    ".secret": {
      "secret.txt": "you found it. nothing here yet, but the cat knows you looked.",
    },
  }

  const links: Record<string, string> = {
    "home.txt": "tela:home",
    "person.txt": "tela:person",
    "professional.txt": "tela:professional",
    notes: "tela:notes",
    projects: "tela:projects",
    "wall-of-love.txt": "tela:wall-of-love",
    "log.txt": "tela:log",
    "contact.txt": "tela:contact",
    ...Object.fromEntries(
      posts.map((post) => [`notes/${post.slug}.txt`, `tela:post:${post.slug}`]),
    ),
    ...Object.fromEntries(
      projects.map((p) => [`projects/${p.slug}.txt`, `tela:project:${p.slug}`]),
    ),

    admin: "tela:admin",
  }

  return { root, links }
}
