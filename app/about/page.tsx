import Image from "next/image"
import { createMetadata } from "@/lib/metadata"
import { GithubCalendar } from "@/components/about/github-calendar"
import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/ui/icons"
import { Badge } from "@/app/components/entrepta/badge"
import {
  BarbellIcon,
  FilmSlateIcon,
  MapPinIcon,
  StarIcon,
  VinylRecordIcon,
} from "@phosphor-icons/react/dist/ssr"
import {
  siTypescript,
  siJavascript,
  siPython,
  siReact,
  siNextdotjs,
  siTailwindcss,
  siRadixui,
  siRedux,
  siJest,
  siPytest,
  siCypress,
  siSonarqubeserver,
  siNodedotjs,
  siDjango,
  siDotnet,
  siGraphql,
  siHono,
  siNestjs,
  siFastapi,
  siPostgresql,
  siSupabase,
  siMongodb,
  siMysql,
  siFirebase,
  siDrizzle,
  siPrisma,
  siRedis,
  siPlotly,
  siLangchain,
  siPandas,
  siClaude,
  siDocker,
  siVercel,
  siResend,
  siFigma,
} from "simple-icons"
import { AboutOutline, type OutlineItem } from "./about-outline"
import { calcYearsOfExp, yearsWord } from "@/lib/experience"
import { siteConfig } from "@/lib/site-config"

export const metadata = createMetadata({
  title: "About",
  description: "A bit about who I am, where I've worked, and what I care about.",
  path: "/about",
})

// ─── Tech icon registry ──────────────────────────────────────────────────────

const ICONS: Record<string, string> = {
  typescript: siTypescript.path,
  javascript: siJavascript.path,
  python: siPython.path,
  react: siReact.path,
  "react native": siReact.path,
  "next.js": siNextdotjs.path,
  tailwind: siTailwindcss.path,
  "radix ui": siRadixui.path,
  redux: siRedux.path,
  jest: siJest.path,
  pytest: siPytest.path,
  cypress: siCypress.path,
  sonarqube: siSonarqubeserver.path,
  "node.js": siNodedotjs.path,
  django: siDjango.path,
  "django rest": siDjango.path,
  ".net": siDotnet.path,
  graphql: siGraphql.path,
  hono: siHono.path,
  nestjs: siNestjs.path,
  fastapi: siFastapi.path,
  postgres: siPostgresql.path,
  postgresql: siPostgresql.path,
  supabase: siSupabase.path,
  mongodb: siMongodb.path,
  mysql: siMysql.path,
  firebase: siFirebase.path,
  drizzle: siDrizzle.path,
  prisma: siPrisma.path,
  redis: siRedis.path,
  plotly: siPlotly.path,
  langchain: siLangchain.path,
  pandas: siPandas.path,
  "claude code": siClaude.path,
  docker: siDocker.path,
  "docker compose": siDocker.path,
  vercel: siVercel.path,
  resend: siResend.path,
  "react email": siResend.path,
  figma: siFigma.path,
}

// ─── Data ────────────────────────────────────────────────────────────────────

const outline: OutlineItem[] = [
  { id: "whoami", label: "whoami", level: 1 },
  { id: "career", label: "career", level: 2 },
  { id: "cesar", label: "cesar", level: 3 },
  { id: "avanade", label: "avanade", level: 3 },
  { id: "education", label: "education", level: 2 },
  { id: "fiap", label: "fiap", level: 3 },
  { id: "descomplica", label: "descomplica", level: 3 },
  { id: "stack", label: "stack", level: 2 },
  { id: "outside", label: "outside of code", level: 2 },
  { id: "contributions", label: "contributions", level: 2 },
]

const socials = [
  { label: "github", href: siteConfig.socials.github, Icon: GitHubIcon },
  { label: "linkedin", href: siteConfig.socials.linkedin, Icon: LinkedInIcon },
  { label: "x · twitter", href: siteConfig.socials.x, Icon: XIcon },
]

type Entry = {
  id: string
  org: string
  role: string
  from: string
  to: string
  present?: boolean
  body: React.ReactNode
  tags?: string[]
}

const career: Entry[] = [
  {
    id: "cesar",
    org: "cesar",
    role: "full-stack engineer",
    from: "2024",
    to: "present",
    present: true,
    body: (
      <>
        CESAR is one of Brazil&apos;s top innovation centers, and it&apos;s where I spent most of my
        time on <Strong>ESG Carbon</Strong>, a platform ranked top 5 in ESGTech in Brazil that
        serves <Strong>140+</Strong> companies. I architected and shipped it from zero with React,
        Next.js, TypeScript, Python and Django, turning a maze of GHG Protocol rules into a
        self-serve tool that <Strong>cut manual reporting from 3 hours down to 5 minutes.</Strong>{" "}
        These days I&apos;m on a personal-finance fintech app, working end to end across a React
        Native app and a FastAPI backend on the Open Finance consent flow.
      </>
    ),
    tags: ["react", "next.js", "django", "react native", "fastapi"],
  },
  {
    id: "avanade",
    org: "avanade",
    role: "full-stack engineer",
    from: "2021",
    to: "2024",
    body: (
      <>
        Avanade is a Microsoft and Accenture joint venture, and over three years there I went from
        intern to mid level building chatbot and AI products for large enterprise clients. I co-led
        the delivery of a production WhatsApp chatbot that drove{" "}
        <Strong>97k+ re-engagements</Strong> in three months, cut response time by{" "}
        <Strong>44%</Strong>, and lifted NPS by <Strong>5 points</Strong>. I also built secure RAG
        assistants with <Em>LangChain</Em>, <Em>Azure OpenAI</Em> and embeddings.
      </>
    ),
    tags: ["langchain", "azure openai", "rag", ".net"],
  },
]

const education: Entry[] = [
  {
    id: "fiap",
    org: "fiap",
    role: "postgrad in ai engineering",
    from: "2026",
    to: "2027",
    present: true,
    body: (
      <>
        A postgrad certificate in <Em>AI Engineering</Em> that covers pretty much the whole modern
        AI stack, from machine learning fundamentals and computer vision to <Em>LLMs</Em>,
        generative AI, prompt engineering, fine-tuning, RAG and <Em>LangChain</Em>. I should wrap it
        up around <Strong>march 2027</Strong>.
      </>
    ),
  },
  {
    id: "descomplica",
    org: "descomplica",
    role: "bs in information systems",
    from: "2021",
    to: "2025",
    body: (
      <>
        My bachelor&apos;s in <Em>Information Systems</Em>, finished in december 2025. It covered a
        bit of everything, from data structures, databases and cloud computing to software design,
        AI algorithms and data science, which gave me the base to work across the whole product
        lifecycle.
      </>
    ),
  },
]

const stack: { key: string; items: string[] }[] = [
  { key: "languages", items: ["typescript", "javascript", "python", "sql", "c#"] },
  {
    key: "frontend",
    items: [
      "react",
      "react native",
      "next.js",
      "tailwind",
      "zustand",
      "redux",
      "radix ui",
      "playwright",
      "jest",
      "cypress",
    ],
  },
  {
    key: "backend",
    items: ["node.js", "django", "django rest", ".net", "graphql", "hono", "nestjs", "fastapi"],
  },
  {
    key: "databases",
    items: [
      "postgresql",
      "supabase",
      "sql server",
      "mongodb",
      "redis",
      "mysql",
      "firebase",
      "drizzle",
      "prisma",
    ],
  },
  {
    key: "ai / llm",
    items: [
      "langchain",
      "pandas",
      "plotly",
      "azure openai",
      "rag",
      "prompt eng.",
      "embeddings",
      "claude code",
    ],
  },
  { key: "devops · cloud", items: ["docker", "docker compose", "azure", "vercel", "ci/cd"] },
  { key: "testing · quality", items: ["pytest", "sonarqube"] },
  { key: "email · design", items: ["resend", "react email", "figma"] },
]

const interests = [
  {
    Icon: VinylRecordIcon,
    title: "Music",
    desc: (
      <>
        I play guitar, ukulele and piano, honestly not that well, but I have a great time doing it.
        Some of it even ends up as background noise while I code.
      </>
    ),
    foot: "// three instruments",
    glyph: "♪",
  },
  {
    Icon: BarbellIcon,
    title: "Gym",
    desc: (
      <>
        Lifting is my daily reset button, and it&apos;s pretty much non negotiable. I train five
        times a week, mostly compound lifts.
      </>
    ),
    foot: "// mostly compound lifts",
    glyph: "5×",
  },
  {
    Icon: FilmSlateIcon,
    title: "Films & TV",
    desc: (
      <>
        I&apos;m a big fan of <Em>Mike Flanagan</Em> and <Em>Game of Thrones</Em>, and my comfort
        show is <Em>Modern Family</Em> on an endless loop. Always up for recommendations.
      </>
    ),
    foot: "// always taking recs",
    glyph: "★",
  },
]

// ─── Inline text helpers ─────────────────────────────────────────────────────

function Strong({ children }: { children: React.ReactNode }) {
  return <strong style={{ color: "var(--fg-primary)", fontWeight: 500 }}>{children}</strong>
}

function Em({ children }: { children: React.ReactNode }) {
  return (
    <em style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--fg-brand)" }}>
      {children}
    </em>
  )
}

// ─── Building blocks ─────────────────────────────────────────────────────────

function DocLabel({ level, children }: { level: "#" | "##"; children: React.ReactNode }) {
  return (
    <div
      className="mb-3 font-mono text-xs tracking-[0.08em] uppercase"
      style={{ color: "var(--fg-muted)" }}
    >
      <span aria-hidden style={{ color: "var(--fg-brand)" }}>
        {level}
      </span>{" "}
      {children}
    </div>
  )
}

function DisplayH2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-serif)",
        fontWeight: 400,
        fontSize: 40,
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
        color: "var(--fg-primary)",
        margin: 0,
      }}
    >
      {children}
    </h2>
  )
}

function Section({
  id,
  first,
  children,
}: {
  id: string
  first?: boolean
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      style={{
        scrollMarginTop: 24,
        paddingTop: first ? 0 : 64,
        paddingBottom: 64,
        borderTop: first ? "none" : "1px solid var(--border-subtle)",
      }}
    >
      {children}
    </section>
  )
}

/** Tech pill — entrepta soft-brand Badge with a simple-icons glyph when available. */
function TechBadge({ name }: { name: string }) {
  const icon = ICONS[name]
  return (
    <Badge
      variant="soft"
      color="brand"
      className="h-[26px] cursor-default gap-1.5 border border-transparent px-2.5 transition-[border-color,transform,color] duration-150 hover:-translate-y-px hover:border-[var(--fg-brand)] hover:text-[var(--fg-brand)]"
    >
      {icon && (
        <svg
          viewBox="0 0 24 24"
          width={10}
          height={10}
          fill="currentColor"
          aria-hidden
          style={{ opacity: 0.85, flexShrink: 0 }}
        >
          <path d={icon} />
        </svg>
      )}
      {name}
    </Badge>
  )
}

function Timeline({ entries }: { entries: Entry[] }) {
  return (
    <div className="flex flex-col">
      {entries.map((entry, i) => (
        <div
          key={entry.id}
          id={entry.id}
          className="relative pb-6 pl-6 last:pb-0"
          style={{ scrollMarginTop: 24 }}
        >
          {/* Diamond marker */}
          <span
            aria-hidden
            className="absolute top-0.5 left-0"
            style={{ color: "var(--fg-brand)", fontSize: 12, lineHeight: 1 }}
          >
            ◆
          </span>
          {/* Connecting line */}
          {i < entries.length - 1 && (
            <span
              aria-hidden
              className="absolute"
              style={{
                left: 5,
                top: 22,
                bottom: 0,
                width: 1,
                background: "var(--border-subtle)",
              }}
            />
          )}

          <div className="mb-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 22,
                lineHeight: 1.2,
                color: "var(--fg-primary)",
              }}
            >
              {entry.org}
            </span>
            <span className="font-mono text-[13px]" style={{ color: "var(--fg-secondary)" }}>
              <span aria-hidden style={{ opacity: 0.5, marginRight: 6 }}>
                ·
              </span>
              {entry.role}
            </span>
          </div>

          <div
            className="mb-3 font-mono text-[11px] tracking-[0.04em]"
            style={{ color: "var(--fg-muted)" }}
          >
            <span style={{ color: entry.present ? "var(--status-success-fg)" : undefined }}>
              {entry.from}
            </span>
            <span style={{ opacity: 0.5, margin: "0 4px" }}>&rarr;</span>
            <span style={{ color: entry.present ? "var(--status-success-fg)" : undefined }}>
              {entry.to}
            </span>
          </div>

          <p
            className="text-sm leading-relaxed"
            style={{ fontFamily: "var(--font-sans)", color: "var(--fg-secondary)", margin: 0 }}
          >
            {entry.body}
          </p>

          {entry.tags && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {entry.tags.map((tag) => (
                <TechBadge key={tag} name={tag} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const years = calcYearsOfExp()
  const yearsLower = yearsWord(years).toLowerCase()

  return (
    <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 min-[1100px]:grid-cols-[200px_minmax(0,1fr)]">
      <AboutOutline items={outline} />

      <div className="min-w-0">
        <div className="mx-auto max-w-[880px] px-5 py-12 sm:px-8 lg:px-12">
          {/* ══════════ WHOAMI ══════════ */}
          <Section id="whoami" first>
            <DocLabel level="#">whoami</DocLabel>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-[200px_minmax(0,1fr)] lg:gap-12">
              {/* Photo + meta */}
              <div className="flex flex-col gap-3">
                <div
                  className="relative overflow-hidden"
                  style={{
                    width: 200,
                    maxWidth: "100%",
                    aspectRatio: "10 / 11",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border-strong)",
                    background: "var(--bg-surface)",
                  }}
                >
                  <Image
                    src="/images/avatar.png"
                    alt="Anna Maria"
                    fill
                    sizes="200px"
                    className="object-cover"
                    priority
                  />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" color="neutral" className="h-6 gap-1 px-2.5 text-[11px]">
                    <MapPinIcon size={11} weight="fill" style={{ color: "var(--fg-brand)" }} />
                    pernambuco · br
                  </Badge>
                  <Badge variant="soft" color="brand" className="h-6 gap-1 px-2.5 text-[11px]">
                    <StarIcon size={11} weight="fill" />
                    building in public
                  </Badge>
                </div>

                <div className="mt-1 flex flex-col gap-1.5">
                  {socials.map(({ label, href, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-6 items-center gap-2 py-0.5 font-mono text-xs text-[var(--fg-secondary)] transition-colors hover:text-[var(--fg-brand)]"
                    >
                      <Icon size={14} style={{ opacity: 0.7 }} />
                      <span>{label}</span>
                      <span className="sr-only"> (opens in a new tab)</span>
                      <span aria-hidden className="ml-auto" style={{ opacity: 0.55 }}>
                        ↗
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div>
                <h1
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontWeight: 400,
                    fontSize: "clamp(44px, 6vw, 72px)",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    color: "var(--fg-primary)",
                    margin: "0 0 12px",
                  }}
                >
                  Anna <Em>Maria</Em>.
                </h1>
                <p
                  className="mb-6 font-mono text-xs tracking-[0.08em] uppercase"
                  style={{ color: "var(--fg-muted)" }}
                >
                  <span aria-hidden style={{ color: "var(--fg-brand)" }}>
                    {"// "}
                  </span>
                  full-stack engineer · {yearsLower} years · ai &amp; saas
                </p>

                <div
                  className="flex flex-col gap-4 text-base leading-[1.7]"
                  style={{ fontFamily: "var(--font-sans)", color: "var(--fg-secondary)" }}
                >
                  <p style={{ margin: 0 }}>
                    I build and ship <Strong>web products</Strong>, end to end, from the data model
                    to the pixel, and I&apos;ve been at it for about <Em>{yearsLower}</Em> years
                    across startups and bigger enterprise teams.
                  </p>
                  <p style={{ margin: 0 }}>
                    Right now I&apos;m at <Em>cesar</Em>, where I built <Em>ESG Carbon</Em>, a
                    platform used by <Strong>140+</Strong> companies, and these days I&apos;m on a
                    personal-finance fintech app across React Native and a FastAPI backend. Before
                    that I spent three years at <Em>Avanade</Em>, the Microsoft and Accenture joint
                    venture, shipping chatbots and RAG-based AI products for big enterprise clients.
                  </p>
                  <p style={{ margin: 0 }}>
                    On the study side, I have a BS in Information Systems from <Em>Descomplica</Em>,
                    and I&apos;m currently doing a postgrad in <Em>AI Engineering</Em> at{" "}
                    <Em>FIAP</Em>, digging into LLMs, generative AI, RAG, LangChain and the whole
                    modern AI stack.
                  </p>
                  <p style={{ margin: 0 }}>
                    When I&apos;m not working I like to contribute to open source, play a bit of
                    guitar, ukulele and piano (badly, but happily), and I spend a good chunk of my
                    free time at the gym.
                  </p>
                </div>
              </div>
            </div>
          </Section>

          {/* ══════════ CAREER & EDUCATION ══════════ */}
          <Section id="career">
            <DocLabel level="##">career &amp; education</DocLabel>
            <DisplayH2>
              <Em>{yearsWord(years)}</Em> years of work.
              <br />
              One academic track.
            </DisplayH2>

            <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
              <div>
                <DocLabel level="##">career</DocLabel>
                <div className="mt-6">
                  <Timeline entries={career} />
                </div>
              </div>

              <div id="education" style={{ scrollMarginTop: 24 }}>
                <DocLabel level="##">education</DocLabel>
                <div className="mt-6">
                  <Timeline entries={education} />
                </div>
              </div>
            </div>
          </Section>

          {/* ══════════ STACK ══════════ */}
          <Section id="stack">
            <DocLabel level="##">stack</DocLabel>
            <DisplayH2>
              <Em>What</Em> I reach for.
            </DisplayH2>

            <div className="mt-8 flex flex-col">
              {stack.map((row, i) => (
                <div
                  key={row.key}
                  className="grid grid-cols-1 gap-2 py-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4"
                  style={{
                    borderTop: i === 0 ? "none" : "1px dashed var(--border-subtle)",
                    paddingTop: i === 0 ? 0 : 12,
                  }}
                >
                  <span
                    className="pt-1.5 font-mono text-[11px] tracking-[0.08em] uppercase"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    <span aria-hidden style={{ opacity: 0.7 }}>
                      {"// "}
                    </span>
                    {row.key}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {row.items.map((item) => (
                      <TechBadge key={item} name={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ══════════ OUTSIDE OF CODE ══════════ */}
          <Section id="outside">
            <DocLabel level="##">outside of code</DocLabel>
            <DisplayH2>
              <Em>Three</Em> things I do
              <br />
              when I&apos;m not shipping.
            </DisplayH2>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {interests.map(({ Icon, title, desc, foot, glyph }) => (
                <div key={title} className="bento-card">
                  <span
                    className="grid place-items-center"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-surface-brand)",
                      color: "var(--fg-brand)",
                    }}
                  >
                    <Icon size={18} />
                  </span>
                  <h3
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontStyle: "italic",
                      fontSize: 22,
                      lineHeight: 1.2,
                      color: "var(--fg-brand)",
                      margin: 0,
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    className="text-[13px] leading-relaxed"
                    style={{
                      fontFamily: "var(--font-sans)",
                      color: "var(--fg-secondary)",
                      margin: 0,
                    }}
                  >
                    {desc}
                  </p>
                  <div
                    className="mt-auto flex items-center justify-between pt-3 font-mono text-[11px]"
                    style={{
                      borderTop: "1px dashed var(--border-subtle)",
                      color: "var(--fg-muted)",
                    }}
                  >
                    <span>{foot}</span>
                    <span aria-hidden style={{ color: "var(--fg-brand)" }}>
                      {glyph}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ══════════ CONTRIBUTIONS ══════════ */}
          <Section id="contributions">
            <DocLabel level="##">contributions</DocLabel>
            <DisplayH2>
              Open source.
              <br />
              <Em>A year</Em> in commits.
            </DisplayH2>
            <p
              className="mt-4 max-w-[60ch] text-sm leading-relaxed"
              style={{ fontFamily: "var(--font-sans)", color: "var(--fg-secondary)" }}
            >
              My <Em>GitHub</Em> activity over the past year. It&apos;s a rough snapshot of the side
              projects, open source PRs and weekend tinkering that don&apos;t really fit anywhere
              else.
            </p>

            <div className="bento-card mt-8">
              <div className="overflow-x-auto">
                <GithubCalendar username="imnotannamaria" />
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
