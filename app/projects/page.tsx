import { Suspense } from "react"
import { createMetadata } from "@/lib/metadata"
import { numberToWord } from "@/lib/utils"
import { getPublishedProjects } from "@/lib/velite"
import type { ProjectCardData } from "@/components/projects/project-card"
import { TagFilter } from "./tag-filter"
import { ProjectList } from "./project-list"

export const metadata = createMetadata({
  title: "Projects",
  description: "A collection of open-source tools, libraries, and side projects.",
  path: "/projects",
})

export default function ProjectsPage() {
  const projects = getPublishedProjects()

  const tagCounts = new Map<string, number>()
  for (const project of projects) {
    for (const tag of project.tags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
  }
  const tags = Array.from(tagCounts, ([name, count]) => ({ name, count })).sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  const latestYear = projects[0]
    ? new Date(projects[0].date).getFullYear()
    : new Date().getFullYear()

  const projectItems: ProjectCardData[] = projects.map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    tags: p.tags,
    github: p.github,
    live: p.live,
    date: p.date,
    featured: p.featured,
  }))

  return (
    <div className="mx-auto w-full max-w-[920px] px-5 py-12 sm:px-8 lg:px-12">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 font-mono text-xs"
        style={{ color: "var(--fg-muted)" }}
      >
        <span>~</span>
        <span aria-hidden style={{ opacity: 0.5, margin: "0 6px" }}>
          /
        </span>
        <span style={{ color: "var(--fg-primary)" }}>projects</span>
      </nav>

      {/* Page header */}
      <header
        className="mb-8 grid grid-cols-1 items-end gap-6 border-b pb-8 md:grid-cols-[1fr_auto]"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div>
          <div
            className="mb-3 font-mono text-xs tracking-[0.08em] uppercase"
            style={{ color: "var(--fg-muted)" }}
          >
            <span style={{ color: "var(--fg-brand)" }}>$</span> ls ./projects --sort=date
          </div>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              fontSize: "clamp(48px, 6vw, 72px)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: "var(--fg-primary)",
              margin: 0,
            }}
          >
            Projects
          </h1>
          <p
            className="mt-4 text-[16px] leading-[1.6]"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--fg-secondary)",
              maxWidth: "56ch",
            }}
          >
            Open-source tools, libraries, and side projects — my latest work from{" "}
            <strong style={{ color: "var(--fg-primary)", fontWeight: 500 }}>2026</strong> onwards.
            For the full archive, check my{" "}
            <a
              href="https://github.com/imnotannamaria"
              target="_blank"
              rel="noopener noreferrer"
              className="border-b border-[color:var(--border-strong)] text-[color:var(--fg-primary)] transition-colors hover:border-[color:var(--fg-brand)] hover:text-[color:var(--fg-brand)]"
            >
              GitHub
              <span className="sr-only"> (opens in a new tab)</span>
            </a>{" "}
            or my{" "}
            <a
              href="https://anna-maria-portfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="border-b border-[color:var(--border-strong)] text-[color:var(--fg-primary)] transition-colors hover:border-[color:var(--fg-brand)] hover:text-[color:var(--fg-brand)]"
            >
              old portfolio
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </p>
        </div>

        <dl className="grid grid-cols-3 gap-2 md:self-end">
          <Stat label="total" value={numberToWord(projects.length)} />
          <Stat label="tags" value={numberToWord(tags.length)} />
          <Stat label="latest" value={String(latestYear)} />
        </dl>
      </header>

      <Suspense>
        <TagFilter tags={tags} total={projects.length} />
      </Suspense>

      <Suspense>
        <ProjectList projects={projectItems} />
      </Suspense>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="overflow-hidden rounded-[var(--radius-sm)] border px-2 py-2.5 sm:px-4 sm:py-3"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <dt
        className="mb-1.5 font-mono text-[10px] tracking-[0.08em] uppercase"
        style={{ color: "var(--fg-muted)" }}
      >
        {label}
      </dt>
      <dd
        className="text-[20px] sm:text-[34px]"
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: "var(--fg-brand)",
          margin: 0,
        }}
      >
        {value}
      </dd>
    </div>
  )
}
