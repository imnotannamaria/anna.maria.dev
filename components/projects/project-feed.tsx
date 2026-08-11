"use client"

/**
 * /projects: the outline, the tag filter and the grid — one component, because the three
 * share one piece of state. Same shape as `components/blog/blog-feed.tsx`, deliberately: two
 * sibling index pages that solved the same problem differently is exactly the divergence the
 * Standardization check in CLAUDE.md is about.
 *
 * `useUrlFilter`, not `useSearchParams`: on a statically rendered route the latter makes
 * prerender emit the Suspense fallback, so every project would be missing from the HTML a
 * crawler reads. The server snapshot is null, so the prerender holds all of them.
 *
 * Grouped by year so the outline has somewhere to point, and it costs nothing — years descend
 * and projects descend inside them, which is the order the grid already had.
 */

import { useMemo } from "react"
import { PageOutline, type OutlineItem } from "@/components/chrome/page-outline"
import { FilterPill, useUrlFilter } from "@/components/ui/url-filter"
import { ProjectCard, type ProjectItem } from "./project-card"

export type TagCount = { name: string; count: number }

function groupByYear(projects: ProjectItem[]) {
  const years = new Map<string, ProjectItem[]>()
  for (const project of projects) {
    const bucket = years.get(project.year)
    if (bucket) bucket.push(project)
    else years.set(project.year, [project])
  }
  // The list arrives newest first, so insertion order is already descending.
  return Array.from(years, ([year, items]) => ({ year, items }))
}

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

  const groups = useMemo(() => groupByYear(filtered), [filtered])

  const outline: OutlineItem[] = [
    { id: "projects", label: "projects", level: 1 },
    ...groups.map((g) => ({
      id: `year-${g.year}`,
      label: g.year,
      level: 2 as const,
      count: g.items.length,
    })),
  ]

  return (
    <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 min-[1100px]:grid-cols-[200px_minmax(0,1fr)]">
      <PageOutline
        items={outline}
        file="projects/"
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
      />

      <div className="min-w-0">
        <div className="mx-auto max-w-[880px] px-5 py-12 sm:px-8 lg:px-12">
          {children}

          <div role="group" aria-label="Filter by tag" className="mt-8 flex flex-wrap gap-2">
            <FilterPill
              label="all"
              count={projects.length}
              active={!active}
              onClick={() => setFilter(null)}
            />
            {tags.map((tag) => (
              <FilterPill
                key={tag.name}
                label={tag.name}
                count={tag.count}
                active={active === tag.name}
                onClick={() => setFilter(active === tag.name ? null : tag.name)}
              />
            ))}
          </div>

          {groups.length === 0 ? (
            <p className="mt-12 font-mono text-sm" style={{ color: "var(--fg-muted)" }}>
              {projects.length === 0
                ? "// nothing published yet."
                : "// nothing tagged that way yet."}
            </p>
          ) : (
            groups.map((group, gi) => (
              <section
                key={group.year}
                id={`year-${group.year}`}
                className="mt-10 border-t pt-8"
                style={{ borderColor: "var(--border-subtle)", scrollMarginTop: 24 }}
              >
                <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2
                    className="m-0"
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontWeight: 400,
                      fontSize: "clamp(24px, 3vw, 32px)",
                      lineHeight: 1.1,
                      letterSpacing: "-0.02em",
                      color: "var(--fg-primary)",
                    }}
                  >
                    {group.year}
                  </h2>
                  <span
                    className="font-mono text-[11px] tracking-[0.08em] uppercase"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {group.items.length} {group.items.length === 1 ? "project" : "projects"}
                  </span>
                </div>

                {/* min(280px, 100%) so a 375px viewport gets one column rather than a track
                    wider than the screen — the same rule /log's grid uses. */}
                <div className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-4">
                  {group.items.map((project, i) => (
                    <ProjectCard key={project.slug} project={project} index={gi === 0 ? i : 0} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
