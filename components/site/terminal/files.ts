import type { SiteData } from "@/components/site/frame/site-data"
import { PAGES, type PageId } from "@/components/site/pages"
import type { Directory, FileSystem, ShellWords } from "./shell"

/** The site as a file tree for the terminal, and the screen each file opens. */
const ROUTES: [method: string, path: string, keep: string][] = [
  ["POST", "/api/v1/wristkit/sync", "rate limit 30/5min · api key · zod"],
  ["GET", "/api/v1/poster/:id", "stored urls only, never an open proxy"],
  ["GET", "/api/v1/site/log", "rate limit 30/min · public, what /log shows"],
  ["POST", "/api/v1/ai/chat", "zod · 10/day per visitor · daily budget · no tools"],
  ["POST", "/api/v1/admin/log", "authkit + allowlist · zod"],
  ["PATCH", "/api/v1/admin/log/:id", "authkit + allowlist · zod"],
  ["DELETE", "/api/v1/admin/log/:id", "authkit + allowlist"],
  ["POST", "/api/v1/admin/wall", "authkit + allowlist · zod"],
  ["POST", "/api/v1/invite/:token", "one use · 24h · zod · photo checked by its bytes"],
  ["POST", "/api/v1/wall/:id/react", "rate limit 40/10min · zod · approved letters only"],
  ["POST", "/api/v1/bug", "rate limit 5/10min · honeypot · zod → resend"],
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

function count(values: string[]): string {
  const total = new Map<string, number>()
  for (const value of values) total.set(value, (total.get(value) ?? 0) + 1)
  return [...total].map(([name, n]) => `${name} ${n}`).join(" · ")
}

/**
 * The words the files are written with, in the page's language: what `useTranslations("terminal")`
 * and `useTranslations("pages")` return, plus the shell's own sentences.
 */
export type FileWords = {
  files: (key: string, values?: Record<string, string | number>) => string
  page: (id: PageId, part: "label" | "tagline") => string
  shell: ShellWords
}

export function buildFiles(data: SiteData, words: FileWords): FileSystem {
  const t = words.files
  const tagline = (id: PageId) => words.page(id, "tagline")
  const { years, email, socials, jobs, stack, apps, posts, projects, log } = data

  const root: Directory = {
    "home.txt": page(
      words.page("home", "label"),
      t("home", { years }),
      t("doors"),
      table(
        PAGES.filter((item) => item.id !== "home").map((item) => [
          `  ${item.id}`,
          tagline(item.id),
        ]),
      ),
    ),

    "person.txt": page(
      words.page("person", "label"),
      tagline("person"),
      ...[0, 1, 2, 3, 4].map((line) => t(`person.${line}`)),
      "",
      t("onThePage"),
      t("personItems1"),
      t("personItems2"),
    ),

    "professional.txt": page(
      words.page("professional", "label"),
      tagline("professional"),
      t("professional1"),
      t("professional2", { years }),
      "",
      t("history"),
      table(
        jobs.map((job) => [
          `  ${job.current ? t("now") : t("before")}`,
          t(job.type === "work" ? "work" : "study"),
          `${job.org} · ${job.role}`,
          `${job.from}–${job.current && job.type === "work" ? "" : job.until}`,
        ]),
      ),
      "",
      t("stack"),
      table(stack.map((group) => [`  ${group.key}`, group.items.join(", ")])),
      "",
      t("apps"),
      `  ${apps.map((app) => app.name).join(" · ")}`,
    ),

    notes: Object.fromEntries(
      posts.map((post) => [
        `${post.slug}.txt`,
        page(
          post.title,
          post.description,
          table([
            [t("date"), post.date.slice(0, 10)],
            [t("tags"), post.tags.join(", ")],
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
            [t("kind"), project.type === "library" ? t("openSource") : project.type],
            [t("date"), project.date.slice(0, 10)],
            [t("tags"), project.tags.join(", ")],
            ...(project.github ? [[t("code"), project.github]] : []),
            ...(project.live ? [[t("live"), project.live]] : []),
          ]),
        ),
      ]),
    ),

    "wall-of-love.txt": page(
      words.page("wall-of-love", "label"),
      tagline("wall-of-love"),
      t("wall1"),
      t("wall2"),
    ),

    "log.txt": page(
      "log",
      t("log"),
      ...(log === undefined
        ? [t("logLoading")]
        : log === null
          ? [t("noDb")]
          : [
              t("entries", { count: log.length, byType: count(log.map((entry) => entry.type)) }),
              "",
              t("latest"),
              table(
                [...log]
                  .sort((a, b) => b.loggedAt.localeCompare(a.loggedAt))
                  .slice(0, 6)
                  .map((entry) => [
                    `  ${entry.loggedAt}`,
                    entry.type,
                    entry.creator ? `${entry.title} · ${entry.creator}` : entry.title,
                  ]),
              ),
            ]),
    ),

    "contact.txt": page(
      words.page("contact", "label"),
      t("contact"),
      table([
        ["email", email],
        ["github", socials.github],
        ["linkedin", socials.linkedin],
        ["x", socials.x],
      ]),
      "",
      t("postcard"),
    ),

    api: {
      "routes.txt": table([[0, 1, 2].map((column) => t(`routesHead.${column}`)), ...ROUTES]),
    },

    db: Object.fromEntries(
      Object.entries(TABLES).map(([name, columns]) => [`${name}.sql`, table(columns)]),
    ),

    ".secret": {
      "secret.txt": t("secret"),
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

  return { root, links, words: words.shell }
}
