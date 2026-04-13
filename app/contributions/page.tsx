import { Suspense } from "react"
import { createMetadata } from "@/lib/metadata"
import { getPublishedContributions } from "@/lib/velite"
import { ProjectCard } from "@/components/projects/project-card"
import { TagFilter } from "./tag-filter"

export const metadata = createMetadata({
  title: "Contributions",
  description: "Open-source contributions to projects I believe in.",
  path: "/contributions",
})

export default function ContributionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const contributions = getPublishedContributions()
  const allTags = Array.from(new Set(contributions.flatMap((c) => c.tags))).sort()

  return (
    <div className="mx-auto w-full max-w-275 px-5 py-16">
      <div className="mb-10">
        <h1 className="font-display text-text-primary text-4xl font-bold">
          Contributions{" "}
          <span className="text-2xl font-normal text-indigo-500">({contributions.length})</span>
        </h1>
        <p className="text-text-secondary mt-2">
          Open-source contributions to projects I believe in. Bug fixes, features, and documentation
          improvements.
        </p>
      </div>

      <Suspense>
        <TagFilter tags={allTags} />
      </Suspense>

      <ContributionGrid contributions={contributions} searchParams={searchParams} />
    </div>
  )
}

async function ContributionGrid({
  contributions,
  searchParams,
}: {
  contributions: ReturnType<typeof getPublishedContributions>
  searchParams: Promise<{ tag?: string }>
}) {
  const { tag } = await searchParams
  const filtered = tag ? contributions.filter((c) => c.tags.includes(tag)) : contributions

  if (filtered.length === 0) {
    return (
      <p className="text-text-muted mt-12 text-center">
        My goal is 12 open-source contributions this year. Already working on it.
      </p>
    )
  }

  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2">
      {filtered.map((contribution) => (
        <ProjectCard
          key={contribution.slug}
          slug={contribution.slug}
          title={contribution.title}
          description={contribution.description}
          tags={contribution.tags}
          github={contribution.repo}
          live={contribution.pr}
          basePath="/contributions"
        />
      ))}
    </div>
  )
}
