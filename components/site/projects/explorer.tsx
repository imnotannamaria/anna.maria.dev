"use client"

import { FlaskIcon, PackageIcon, PushPinIcon, type Icon } from "@phosphor-icons/react"
import { useState } from "react"
import { ArrowLink } from "@/app/components/entrepta/arrow-link"
import { Badge } from "@/app/components/entrepta/badge"
import { ScreenLink } from "@/components/site/screen-link"
import { BrowserWindow } from "@/components/site/window"
import { Folder } from "@/components/site/folder"
import { Hint } from "@/components/site/hint"
import { Cover, ProjectLinks } from "@/components/site/project-cover"
import { address, projectScreen, type Project } from "./project"

const GROUPS: { type: string; title: string; Icon: Icon }[] = [
  { type: "library", title: "Open source", Icon: PackageIcon },
  { type: "demo", title: "Demos", Icon: FlaskIcon },
]

const TAGS = 6

export function Explorer({ projects }: { projects: Project[] }) {
  const [peeked, setPeeked] = useState(projects[0]?.slug)
  const [pinned, setPinned] = useState<string | null>(null)
  const open = pinned ?? peeked
  const pinnedProject = projects.find((project) => project.slug === pinned)

  const toggle = (slug: string) => {
    setPinned((before) => (before === slug ? null : slug))
    setPeeked(slug)
  }

  return (
    <div className="st-pj-explorer">
      <div className="flex min-w-0 flex-col gap-4">
        <Hint
          icon={<PushPinIcon aria-hidden size={13} weight={pinnedProject ? "fill" : "regular"} />}
          role="status"
        >
          {pinnedProject ? (
            <span>
              pinned: <strong className="font-medium">{pinnedProject.title}</strong>. click it again
              to let go
            </span>
          ) : (
            <span>hover to peek, click a folder to pin it</span>
          )}
        </Hint>
        {GROUPS.map((group) => {
          const inGroup = projects.filter((project) => project.type === group.type)
          if (inGroup.length === 0) return null
          return (
            <section key={group.type} className="st-pj-group">
              <h2 className="flex items-center gap-2">
                <group.Icon
                  aria-hidden
                  size={16}
                  weight="bold"
                  className="text-[var(--fg-brand)]"
                />
                <span className="text-heading-lg font-serif text-[var(--fg-primary)]">
                  {group.title}
                </span>
                <span className="text-mono-xs ml-auto font-mono text-[var(--fg-muted)]">
                  {inGroup.length}
                </span>
              </h2>
              <ul className="st-pj-folders">
                {inGroup.map((project) => (
                  <li key={project.slug}>
                    <button
                      type="button"
                      className="st-pj-grab st-folder-host focus-ring"
                      aria-pressed={project.slug === pinned}
                      aria-controls={`pj-${project.slug}`}
                      aria-label={`${project.title}, ${project.type}, ${project.year}${
                        project.featured ? ", featured" : ""
                      }. ${project.slug === pinned ? "Pinned. Click to let go." : "Click to pin."}`}
                      data-open={project.slug === open || undefined}
                      onPointerEnter={() => setPeeked(project.slug)}
                      onFocus={() => setPeeked(project.slug)}
                      onClick={() => toggle(project.slug)}
                    >
                      <Folder
                        title={project.title}
                        cover={project.cover}
                        techs={project.techs}
                        featured={project.featured}
                        sizes="160px"
                      />
                      <span aria-hidden className="text-mono-sm font-mono text-[var(--fg-primary)]">
                        {project.title}
                        <span className="text-mono-xs block text-[var(--fg-muted)]">
                          {project.type} · {project.year}
                        </span>
                      </span>
                      {project.slug === pinned ? (
                        <span aria-hidden className="st-pj-pin">
                          <PushPinIcon size={12} weight="fill" />
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>

      <div className="st-pj-side">
        {projects.map((project) => (
          <div key={project.slug} id={`pj-${project.slug}`} hidden={project.slug !== open}>
            <BrowserWindow
              as="article"
              className="st-enter"
              address={address(project)}
              action={
                <button
                  type="button"
                  className="st-window-pin focus-ring"
                  aria-pressed={project.slug === pinned}
                  aria-label={
                    project.slug === pinned ? `Unpin ${project.title}` : `Pin ${project.title}`
                  }
                  onClick={() => toggle(project.slug)}
                >
                  <PushPinIcon
                    aria-hidden
                    size={14}
                    weight={project.slug === pinned ? "fill" : "regular"}
                  />
                </button>
              }
            >
              <ScreenLink
                to={projectScreen(project)}
                className="focus-ring block"
                aria-label={`${project.title}: open the case study`}
              >
                <Cover project={project} sizes="(min-width: 900px) 640px, 100vw" />
              </ScreenLink>

              <div className="st-pj-slip">
                <h3 className="flex items-baseline justify-between gap-3">
                  <span className="text-heading-lg truncate font-serif text-[var(--fg-primary)]">
                    {project.title}
                  </span>
                  <span className="text-mono-xs font-mono whitespace-nowrap text-[var(--fg-muted)]">
                    {project.type} · {project.year}
                  </span>
                </h3>
                <p className="st-pj-summary text-body-md line-clamp-3 font-sans text-[var(--fg-secondary)]">
                  {project.summary}
                </p>
                <ul className="st-pj-tags" aria-label="Tags">
                  {project.tags.slice(0, TAGS).map((tag) => (
                    <li key={tag}>
                      <Badge color="brand">{tag}</Badge>
                    </li>
                  ))}
                  {project.tags.length > TAGS ? (
                    <li className="text-mono-xs font-mono text-[var(--fg-muted)]">
                      +{project.tags.length - TAGS}
                    </li>
                  ) : null}
                </ul>
                <div className="flex items-center justify-between gap-3 pt-1">
                  <ArrowLink asChild className="text-[var(--fg-brand-text)]">
                    <ScreenLink to={projectScreen(project)}>open the case study</ScreenLink>
                  </ArrowLink>
                  <ProjectLinks project={project} />
                </div>
              </div>
            </BrowserWindow>
          </div>
        ))}
      </div>
    </div>
  )
}
