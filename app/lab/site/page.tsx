import type { Metadata } from "next"
import { calcYearsOfExp } from "@/lib/experience"
import { TYPE_LABEL } from "@/lib/log/constants"
import { getPublishedEntries } from "@/lib/log/queries"
import { siteConfig } from "@/lib/site-config"
import { STACK_GROUPS } from "@/lib/stack"
import { getPublishedPosts, getPublishedProjects } from "@/lib/velite"
import type { SiteData } from "./site-data"
import { Admin } from "./front/admin/admin"
import { Contact } from "./front/contact/contact"
import { Home } from "./front/home/home"
import { Log } from "./front/log/log"
import { Notes } from "./front/notes/notes"
import { Post } from "./front/post/post"
import { OpenProject } from "./front/project/open-project"
import { Projects } from "./front/projects/projects"
import { Wall } from "./front/wall/wall"
import { APP_LIST } from "./front/professional/app-list"
import { CAREER } from "./front/professional/career"
import { STACK } from "./front/professional/stack-data"
import { Professional } from "./front/professional/professional"
import { Person } from "./front/person/person"
import { Chat } from "./ia/chat"
import { SiteFrame } from "./site-frame"
import { buildFiles } from "./terminal/files"
import { Terminal } from "./terminal/terminal"

export const metadata: Metadata = { title: "lab · site" }

export const dynamic = "force-dynamic"

export default async function Site() {
  const log = await getPublishedEntries().catch(() => null)
  const posts = getPublishedPosts()
  const projects = getPublishedProjects()

  const data: SiteData = {
    years: calcYearsOfExp(),
    email: siteConfig.email,
    socials: siteConfig.socials,

    jobs: CAREER.map(({ org, role, from, until, current, type }) => ({
      org,
      role,
      from: from[0],
      until: until?.[0] ?? new Date().getFullYear(),
      current,
      type,
    })),
    apps: APP_LIST.map(({ name, what }) => ({ name, what })),
    stack: STACK_GROUPS,
    posts: posts.map(({ slug, title, description, date, tags, featured }) => ({
      slug,
      title,
      description,
      date,
      tags,
      featured: featured,
    })),
    projects: projects.map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      date: p.date,
      tags: p.tags,
      type: p.kind,
      cover: p.cover ?? null,
      featured: p.featured,
      github: p.github ?? null,
      live: p.live ?? null,
    })),
    log:
      log?.map((entry) => ({
        type: TYPE_LABEL[entry.type],
        title: entry.title,
        creator: entry.creator,
        loggedAt: entry.loggedAt,
      })) ?? null,
  }

  return (
    <SiteFrame
      pages={{
        home: <Home />,
        person: <Person log={log} />,
        professional: <Professional />,
        notes: <Notes />,
        projects: <Projects />,
        "wall-of-love": <Wall />,
        contact: <Contact />,

        log: <Log entries={log} />,
        admin: <Admin entries={log} />,

        ...Object.fromEntries(
          posts.map((post) => [`post:${post.slug}`, <Post key={post.slug} slug={post.slug} />]),
        ),
        ...Object.fromEntries(
          projects.map((project) => [
            `project:${project.slug}`,
            <OpenProject key={project.slug} slug={project.slug} />,
          ]),
        ),
      }}
      back={<Terminal system={buildFiles(data)} className="h-full" />}
      ia={<Chat data={data} stack={STACK} />}
    />
  )
}
