"use client"

/**
 * /projects: the outline, the tag filter and the grid — one component, because the three
 * share one piece of state.
 *
 * `useUrlFilter`, not `useSearchParams`: on a statically rendered route the latter makes
 * prerender emit the Suspense fallback, so every project would be missing from the HTML a
 * crawler reads. The server snapshot is null, so the prerender holds all of them.
 *
 * Grouped by kind first, year second: libraries (entrepta, wristkit — something another
 * person installs) read as a different kind of artifact than demos (mailroom, capacity —
 * reference builds nobody installs), and putting them under one "Projects" heading flattened
 * that. `KIND_ORDER` puts library first regardless of date, so a demo shipped last week can't
 * push itself above a library that's been maintained for a year — `filtered` is stable-sorted
 * onto that order before `groupInOrder` buckets it.
 *
 * Year is still there, one level down, as each kind's `subgroups` — that's what keeps the
 * outline's year breakdown /blog established instead of losing it the moment a second axis
 * showed up. See the note on `FeedGroup.subgroups` in `feed-shell.tsx` for why it doesn't
 * draw its own heading yet: every project here is dated 2026.
 *
 * The shell is `FeedShell`, the same one /blog and /log are drawn in. Two sibling index pages
 * solving the same problem differently is the divergence the Standardization check in
 * CLAUDE.md is about — and three copies of the *same* solution was the duplication half of it.
 */

import { useMemo } from "react"
import { FeedShell, groupInOrder, type FeedGroup } from "@/components/chrome/feed-shell"
import { useUrlFilter } from "@/components/ui/url-filter"
import { KIND_ORDER, KIND_SECTION_LABEL, type ProjectKind } from "@/lib/projects"
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

  const groups: FeedGroup<ProjectItem>[] = useMemo(() => {
    const byKindOrder = [...filtered].sort(
      (a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind),
    )
    return groupInOrder(byKindOrder, (project) => project.kind).map(({ key, items }) => ({
      id: `kind-${key}`,
      label: KIND_SECTION_LABEL[key as ProjectKind],
      items,
      subgroups: groupInOrder(items, (project) => project.year).map((yearGroup) => ({
        id: `kind-${key}-year-${yearGroup.key}`,
        label: yearGroup.key,
        items: yearGroup.items,
      })),
    }))
  }, [filtered])

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
