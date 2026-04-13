import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { GithubLogoIcon, ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr"
import { getPublishedProjects, getProjectBySlug } from "@/lib/velite"
import { formatDate } from "@/lib/utils"
import { MDXContent } from "@/components/blog/mdx-content"
import { Badge } from "@/components/ui/badge"
import { InlineArrow } from "@/components/ui/inline-arrow"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getPublishedProjects().map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = getProjectBySlug(slug)

  if (!project) return {}

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://anna-maria-dev.vercel.app"

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      type: "website",
      images: [`${baseUrl}/api/og?title=${encodeURIComponent(project.title)}`],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.description,
    },
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = getProjectBySlug(slug)

  if (!project) notFound()

  return (
    <div className="mx-auto w-full max-w-275 px-5 py-16">
      <Link
        href="/projects"
        className="group text-text-muted hover:text-text-primary mb-10 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <InlineArrow direction="left" />
        All projects
      </Link>

      <div className="mt-6 flex flex-col gap-10 lg:flex-row lg:gap-16">
        <aside className="shrink-0 lg:sticky lg:top-24 lg:w-56 lg:self-start">
          <h1 className="font-display text-text-primary text-2xl leading-tight font-bold">
            {project.title}
          </h1>
          <p className="text-text-secondary mt-2 text-sm leading-relaxed">{project.description}</p>

          <div className="mt-6 flex flex-col gap-2">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} on GitHub`}
                className="text-text-secondary hover:text-text-primary flex items-center gap-2 text-sm transition-colors"
              >
                <GithubLogoIcon size={14} />
                GitHub
              </a>
            )}
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} live demo`}
                className="text-text-secondary hover:text-text-primary flex items-center gap-2 text-sm transition-colors"
              >
                <ArrowSquareOutIcon size={14} />
                Live demo
              </a>
            )}
          </div>

          <div className="mt-6">
            <p className="text-text-muted mb-2 text-xs font-medium tracking-widest uppercase">
              Stack
            </p>
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-text-muted mb-1 text-xs font-medium tracking-widest uppercase">
              Published
            </p>
            <time dateTime={project.date} className="text-text-secondary font-mono text-sm">
              {formatDate(project.date)}
            </time>
          </div>
        </aside>

        <article className="min-w-0 flex-1">
          <MDXContent code={project.body} />
        </article>
      </div>
    </div>
  )
}
