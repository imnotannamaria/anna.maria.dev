import { createMetadata } from "@/lib/metadata"
import { getPublishedProjects } from "@/lib/velite"
import { ProjectFeed, type TagCount } from "@/components/projects/project-feed"
import { type ProjectItem } from "@/components/projects/project-card"
import { DocLabel, Em } from "@/components/chrome/page-parts"
import { TypeIn } from "@/components/ui/type-in"

export const metadata = createMetadata({
  title: "Projects",
  description: "A collection of open-source tools, libraries, and side projects.",
  path: "/projects",
})

/**
 * The header is built here and handed to `ProjectFeed` as children. The feed has to be a
 * client component — the outline and the cards read the same filter — but the title and the
 * prose have no reason to go with it. Same split as `/blog`.
 */
export default function ProjectsPage() {
  const projects = getPublishedProjects()

  const items: ProjectItem[] = projects.map((project) => ({
    slug: project.slug,
    title: project.title,
    description: project.description,
    tags: project.tags,
    github: project.github,
    live: project.live,
    date: project.date,
    // Sliced, not parsed. `new Date("2026-01-01")` is UTC midnight, which is 2025 here.
    year: project.date.slice(0, 4),
    featured: project.featured,
    cover: project.cover,
  }))

  const counts = new Map<string, number>()
  for (const project of projects) {
    for (const tag of project.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  const tags: TagCount[] = Array.from(counts, ([name, count]) => ({ name, count })).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  )

  return (
    <ProjectFeed projects={items} tags={tags}>
      <nav
        aria-label="Breadcrumb"
        className="mb-8 font-mono text-xs"
        style={{ color: "var(--fg-muted)" }}
      >
        <span>~</span>
        <span aria-hidden style={{ opacity: 0.5, margin: "0 6px" }}>
          /
        </span>
        <span style={{ color: "var(--fg-primary)" }}>projects</span>
      </nav>

      <div id="projects" style={{ scrollMarginTop: 24 }}>
        <DocLabel level="#">ls ./projects --sort=date</DocLabel>

        <TypeIn
          as="h1"
          text="Projects."
          emphasis="Projects"
          speed={0.045}
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            fontSize: "clamp(48px, 6vw, 72px)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: "var(--fg-primary)",
            margin: 0,
            display: "block",
          }}
        />

        {/* No <Reveal>: this paragraph is the page's LCP element, and an entrance starting at
            `opacity: 0` ships that way in the SSR markup, so the largest thing on the page
            stays invisible until hydration plus the delay. The <TypeIn> title carries the
            entrance instead. Same shape on every page header. */}
        <p
          className="mt-4 text-[16px] leading-[1.6]"
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--fg-secondary)",
            maxWidth: "56ch",
          }}
        >
          Open-source tools, libraries and side projects. The things I built because I{" "}
          <Em>wanted them to exist.</Em> For the full archive, there is always{" "}
          <a
            href="https://github.com/imnotannamaria"
            target="_blank"
            rel="noopener noreferrer"
            className="border-b border-[color:var(--border-strong)] text-[color:var(--fg-primary)] transition-colors hover:border-[color:var(--fg-brand)] hover:text-[color:var(--fg-brand)]"
          >
            GitHub
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          .
        </p>
      </div>
    </ProjectFeed>
  )
}
