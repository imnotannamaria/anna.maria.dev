import Image from "next/image"
import { createMetadata } from "@/lib/metadata"
import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/ui/icons"
import {
  BarbellIcon,
  FilmSlateIcon,
  MapPinSimpleIcon,
  VinylRecordIcon,
} from "@phosphor-icons/react/dist/ssr"
import {
  siTypescript,
  siJavascript,
  siPython,
  siReact,
  siNextdotjs,
  siTailwindcss,
  siRedux,
  siJest,
  siNodedotjs,
  siDjango,
  siDotnet,
  siGraphql,
  siHono,
  siDrizzle,
  siNestjs,
  siPostgresql,
  siMongodb,
  siMysql,
  siFirebase,
  siPrisma,
  siLangchain,
  siPandas,
  siFastapi,
  siDocker,
  siVercel,
  siResend,
  siFigma,
} from "simple-icons"

export const metadata = createMetadata({
  title: "About",
  description: "A bit about who I am, where I've worked, and what I care about.",
  path: "/about",
})

const timeline = [
  {
    company: "CESAR",
    role: "Full-stack Software Engineer",
    period: "2024 — present",
    description:
      "At CESAR, one of Brazil's top innovation centers, I work as a Full-Stack Software Engineer on ESG Carbon, a platform ranked top-5 in ESGTech in Brazil serving 140+ companies. I architected and shipped the product from zero using React, Next.js, TypeScript, Python, and Django, turning complex GHG Protocol rules into a self-serve tool that reduced manual reporting from 3 hours to 5 minutes.",
  },
  {
    company: "Avanade",
    role: "Full-stack Software Engineer",
    period: "2021 — 2024",
    description:
      "At Avanade, a Microsoft and Accenture joint venture, I grew from intern to mid-level engineer over three years delivering chatbot and AI products for large enterprise clients. I led the technical delivery of a production WhatsApp chatbot that drove 97K+ re-engagements in 3 months, and built secure RAG-based AI assistants using LangChain, Azure OpenAI, and embeddings that gave internal teams controlled access to private knowledge bases.",
  },
]

const education = [
  {
    institution: "FIAP",
    degree: "Postgraduate Certificate in AI Engineering",
    period: "2026 — 2027",
    description:
      "I'm currently completing a Postgraduate Certificate in AI Engineering at FIAP, with coursework spanning the full modern AI stack, from Machine Learning fundamentals and Computer Vision to LLMs, Generative AI, Prompt Engineering, Fine-tuning, RAG, and LangChain. Expected completion: March 2027.",
  },
  {
    institution: "Descomplica",
    degree: "Bachelor's Degree in Information Systems",
    period: "2021 — 2025",
    description:
      "I hold a Bachelor's Degree in Information Systems from Descomplica Faculdade Digital, completed in December 2025. The program covered the full software engineering stack, from Data Structures, Databases, and Cloud Computing to Software Design, AI Algorithms, and Data Science, giving me the foundation to work across the entire product lifecycle.",
  },
]

type TechItem = { name: string; href: string; iconPath?: string }

const stackCategories: { label: string; items: TechItem[] }[] = [
  {
    label: "Languages",
    items: [
      { name: "TypeScript", href: "https://typescriptlang.org", iconPath: siTypescript.path },
      {
        name: "JavaScript",
        href: "https://developer.mozilla.org/docs/Web/JavaScript",
        iconPath: siJavascript.path,
      },
      { name: "Python", href: "https://python.org", iconPath: siPython.path },
      { name: "SQL", href: "https://en.wikipedia.org/wiki/SQL" },
      { name: "C#", href: "https://learn.microsoft.com/dotnet/csharp" },
    ],
  },
  {
    label: "Frontend",
    items: [
      { name: "React", href: "https://react.dev", iconPath: siReact.path },
      { name: "Next.js", href: "https://nextjs.org", iconPath: siNextdotjs.path },
      { name: "Tailwind CSS", href: "https://tailwindcss.com", iconPath: siTailwindcss.path },
      { name: "Zustand", href: "https://zustand-demo.pmnd.rs" },
      { name: "Redux", href: "https://redux.js.org", iconPath: siRedux.path },
      { name: "Playwright", href: "https://playwright.dev" },
      { name: "Jest", href: "https://jestjs.io", iconPath: siJest.path },
    ],
  },
  {
    label: "Backend",
    items: [
      { name: "Node.js", href: "https://nodejs.org", iconPath: siNodedotjs.path },
      { name: "Django", href: "https://djangoproject.com", iconPath: siDjango.path },
      { name: "Django REST", href: "https://django-rest-framework.org", iconPath: siDjango.path },
      { name: ".NET", href: "https://dotnet.microsoft.com", iconPath: siDotnet.path },
      { name: "GraphQL", href: "https://graphql.org", iconPath: siGraphql.path },
      { name: "Hono", href: "https://hono.dev", iconPath: siHono.path },
      { name: "NestJS", href: "https://nestjs.com", iconPath: siNestjs.path },
      { name: "FastAPI", href: "https://fastapi.tiangolo.com", iconPath: siFastapi.path },
    ],
  },
  {
    label: "Databases",
    items: [
      { name: "PostgreSQL", href: "https://postgresql.org", iconPath: siPostgresql.path },
      { name: "MongoDB", href: "https://mongodb.com", iconPath: siMongodb.path },
      { name: "MySQL", href: "https://mysql.com", iconPath: siMysql.path },
      { name: "Firebase", href: "https://firebase.google.com", iconPath: siFirebase.path },
      { name: "Drizzle ORM", href: "https://orm.drizzle.team", iconPath: siDrizzle.path },
      { name: "Prisma", href: "https://prisma.io", iconPath: siPrisma.path },
    ],
  },
  {
    label: "AI / LLM",
    items: [
      { name: "LangChain", href: "https://langchain.com", iconPath: siLangchain.path },
      { name: "Pandas", href: "https://pandas.pydata.org", iconPath: siPandas.path },
      {
        name: "Azure OpenAI",
        href: "https://azure.microsoft.com/products/ai-services/openai-service",
      },
      { name: "RAG", href: "https://en.wikipedia.org/wiki/Retrieval-augmented_generation" },
      { name: "Prompt Eng.", href: "https://en.wikipedia.org/wiki/Prompt_engineering" },
      { name: "Embeddings", href: "https://platform.openai.com/docs/guides/embeddings" },
    ],
  },
  {
    label: "DevOps & Cloud",
    items: [
      { name: "Docker", href: "https://docker.com", iconPath: siDocker.path },
      { name: "Azure", href: "https://azure.microsoft.com" },
      { name: "Vercel", href: "https://vercel.com", iconPath: siVercel.path },
    ],
  },
  {
    label: "Email",
    items: [
      { name: "Resend", href: "https://resend.com", iconPath: siResend.path },
      { name: "React Email", href: "https://react.email", iconPath: siResend.path },
    ],
  },
  {
    label: "Design",
    items: [{ name: "Figma", href: "https://figma.com", iconPath: siFigma.path }],
  },
]

const interests = [
  {
    emoji: <VinylRecordIcon size={32} />,
    label: "Music",
    description: "I play guitar, ukulele and piano at a self-described mediocre level.",
  },
  {
    emoji: <BarbellIcon size={32} />,
    label: "Gym",
    description: "Strength training is my daily reset. Non-negotiable.",
  },
  {
    emoji: <FilmSlateIcon size={32} />,
    label: "Films and Tv Shows",
    description: "Big fan of Mike Flanagan and horror films.",
  },
]

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-275 px-5 py-16">
      <section className="flex flex-col gap-10 lg:flex-row lg:gap-16">
        <div className="flex shrink-0 flex-col items-start gap-4 lg:w-56">
          <div className="border-border relative size-40 overflow-hidden rounded-2xl border lg:size-48">
            <Image
              src="https://github.com/imnotannamaria.png"
              alt="Anna Maria"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="border-border bg-bg-surface text-text-secondary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs">
              <MapPinSimpleIcon /> Pernambuco, BR
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/40 bg-indigo-950/60 px-3 py-1 text-xs text-indigo-300">
              ✦ Building in public
            </span>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <a
              href="https://github.com/imnotannamaria"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary flex items-center gap-2 text-sm transition-colors"
            >
              <GitHubIcon size={14} />
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/imnotannamaria"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary flex items-center gap-2 text-sm transition-colors"
            >
              <LinkedInIcon size={14} />
              LinkedIn
            </a>
            <a
              href="https://x.com/annamariadevbr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary flex items-center gap-2 text-sm transition-colors"
            >
              <XIcon size={14} />X (Twitter)
            </a>
          </div>
        </div>

        <div className="text-text-secondary flex-1 space-y-4 text-sm leading-relaxed">
          <h1 className="font-display text-text-primary text-3xl font-bold">Anna Maria</h1>
          <p>
            I&apos;m a Full-Stack Software Engineer based in Pernambuco, Brazil, with 5 years of
            experience building SaaS and AI products across startup and enterprise environments. I
            currently work at CESAR on ESG Carbon, a platform serving 140+ companies that I helped
            architect from zero using React, Next.js, TypeScript, Python, and Django. Before that, I
            spent three years at Avanade, a Microsoft and Accenture joint venture, where I grew from
            intern to mid-level engineer delivering chatbot and RAG-based AI products for large
            enterprise clients.
          </p>
          <p>
            On the academic side, I hold a Bachelor&apos;s Degree in Information Systems from
            Descomplica Faculdade Digital and I&apos;m currently completing a Postgraduate
            Certificate in AI Engineering at FIAP, with coursework covering LLMs, Generative AI,
            RAG, LangChain, and the full modern AI stack.
          </p>
          <p>
            Outside of work, I contribute to open source, play guitar, ukulele and piano at a
            self-described mediocre level, and spend part of my free time at the gym.
          </p>
        </div>
      </section>

      <Divider />

      <section className="grid gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading>Career</SectionHeading>
          <ol className="mt-8 space-y-0">
            {timeline.map((item, i) => (
              <li key={item.company} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="bg-bg-base mt-1 size-3 shrink-0 rounded-full border-2 border-indigo-500" />
                  {i < timeline.length - 1 && (
                    <span className="mt-2 w-px flex-1 bg-indigo-900/70" />
                  )}
                </div>
                <div className="pb-8">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <span className="text-text-primary text-sm font-semibold">{item.company}</span>
                    <span className="text-text-secondary text-sm">{item.role}</span>
                  </div>
                  <time className="text-text-muted font-mono text-xs">{item.period}</time>
                  <p className="text-text-secondary mt-2 text-sm">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <SectionHeading>Education</SectionHeading>
          <ol className="mt-8 space-y-0">
            {education.map((item, i) => (
              <li key={item.institution} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="bg-bg-base mt-1 size-3 shrink-0 rounded-full border-2 border-indigo-400" />
                  {i < education.length - 1 && (
                    <span className="mt-2 w-px flex-1 bg-indigo-900/70" />
                  )}
                </div>
                <div className="pb-8">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <span className="text-text-primary text-sm font-semibold">
                      {item.institution}
                    </span>
                    <span className="text-text-secondary text-sm">{item.degree}</span>
                  </div>
                  <time className="text-text-muted font-mono text-xs">{item.period}</time>
                  <p className="text-text-secondary mt-2 text-sm">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Divider />

      <section>
        <SectionHeading>Stack</SectionHeading>
        <div className="mt-6 space-y-4">
          {stackCategories.map((cat) => (
            <div key={cat.label} className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <span className="text-text-muted w-28 shrink-0 pt-0.5 font-mono text-xs">
                {cat.label}
              </span>
              <div className="flex flex-wrap gap-2">
                {cat.items.map((tech) => (
                  <TechLink key={tech.name} {...tech} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      <section>
        <SectionHeading>Outside of code</SectionHeading>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {interests.map((item) => (
            <div key={item.label} className="border-border bg-bg-surface rounded-xl border p-5">
              <span className="text-2xl text-indigo-500">{item.emoji}</span>
              <p className="text-text-primary mt-3 text-sm font-medium">{item.label}</p>
              <p className="text-text-secondary mt-1 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function TechLink({ name, href, iconPath }: TechItem) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="border-border bg-bg-surface text-text-secondary hover:text-text-primary inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-[11px] transition-colors hover:border-indigo-500/50"
    >
      {iconPath && (
        <svg viewBox="0 0 24 24" width={11} height={11} fill="currentColor" aria-hidden="true">
          <path d={iconPath} />
        </svg>
      )}
      {name}
    </a>
  )
}

function Divider() {
  return <hr className="border-border my-14" />
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-text-primary text-xl font-semibold">{children}</h2>
}
