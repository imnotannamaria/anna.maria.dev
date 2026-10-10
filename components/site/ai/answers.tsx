import { ClockCounterClockwiseIcon, StackIcon } from "@phosphor-icons/react"
import { topicOf } from "./topics"
import Image from "next/image"
import type { ReactElement, ReactNode } from "react"
import { Badge } from "@/app/components/entrepta/badge"
import type { SiteData } from "@/components/site/frame/site-data"
import { ScreenLink } from "@/components/site/screen-link"
import { dockChannels } from "@/components/site/contact/postcard"
import { PAGES, type ScreenId } from "@/components/site/pages"
import { TechStickers } from "@/components/site/tech-stickers"
import { Dock } from "@/components/site/dock"
import type { Group } from "@/components/site/professional/stack-data"

/** What the chat answers, for now: a script. Keyword routing over the site's own content, no model. */
export type Answer = {
  text: string

  card?: {
    name: string

    icon?: ReactElement
    body: ReactNode

    page?: ScreenId
  }
}

export const QUESTIONS = [
  "Who is Anna?",
  "Where has she worked?",
  "What is her stack?",
  "What has she built?",
  "What does she write about?",
  "How do I reach her?",
] as const

function List({ lines }: { lines: [key: ReactNode, value: ReactNode][] }) {
  return (
    <dl className="st-ia-list text-mono-md font-mono">
      {lines.map(([key, value], index) => (
        <div key={index}>
          <dt>{key}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

const UNDERLINED =
  "focus-ring underline decoration-[var(--border-strong)] decoration-dotted underline-offset-4 hover:decoration-[var(--fg-brand)]"

const tagline = (id: string) => PAGES.find((page) => page.id === id)?.tagline ?? ""

export function answer(question: string, data: SiteData, stack: Group[]): Answer {
  const topic = topicOf(question)
  const { projects, jobs, posts, log, apps, years, email, socials } = data

  if (topic === "wall") {
    return {
      text: "There are no letters yet. The wall on the page is showing placeholders.",
      card: {
        name: "wall of love",
        page: "wall-of-love",
        body: (
          <List
            lines={[
              ["letters", "0"],
              ["how they get in", "by invitation"],
            ]}
          />
        ),
      },
    }
  }

  if (topic === "log") {
    if (log === undefined) {
      return { text: "The log is still loading. Ask me again in a second." }
    }
    if (log === null) {
      return { text: "The log lives in Postgres, and Postgres did not answer just now." }
    }
    const byType = new Map<string, number>()
    for (const entry of log) byType.set(entry.type, (byType.get(entry.type) ?? 0) + 1)
    const latest = [...log].sort((a, b) => b.loggedAt.localeCompare(a.loggedAt)).slice(0, 5)
    return {
      text: `${log.length} things finished and logged so far. These are the latest.`,
      card: {
        name: "log",
        page: "log",
        body: (
          <div className="flex flex-col gap-3">
            <p className="flex flex-wrap gap-1.5">
              {[...byType].map(([type, n]) => (
                <Badge key={type} color="brand">
                  {type} {n}
                </Badge>
              ))}
            </p>
            <List
              lines={latest.map((entry) => [
                entry.loggedAt.slice(0, 10),
                <>
                  {entry.title}
                  {entry.creator ? (
                    <span className="text-[var(--fg-muted)]"> · {entry.creator}</span>
                  ) : null}
                </>,
              ])}
            />
          </div>
        ),
      },
    }
  }

  if (topic === "notes") {
    const sorted = [...posts].sort((a, b) => Number(b.featured) - Number(a.featured))
    return {
      text: `${posts.length} notes so far. The featured one comes first.`,
      card: {
        name: "notes",
        page: "notes",
        body: (
          <List
            lines={sorted.map((post) => [
              post.date.slice(0, 10),
              <>
                <ScreenLink to={`post:${post.slug}`} className={UNDERLINED}>
                  {post.title}
                </ScreenLink>
                {post.featured ? (
                  <span className="ml-2 align-middle">
                    <Badge color="brand">featured</Badge>
                  </span>
                ) : null}
              </>,
            ])}
          />
        ),
      },
    }
  }

  if (topic === "projects") {
    const sorted = [...projects].sort((a, b) => Number(b.featured) - Number(a.featured))
    return {
      text: `${projects.length} projects are published here: ${
        projects.filter((p) => p.type === "library").length
      } open source, ${projects.filter((p) => p.type !== "library").length} demos.`,
      card: {
        name: "projects",
        page: "projects",
        body: (
          <ul className="st-ia-projects">
            {sorted.map((project) => (
              <li key={project.slug}>
                <ScreenLink to={`project:${project.slug}`} className="st-ia-project focus-ring">
                  <span className="st-ia-cover">
                    {project.cover ? <Image src={project.cover} alt="" fill sizes="96px" /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="text-heading-md block truncate font-serif text-[var(--fg-primary)]">
                      {project.title}
                    </span>
                    <span className="text-mono-xs block truncate font-mono text-[var(--fg-muted)]">
                      {project.type === "library" ? "open source" : project.type} ·{" "}
                      {project.date.slice(0, 4)}
                      {project.featured ? " · featured" : ""}
                    </span>
                    <span className="text-body-md line-clamp-2 font-sans text-[var(--fg-secondary)]">
                      {project.description}
                    </span>
                  </span>
                </ScreenLink>
              </li>
            ))}
          </ul>
        ),
      },
    }
  }

  if (topic === "stack") {
    return {
      text: "Full-stack. Here it is by group, and under it the apps where the work happens.",
      card: {
        name: "stack",
        icon: <StackIcon />,
        page: "professional",
        body: (
          <div className="flex flex-col gap-4">
            {stack.map((group) => (
              <section key={group.id} className="flex flex-col gap-2">
                <h3 className="text-mono-xs font-mono tracking-widest text-[var(--fg-muted)] uppercase">
                  {group.id}
                </h3>
                <TechStickers techs={group.techs} label={group.id} />
              </section>
            ))}
            <p className="text-mono-sm border-t border-dashed border-[var(--border-subtle)] pt-3 font-mono text-[var(--fg-secondary)]">
              <span className="text-[var(--fg-muted)]">apps </span>
              {apps.map((app) => app.name).join(" · ")}
            </p>
          </div>
        ),
      },
    }
  }

  if (topic === "career") {
    return {
      text: `${years} years shipping, since March 2021. Work and study, on the same timeline.`,
      card: {
        name: "work and academic history",
        icon: <ClockCounterClockwiseIcon />,
        page: "professional",
        body: (
          <List
            lines={jobs.map((t) => [
              `${t.from}–${t.current && t.type === "work" ? "now" : t.until}`,
              <>
                <span className="text-[var(--fg-primary)]">{t.org}</span> · {t.role}
                <span className="ml-2 align-middle">
                  <Badge color={t.type === "work" ? "brand" : "neutral"}>{t.type}</Badge>
                </span>
              </>,
            ])}
          />
        ),
      },
    }
  }

  if (topic === "contact") {
    return {
      text: "Here is every way in. Each one opens, and each one copies.",
      card: {
        name: "contact",
        page: "contact",
        body: (
          <div className="flex flex-col gap-2 pb-1">
            <Dock label="Channels" items={dockChannels({ email, ...socials })} />
          </div>
        ),
      },
    }
  }

  if (topic === "person") {
    return {
      text: "Anna is from Pernambuco and lives in Tamandaré, right by the beach. The gym is her daily reset button, five times a week. She is a big fan of horror films, Mike Flanagan and Drag Race, plays a few instruments, all of them mediocrely, loves every kind of music, mostly pop, and answers to Abimaela, the cat in the corner.",
      card: {
        name: "anna, the person",
        page: "person",
        body: (
          <List
            lines={[
              ["the page", tagline("person")],
              [
                "on it",
                "camera roll, me as a playlist, wristkit, the weather in Tamandaré, stickers, the log, everyday things",
              ],
            ]}
          />
        ),
      },
    }
  }

  return {
    text: "There is no model behind this yet, so I answer from a script. I know who she is, where she has worked, her stack, her projects, her notes, her log and how to reach her. Try one of those.",
  }
}
