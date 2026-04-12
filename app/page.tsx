import Link from "next/link"
import Image from "next/image"
import { siReact, siNextdotjs, siTypescript, siPython } from "simple-icons"
import { BlurFade } from "@/components/ui/blur-fade"
import { LinkButton } from "@/components/ui/button"
import { InlineArrow } from "@/components/ui/inline-arrow"
import { ProjectCard } from "@/components/projects/project-card"
import { getFeaturedProjects, getPublishedPosts } from "@/lib/velite"
import { formatDate, estimateReadingTime } from "@/lib/utils"

const stats = [
  { value: "5", label: "years of experience" },
  { value: "1/12", label: "open source projects this year" },
  { value: "0/12", label: "open source contributions this year" },
]

const mainStack = [
  { name: "React", path: siReact.path },
  { name: "Next.js", path: siNextdotjs.path },
  { name: "TypeScript", path: siTypescript.path },
  { name: "Python", path: siPython.path },
]

const career = [
  {
    company: "CESAR",
    role: "Full-stack Software Engineer",
    period: "2024 — present",
  },
  {
    company: "Avanade",
    role: "Full-stack Software Engineer",
    period: "2021 — 2024",
  },
]

export default function Home() {
  const featuredProjects = getFeaturedProjects()
  const recentPosts = getPublishedPosts().slice(0, 3)

  return (
    <div className="mx-auto w-full max-w-275 px-5">
      <section className="flex min-h-[88vh] items-center py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
        >
          <div className="h-150 w-150 rounded-full bg-indigo-500/5 blur-[120px] dark:bg-indigo-950/50" />
        </div>

        <div className="flex w-full flex-col-reverse gap-12 lg:flex-row lg:items-center lg:gap-16">
          <div className="flex-1">
            <BlurFade delay={0}>
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-950 px-4 py-1.5 text-xs font-medium text-indigo-300">
                <span className="size-1.5 rounded-full bg-indigo-400" />
                Full-stack Software Engineer · Brazil — Remote
              </span>
            </BlurFade>

            <BlurFade delay={0.1}>
              <h1 className="font-display text-text-primary mt-6 text-5xl leading-tight font-bold sm:text-6xl lg:text-7xl">
                Anna Maria
              </h1>
            </BlurFade>

            <BlurFade delay={0.2}>
              <p className="mt-3 text-lg text-indigo-400 sm:text-xl">
                I build things I wish existed.
              </p>
            </BlurFade>

            <BlurFade delay={0.3}>
              <p className="text-text-primary/80 mt-4 max-w-lg text-sm leading-relaxed">
                Full-stack Software Engineer with 5 years shipping web products. Currently at CESAR
                and always working on something open source on the side.
              </p>
            </BlurFade>

            <BlurFade delay={0.4}>
              <div className="mt-8 flex flex-wrap gap-3">
                <LinkButton href="/projects" variant="primary">
                  View projects
                </LinkButton>
                <LinkButton href="/contact" variant="ghost">
                  Get in touch
                </LinkButton>
              </div>
            </BlurFade>

            <BlurFade delay={0.5}>
              <div className="text-text-muted mt-5 flex flex-wrap items-center gap-2 text-xs">
                <span>Press</span>
                <span className="border-border bg-bg-surface text-text-secondary inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono shadow-sm">
                  <kbd className="leading-none">Command</kbd>
                  <span className="text-text-muted">+</span>
                  <kbd className="leading-none">P</kbd>
                </span>
                <span>to play piano</span>
              </div>
            </BlurFade>
          </div>

          <BlurFade delay={0.2} className="flex justify-center lg:justify-end">
            <div className="relative size-56 shrink-0 sm:size-64 lg:size-72">
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-2xl bg-indigo-500/10 blur-2xl"
              />
              <div className="relative overflow-hidden rounded-2xl">
                <Image
                  src="https://github.com/imnotannamaria.png"
                  alt="Anna Maria"
                  width={288}
                  height={288}
                  className="h-full w-full object-cover grayscale"
                  priority
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-indigo-950/10 mix-blend-color"
                />
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      <section className="border-border border-y py-14">
        <BlurFade delay={0.5}>
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
            <div className="flex-1">
              <div className="mb-6 flex gap-8">
                {stats.map((stat, i) => (
                  <div key={i} className="flex flex-col gap-0.5">
                    <span className="font-display text-text-primary text-2xl font-bold">
                      {stat.value}
                    </span>
                    <span className="text-text-secondary text-xs">{stat.label}</span>
                  </div>
                ))}
              </div>

              <div className="text-text-secondary space-y-3 text-sm leading-relaxed">
                <p>
                  I&apos;m a Full-Stack Software Engineer based in Pernambuco, Brazil. I currently
                  work at CESAR on ESG Carbon, a platform I helped architect from zero. Before that,
                  I spent three years at Avanade delivering chatbot and RAG-based AI products for
                  large enterprise clients.
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {mainStack.map(({ name, path }) => (
                  <span
                    key={name}
                    className="border-border bg-bg-surface text-text-secondary inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-[11px]"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width={11}
                      height={11}
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d={path} />
                    </svg>
                    {name}
                  </span>
                ))}
              </div>

              <Link
                href="/about"
                className="group mt-6 inline-flex items-center gap-1.5 text-sm text-indigo-400 transition-colors hover:text-indigo-300"
              >
                More about me <InlineArrow />
              </Link>
            </div>

            <div className="shrink-0 lg:w-64">
              <p className="text-text-muted mb-5 font-mono text-xs tracking-widest uppercase">
                Experience
              </p>
              <ol className="space-y-0">
                {career.map((item, i) => (
                  <BlurFade key={item.company} delay={0.6 + i * 0.12}>
                    <li className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="bg-bg-base mt-1 size-2.5 shrink-0 rounded-full border-2 border-indigo-500" />
                        {i < career.length - 1 && (
                          <span className="mt-1.5 w-px flex-1 bg-indigo-900/70" />
                        )}
                      </div>
                      <div className="pb-6">
                        <p className="text-text-primary text-sm font-medium">{item.company}</p>
                        <p className="text-text-secondary text-xs">{item.role}</p>
                        <time className="text-text-muted font-mono text-xs">{item.period}</time>
                      </div>
                    </li>
                  </BlurFade>
                ))}
              </ol>
            </div>
          </div>
        </BlurFade>
      </section>

      {featuredProjects.length > 0 && (
        <section className="py-16">
          <BlurFade delay={0.65}>
            <SectionHeader title="Featured Projects" href="/projects" linkLabel="All projects" />
          </BlurFade>

          <BlurFade delay={0.7}>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {featuredProjects.slice(0, 2).map((project) => (
                <ProjectCard
                  key={project.slug}
                  slug={project.slug}
                  title={project.title}
                  description={project.description}
                  tags={project.tags}
                  github={project.github}
                  live={project.live}
                />
              ))}
            </div>
          </BlurFade>
        </section>
      )}

      {recentPosts.length > 0 && (
        <section className="py-16">
          <BlurFade delay={0.75}>
            <SectionHeader title="Recent Posts" href="/blog" linkLabel="All posts" />
          </BlurFade>

          <BlurFade delay={0.8}>
            <ul className="divide-border mt-6 divide-y">
              {recentPosts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex items-center gap-6 py-5 transition-colors"
                  >
                    <time
                      dateTime={post.date}
                      className="text-text-muted hidden w-28 shrink-0 font-mono text-xs sm:block"
                    >
                      {formatDate(post.date)}
                    </time>
                    <span className="text-text-primary flex-1 text-sm font-medium transition-colors group-hover:text-indigo-400">
                      {post.title}
                    </span>
                    <span className="text-text-muted hidden shrink-0 text-xs sm:block">
                      {estimateReadingTime(post.body)} min
                    </span>
                    <span className="text-text-muted shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                      <InlineArrow />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </BlurFade>
        </section>
      )}
    </div>
  )
}

function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string
  href: string
  linkLabel: string
}) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="font-display text-text-primary text-xl font-semibold">{title}</h2>
      <Link
        href={href}
        className="group text-text-muted inline-flex items-center gap-1.5 text-sm transition-colors hover:text-indigo-400"
      >
        {linkLabel} <InlineArrow />
      </Link>
    </div>
  )
}
