import { ClockCounterClockwiseIcon, StackIcon } from "@phosphor-icons/react"
import { topicOf, type Topic } from "./topics"
import Image from "next/image"
import type { useTranslations } from "next-intl"
import type en from "@/messages/en.json"
import type { ReactElement, ReactNode } from "react"
import { Badge } from "@/app/components/entrepta/badge"
import type { SiteData } from "@/components/site/frame/site-data"
import { ScreenLink } from "@/components/site/screen-link"
import { dockChannels } from "@/components/site/contact/postcard"
import type { ScreenId } from "@/components/site/pages"
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

/** The suggested questions, as keys of `chat.questions` in the messages. */
export const QUESTIONS = ["who", "work", "stack", "built", "write", "reach"] as const

/** The chat's words, in the page's language: what `useTranslations("chat")` returns. */
export type ChatWords = ReturnType<typeof useTranslations<"chat">>
type PageWords = ReturnType<typeof useTranslations<"pages">>
type AnswerKey = keyof (typeof en)["chat"]["answers"]

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

/** The scripted answer to a question: the page its keywords point at, if any. */
export function answer(
  question: string,
  data: SiteData,
  stack: Group[],
  words: { chat: ChatWords; pages: PageWords },
): Answer {
  return answerOf(topicOf(question), data, stack, words)
}

/** What the script has to say about a page, and the card that goes with it. */
export function answerOf(
  topic: Topic | null,
  data: SiteData,
  stack: Group[],
  words: { chat: ChatWords; pages: PageWords },
): Answer {
  const t = (key: AnswerKey, values?: Record<string, string | number>) =>
    words.chat(`answers.${key}`, values)
  const { projects, jobs, posts, log, apps, years, email, socials } = data

  if (topic === "wall") {
    return {
      text: t("wall"),
      card: {
        name: t("wallCard"),
        page: "wall-of-love",
        body: (
          <List
            lines={[
              [t("wallHow"), t("wallHowValue")],
              [t("wallWhere"), t("wallWhereValue")],
            ]}
          />
        ),
      },
    }
  }

  if (topic === "log") {
    if (log === undefined) {
      return { text: t("logLoading") }
    }
    if (log === null) {
      return { text: t("logDown") }
    }
    const byType = new Map<string, number>()
    for (const entry of log) byType.set(entry.type, (byType.get(entry.type) ?? 0) + 1)
    const latest = [...log].sort((a, b) => b.loggedAt.localeCompare(a.loggedAt)).slice(0, 5)
    return {
      text: t("log", { count: log.length }),
      card: {
        name: t("logCard"),
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
      text: t("notes", { count: posts.length }),
      card: {
        name: t("notesCard"),
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
                    <Badge color="brand">{t("featured")}</Badge>
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
      text: t("projects", {
        count: projects.length,
        libraries: projects.filter((p) => p.type === "library").length,
        demos: projects.filter((p) => p.type !== "library").length,
      }),
      card: {
        name: t("projectsCard"),
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
                      {project.type === "library" ? t("openSource") : project.type} ·{" "}
                      {project.date.slice(0, 4)}
                      {project.featured ? ` · ${t("featured")}` : ""}
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
      text: t("stack"),
      card: {
        name: t("stackCard"),
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
              <span className="text-[var(--fg-muted)]">{t("apps")} </span>
              {apps.map((app) => app.name).join(" · ")}
            </p>
          </div>
        ),
      },
    }
  }

  if (topic === "career") {
    return {
      text: t("career", { years }),
      card: {
        name: t("careerCard"),
        icon: <ClockCounterClockwiseIcon />,
        page: "professional",
        body: (
          <List
            lines={jobs.map((job) => [
              `${job.from}–${job.current && job.type === "work" ? t("now") : job.until}`,
              <>
                <span className="text-[var(--fg-primary)]">{job.org}</span> · {job.role}
                <span className="ml-2 align-middle">
                  <Badge color={job.type === "work" ? "brand" : "neutral"}>
                    {t(job.type === "work" ? "work" : "study")}
                  </Badge>
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
      text: t("contact"),
      card: {
        name: t("contactCard"),
        page: "contact",
        body: (
          <div className="flex flex-col gap-2 pb-1">
            <Dock label={t("channels")} items={dockChannels({ email, ...socials })} />
          </div>
        ),
      },
    }
  }

  if (topic === "person") {
    return {
      text: t("person"),
      card: {
        name: t("personCard"),
        page: "person",
        body: (
          <List
            lines={[
              [t("thePage"), words.pages("person.tagline")],
              [t("onIt"), t("onItValue")],
            ]}
          />
        ),
      },
    }
  }

  return {
    text: t("none"),
  }
}
