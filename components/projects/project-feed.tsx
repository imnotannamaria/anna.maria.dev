"use client"

/**
 * /projects: the outline, the tag filter and the grid — one component, because the three
 * share one piece of state.
 *
 * `useUrlFilter`, not `useSearchParams`: on a statically rendered route the latter makes
 * prerender emit the Suspense fallback, so every project would be missing from the HTML a
 * crawler reads. The server snapshot is null, so the prerender holds all of them.
 *
 * Grouped by year so the outline has somewhere to point, and it costs nothing — years descend
 * and projects descend inside them, which is the order the grid already had.
 *
 * The shell is `FeedShell`, the same one /blog and /log are drawn in. Two sibling index pages
 * solving the same problem differently is the divergence the Standardization check in
 * CLAUDE.md is about — and three copies of the *same* solution was the duplication half of it.
 */

import { useMemo } from "react"
import { FeedShell, groupInOrder, type FeedGroup } from "@/components/chrome/feed-shell"
import { useUrlFilter } from "@/components/ui/url-filter"
import { ProjectCard, type ProjectItem } from "./project-card"

export type TagCount = { name: string; count: number }

export function ProjectFeed({
  projects,
  tags,
  children,
}: {
  projects: ProjectItem[]
  tags: TagCount[]
  /** The server-rendered page header. */
  children: React.ReactNode
}) {
  const tagNames = useMemo(() => tags.map((t) => t.name), [tags])
  const [active, setFilter] = useUrlFilter<string>("tag", tagNames, "/projects")

  const filtered = useMemo(
    () => (active ? projects.filter((p) => p.tags.includes(active)) : projects),
    [projects, active],
  )

  const groups: FeedGroup<ProjectItem>[] = useMemo(
    () =>
      groupInOrder(filtered, (project) => project.year).map(({ key, items }) => ({
        id: `year-${key}`,
        label: key,
        items,
      })),
    [filtered],
  )

  return (
    <FeedShell
      file="projects/"
      root={{ id: "projects", label: "projects" }}
      footer={
        <>
          <div className="flex justify-between">
            <span>{"// projects"}</span>
            <span style={{ color: "var(--fg-brand)" }}>{filtered.length}</span>
          </div>
          <div className="flex justify-between">
            <span>{"// tags"}</span>
            <span>{tags.length}</span>
          </div>
          <div>{"// open source"}</div>
        </>
      }
      filterLabel="Filter by tag"
      pills={tags.map((tag) => ({ key: tag.name, label: tag.name, count: tag.count }))}
      totalCount={projects.length}
      active={active}
      onFilter={setFilter}
      groups={groups}
      groupMeta={(group) =>
        `${group.items.length} ${group.items.length === 1 ? "project" : "projects"}`
      }
      empty={{
        all: "// nothing published yet.",
        filtered: "// nothing tagged that way yet.",
      }}
      /* min(280px, 100%) so a 375px viewport gets one column rather than a track wider than
         the screen — the same rule /log's grid uses. */
      listClassName="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-4"
      renderItem={(project, index) => (
        <ProjectCard key={project.slug} project={project} index={index} />
      )}
    >
      {children}
    </FeedShell>
  )
}
