import { FolderOpenIcon } from "@phosphor-icons/react/dist/ssr"
import { tileClass } from "@/components/site/tile"
import { Badge } from "@/app/components/entrepta/badge"
import { MDXContent } from "@/components/blog/mdx-content"
import { getPublishedProjects } from "@/lib/velite"
import { ScreenLink } from "../screen-link"
import { findBrand } from "../brand-data"
import { TechStickers } from "@/components/site/tech-stickers"
import { Cover, ProjectLinks } from "@/components/site/project-cover"
import { BrowserWindow } from "@/components/site/window"
import { address, type Project } from "../projects/project"
import { PageHeader } from "@/components/site/page-header"
import "./open-project.css"

export function OpenProject({ slug }: { slug: string }) {
  const raw = getPublishedProjects().find((item) => item.slug === slug)
  if (!raw) return null

  const project: Project = {
    slug: raw.slug,
    title: raw.title,
    summary: raw.description,
    tags: raw.tags,
    techs: raw.tags
      .flatMap((tag) => {
        const brand = findBrand(tag)
        return brand ? [{ name: tag, ...brand }] : []
      })
      .slice(0, 6),
    type: raw.kind,
    year: raw.date.slice(0, 4),
    cover: raw.cover ?? null,
    github: raw.github ?? null,
    live: raw.live ?? null,
    featured: raw.featured,
  }

  const stickers = <TechStickers techs={project.techs} label="Stack" />
  const body = (
    <div className="st-pa-body">
      <MDXContent code={raw.body} />
    </div>
  )
  const title = (
    <div className="flex min-w-0 flex-col gap-3">
      <p className="text-mono-xs font-mono text-[var(--fg-muted)]">
        {project.type} · {project.year}
      </p>
      <h2 className="st-pa-title font-serif text-[var(--fg-primary)]">{project.title}</h2>
      <p className="text-body-lg max-w-[56ch] font-sans text-[var(--fg-secondary)]">
        {project.summary}
      </p>
    </div>
  )

  return (
    <article className="st-room st-screen">
      <PageHeader
        icon={<FolderOpenIcon aria-hidden size={13} weight="bold" />}
        label={
          <>
            <ScreenLink
              to="projects"
              className="focus-ring underline decoration-[var(--border-strong)] decoration-dotted underline-offset-4 transition-colors hover:text-[var(--fg-brand-text)] hover:decoration-current"
            >
              projects
            </ScreenLink>{" "}
            / a project
          </>
        }
      />
      <div className="flex flex-col gap-8">
        {title}
        <BrowserWindow address={address(project)}>
          <Cover project={project} sizes="(min-width: 900px) 1100px, 100vw" />
        </BrowserWindow>
        <div className="st-pa-columns">
          {body}
          <aside className={tileClass({ size: "sm" }, "gap-4")}>
            <h3 className="text-mono-xs font-mono tracking-widest text-[var(--fg-muted)] uppercase">
              built with
            </h3>
            {stickers}
            <div className="flex items-center justify-between gap-3 border-t border-dashed border-[var(--border-subtle)] pt-3">
              <span className="text-mono-xs font-mono text-[var(--fg-muted)]">links</span>
              <ProjectLinks project={project} />
            </div>
            <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
              {project.tags.map((tag) => (
                <li key={tag}>
                  <Badge color="brand">{tag}</Badge>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </article>
  )
}
