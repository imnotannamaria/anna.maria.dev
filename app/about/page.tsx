import Image from "next/image"
import { createMetadata } from "@/lib/metadata"
import { GithubCard } from "@/components/home/github-card"
import { getContributions } from "@/lib/github/contributions"
import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/ui/icons"
import { Badge } from "@/app/components/entrepta/badge"
import {
  BarbellIcon,
  FilmSlateIcon,
  MapPinIcon,
  StarIcon,
  VinylRecordIcon,
} from "@phosphor-icons/react/dist/ssr"
import { PageOutline, type OutlineItem } from "@/components/chrome/page-outline"
import { DisplayH2, DocLabel, Em, Section, Strong } from "@/components/chrome/page-parts"
import { calcYearsOfExp, yearsWord } from "@/lib/experience"
import { siteConfig } from "@/lib/site-config"
import { STACK_GROUPS, STACK_TOTAL } from "@/lib/stack"
import { StackGraph } from "@/components/about/stack-graph"
import { TechBadge } from "@/components/about/tech-badge"
import { Timeline, type TimelineEntry } from "@/components/about/timeline"
import { InterestCard } from "@/components/about/interest-card"
import { ArrowLink } from "@/components/ui/arrow-link"
import { Reveal } from "@/components/ui/reveal"
import { TypeIn } from "@/components/ui/type-in"

export const metadata = createMetadata({
  title: "About",
  description: "A bit about who I am, where I've worked, and what I care about.",
  path: "/about",
})

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

/** The data shape. `Timeline` wants rendered badges, not strings — see `withBadges`. */
type Role = Omit<TimelineEntry, "tags"> & { tags?: string[] }

const socials = [
  { label: "github", href: siteConfig.socials.github, Icon: GitHubIcon },
  { label: "linkedin", href: siteConfig.socials.linkedin, Icon: LinkedInIcon },
  { label: "x · twitter", href: siteConfig.socials.x, Icon: XIcon },
]

const career: Role[] = [
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

const education: Role[] = [
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
    foot: "three instruments",
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
    foot: "mostly compound lifts",
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
    foot: "always taking recs",
    glyph: "★",
  },
]

/**
 * Renders the tag strings into `TechBadge` elements here, on the server.
 *
 * `TechBadge` reads `TECH_ICONS`, which is 54 KB of SVG path data. Handing `Timeline` the
 * strings meant that client component importing the badge, and the whole map going with it
 * into the eager chunk for this page to draw seven icons. Elements cross the boundary; the
 * lookup doesn't have to.
 */
function withBadges(roles: Role[]): TimelineEntry[] {
  return roles.map(({ tags, ...role }) => ({
    ...role,
    tags: tags?.length ? tags.map((tag) => <TechBadge key={tag} name={tag} />) : undefined,
  }))
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function AboutPage() {
  const years = calcYearsOfExp()
  const yearsLower = yearsWord(years).toLowerCase()
  const contributions = await getContributions(siteConfig.githubUser)

  return (
    <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 min-[1100px]:grid-cols-[200px_minmax(0,1fr)]">
      <PageOutline
        items={outline}
        file="about.md"
        footer={
          <>
            <div>{"// markdown"}</div>
            <div>{"// utf-8"}</div>
          </>
        }
      />

      <div className="min-w-0">
        <div className="mx-auto max-w-[880px] px-5 py-12 sm:px-8 lg:px-12">
          {/* ══════════ WHOAMI ══════════ */}
          <Section id="whoami" first>
            <DocLabel level="#">whoami</DocLabel>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-[200px_minmax(0,1fr)] lg:gap-12">
              {/* Photo + meta */}
              <div className="flex flex-col gap-3">
                <Reveal>
                  {/* `group` + `overflow-hidden` on the frame, scale on the image inside.
                      The frame never moves, so the pointer can't fall off what it is
                      hovering and start the lift/un-hover flicker loop. */}
                  <div
                    className="group relative overflow-hidden"
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
                      className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.04]"
                      priority
                    />
                  </div>
                </Reveal>

                <Reveal delay={0.08}>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge
                      variant="outline"
                      color="neutral"
                      className="text-mono-sm h-6 gap-1 px-2.5"
                    >
                      <MapPinIcon size={11} weight="fill" style={{ color: "var(--fg-brand)" }} />
                      pernambuco · br
                    </Badge>
                    <Badge variant="soft" color="brand" className="text-mono-sm h-6 gap-1 px-2.5">
                      <StarIcon size={11} weight="fill" />
                      building in public
                    </Badge>
                  </div>
                </Reveal>

                <div className="mt-1 flex flex-col gap-1.5">
                  {socials.map(({ label, href, Icon }, i) => (
                    <Reveal key={label} index={i} delay={0.14}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/social inline-flex min-h-6 w-full items-center gap-2 py-0.5 font-mono text-xs text-[var(--fg-secondary)] transition-colors hover:text-[var(--fg-brand)] focus-visible:text-[var(--fg-brand)]"
                      >
                        <Icon size={14} style={{ opacity: 0.7 }} />
                        <span>{label}</span>
                        <span className="sr-only"> (opens in a new tab)</span>
                        {/* Mirrored on focus-visible, so the affordance isn't hover-only. */}
                        <span
                          aria-hidden
                          className="ml-auto transition-transform duration-200 ease-out group-hover/social:translate-x-0.5 group-hover/social:-translate-y-0.5 group-focus-visible/social:translate-x-0.5 group-focus-visible/social:-translate-y-0.5"
                          style={{ opacity: 0.55 }}
                        >
                          ↗
                        </span>
                      </a>
                    </Reveal>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div>
                {/* The one place on the page that assembles letter by letter. `TypeIn` keeps
                    every character in the DOM and hides the pieces behind a single
                    `aria-label`, so the h1 a crawler and a screen reader get is the whole
                    name — the thing a page can least afford to ship empty. */}
                <TypeIn
                  as="h1"
                  text="Anna Maria."
                  emphasis="Maria"
                  speed={0.045}
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontWeight: 400,
                    fontSize: "clamp(44px, 6vw, 72px)",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    color: "var(--fg-primary)",
                    margin: "0 0 12px",
                    display: "block",
                  }}
                />

                {/* By word, not by character: this one wraps on a phone, and inline-block
                    characters can't break a line where a word ends.
                    The `//` stays outside the TypeIn, as its own aria-hidden span. Folded
                    into `text` it would end up in the aria-label, and a screen reader would
                    open the line with "slash slash". */}
                <p
                  className="mb-6 font-mono text-xs tracking-[0.08em] uppercase"
                  style={{ color: "var(--fg-muted)" }}
                >
                  <span aria-hidden style={{ color: "var(--fg-brand)" }}>
                    {"// "}
                  </span>
                  <TypeIn
                    by="word"
                    text={`full-stack engineer · ${yearsLower} years · ai & saas`}
                    delay={0.5}
                  />
                </p>

                <div
                  className="flex flex-col gap-4 text-base leading-[1.7]"
                  style={{ fontFamily: "var(--font-sans)", color: "var(--fg-secondary)" }}
                >
                  <Reveal delay={0.62}>
                    <p style={{ margin: 0 }}>
                      I build and ship <Strong>web products</Strong>, end to end, from the data
                      model to the pixel, and I&apos;ve been at it for about <Em>{yearsLower}</Em>{" "}
                      years across startups and bigger enterprise teams.
                    </p>
                  </Reveal>
                  <Reveal delay={0.7}>
                    <p style={{ margin: 0 }}>
                      Right now I&apos;m at <Em>cesar</Em>, where I built <Em>ESG Carbon</Em>, a
                      platform used by <Strong>140+</Strong> companies, and these days I&apos;m on a
                      personal-finance fintech app across React Native and a FastAPI backend. Before
                      that I spent three years at <Em>Avanade</Em>, the Microsoft and Accenture
                      joint venture, shipping chatbots and RAG-based AI products for big enterprise
                      clients.
                    </p>
                  </Reveal>
                  <Reveal delay={0.78}>
                    <p style={{ margin: 0 }}>
                      On the study side, I have a BS in Information Systems from{" "}
                      <Em>Descomplica</Em>, and I&apos;m currently doing a postgrad in{" "}
                      <Em>AI Engineering</Em> at <Em>FIAP</Em>, digging into LLMs, generative AI,
                      RAG, LangChain and the whole modern AI stack.
                    </p>
                  </Reveal>
                  <Reveal delay={0.86}>
                    <p style={{ margin: 0 }}>
                      When I&apos;m not working I like to contribute to open source, play a bit of
                      guitar, ukulele and piano (badly, but happily), and I spend a good chunk of my
                      free time at the gym.
                    </p>
                  </Reveal>
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
                  <Timeline entries={withBadges(career)} />
                </div>
              </div>

              <div id="education" style={{ scrollMarginTop: 24 }}>
                <DocLabel level="##">education</DocLabel>
                <div className="mt-6">
                  <Timeline entries={withBadges(education)} />
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

            {/* Two renderings of one list. The graph is client-only and needs room to
                breathe, so it takes the pixels from `md` up.

                The rows below are `md:sr-only`, not `md:hidden`. That distinction is the
                whole point: `display: none` would take them out of the accessibility tree
                and out of what a crawler sees at desktop width, leaving a stack that only
                exists inside a canvas that isn't in the server HTML. `sr-only` keeps them
                rendered, so the list is always the authoritative copy and the graph is the
                view. Below `md` the rows simply become visible again. */}
            <Reveal delay={0.12} className="mt-8 hidden md:block">
              <StackGraph />
            </Reveal>

            <div className="mt-8 flex flex-col md:sr-only">
              {STACK_GROUPS.map((row, i) => (
                <Reveal
                  key={row.key}
                  index={i}
                  className="grid grid-cols-1 gap-2 py-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4"
                  style={{
                    borderTop: i === 0 ? "none" : "1px dashed var(--border-subtle)",
                    paddingTop: i === 0 ? 0 : 12,
                  }}
                >
                  <span
                    className="text-mono-sm pt-1.5 font-mono tracking-[0.08em] uppercase"
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
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.18}>
              <p className="text-mono-sm mt-6 font-mono" style={{ color: "var(--fg-muted)" }}>
                <span aria-hidden style={{ opacity: 0.7 }}>
                  {"// "}
                </span>
                {STACK_TOTAL} entries across {STACK_GROUPS.length} categories
              </p>
            </Reveal>
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
              {interests.map(({ Icon, title, desc, foot, glyph }, i) => (
                <InterestCard
                  key={title}
                  label={title.toLowerCase()}
                  icon={<Icon size={18} />}
                  foot={foot}
                  glyph={glyph}
                  index={i}
                >
                  {desc}
                </InterestCard>
              ))}
            </div>

            {/* Under the cards rather than inside one of them: three cards all pointing at
                /log would be three links with different names and the same destination. */}
            <Reveal delay={0.24}>
              <p
                className="text-mono-sm mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono"
                style={{ color: "var(--fg-muted)" }}
              >
                <span aria-hidden style={{ opacity: 0.7 }}>
                  {"//"}
                </span>
                <span>everything I actually finish, from films to books, lands in</span>
                <ArrowLink href="/log" aria-label="See the log of everything I finish">
                  the log
                </ArrowLink>
              </p>
            </Reveal>
          </Section>

          {/* ══════════ CONTRIBUTIONS ══════════ */}
          <Section id="contributions">
            <DocLabel level="##">contributions</DocLabel>
            <DisplayH2>
              Open source.
              <br />
              <Em>A year</Em> in commits.
            </DisplayH2>
            <Reveal delay={0.12}>
              <p
                className="mt-4 max-w-[60ch] text-sm leading-relaxed"
                style={{ fontFamily: "var(--font-sans)", color: "var(--fg-secondary)" }}
              >
                My <Em>GitHub</Em> activity over the past year. It&apos;s a rough snapshot of the
                side projects, open source PRs and weekend tinkering that don&apos;t really fit
                anywhere else.
              </p>
            </Reveal>

            {/* The same card the home page uses, rather than a second bare frame
                around the same calendar — head, footer, spotlight and entrance
                all come with it. */}
            <div className="mt-8">
              <GithubCard username={siteConfig.githubUser} data={contributions} />
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
