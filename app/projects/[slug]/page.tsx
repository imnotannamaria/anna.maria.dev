import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import {
  getPublishedProjects,
  getProjectBySlug,
  getProjectToc,
  getProjectReadingStats,
} from "@/lib/velite"
import { formatDate } from "@/lib/utils"
import { MDXContent } from "@/components/blog/mdx-content"
import { Outline } from "@/components/outline"
import { Badge } from "@/app/components/entrepta/badge"

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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://annamaria.app"

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

  const { words, minutes } = getProjectReadingStats(slug)
  const toc = getProjectToc(slug)

  return (
    <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 min-[1100px]:grid-cols-[200px_minmax(0,1fr)]">
      <Outline filename={`${slug}.tsx`} items={toc} words={words} minutes={minutes} />

      <div className="min-w-0">
        <article className="mx-auto max-w-[760px] px-5 py-12 sm:px-8 lg:px-12">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-4 font-mono text-xs"
            style={{ color: "var(--fg-muted)" }}
          >
            <Link
              href="/projects"
              className="transition-colors hover:text-[color:var(--fg-primary)]"
            >
              ~
            </Link>
            <span aria-hidden style={{ opacity: 0.5, margin: "0 6px" }}>
              /
            </span>
            <Link
              href="/projects"
              className="transition-colors hover:text-[color:var(--fg-primary)]"
            >
              projects
            </Link>
            <span aria-hidden style={{ opacity: 0.5, margin: "0 6px" }}>
              /
            </span>
            <span style={{ color: "var(--fg-primary)" }}>{slug}.tsx</span>
          </nav>

          {/* Hero */}
          <header className="mb-12 border-b pb-8" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="mb-4 flex flex-wrap items-center gap-1.5">
              {project.featured && (
                <Badge variant="soft" color="brand" className="h-6 px-2.5 text-[11px]">
                  featured
                </Badge>
              )}
              {project.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  color="neutral"
                  className="h-6 px-2.5 text-[11px]"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 400,
                fontSize: "clamp(38px, 6vw, 68px)",
                lineHeight: 1,
                letterSpacing: "-0.02em",
                color: "var(--fg-primary)",
                margin: "0 0 16px",
              }}
            >
              {project.title}
            </h1>

            <p
              className="text-[19px] leading-[1.6]"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--fg-secondary)",
                maxWidth: "56ch",
                margin: "0 0 24px",
              }}
            >
              {project.description}
            </p>

            <dl
              className="mb-6 grid grid-cols-2 gap-3 rounded-[var(--radius-lg)] border p-4 sm:grid-cols-4"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
            >
              <MetaCol label="published" value={formatDate(project.date)} />
              <MetaCol label="read" value={`${minutes} min`} />
              <MetaCol label="words" value={words.toLocaleString()} />
              <MetaCol label="stack" value={String(project.tags.length)} />
            </dl>

            {(project.github || project.live) && (
              <div className="flex flex-wrap gap-6">
                {project.github && <CtaLink href={project.github} label="github ↗" />}
                {project.live && <CtaLink href={project.live} label="live demo ↗" />}
              </div>
            )}
          </header>

          {/* Prose */}
          <div id="doc-body">
            <MDXContent code={project.body} />
          </div>

          {/* Footer nav */}
          <div className="mt-16 border-t pt-6" style={{ borderColor: "var(--border-subtle)" }}>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[color:var(--fg-muted)] transition-colors hover:text-[color:var(--fg-primary)]"
            >
              <span aria-hidden style={{ color: "var(--fg-brand)" }}>
                ←
              </span>
              back to projects/
            </Link>
          </div>
        </article>
      </div>
    </div>
  )
}

function MetaCol({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt
        className="font-mono text-[10px] tracking-[0.08em] uppercase"
        style={{ color: "var(--fg-muted)" }}
      >
        {label}
      </dt>
      <dd className="font-mono text-[13px]" style={{ color: "var(--fg-primary)", margin: 0 }}>
        {value}
      </dd>
    </div>
  )
}

function CtaLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-[13px] transition-all duration-150 hover:tracking-[0.06em] hover:[color:var(--fg-brand)]"
      style={{ color: "var(--fg-primary)" }}
    >
      {label}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}
