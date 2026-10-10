import {
  ArrowRightIcon,
  BriefcaseIcon,
  CursorClickIcon,
  EnvelopeSimpleIcon,
  FolderIcon,
  HeartIcon,
  HouseLineIcon,
  NotePencilIcon,
  SwapIcon,
  UserIcon,
} from "@phosphor-icons/react/dist/ssr"
import Image from "next/image"
import type { CSSProperties, ReactNode } from "react"
import { Reveal } from "@/app/components/entrepta/reveal"
import { calcYearsOfExp, yearsWord } from "@/lib/experience"
import { siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"
import { getPublishedPosts, getPublishedProjects } from "@/lib/velite"
import { Cat } from "../../abimaela/abimaela"
import { findBrand } from "../brand-data"
import { PAGES, type PageId } from "../pages"
import selfie from "../person/photos/01-selfie.jpg"
import cat from "../person/photos/02-abimaela.jpg"
import palmTrees from "../person/photos/03-palm-trees.jpg"
import { CAREER, axis } from "../professional/career"
import { Folder } from "@/components/site/folder"
import { Hint } from "@/components/site/hint"
import { Lede, PageHeader } from "@/components/site/page-header"
import { POLAROID } from "@/components/site/polaroid"
import { Pushpin, Tape } from "@/components/site/tape"
import { LETTERS, featuredLetter } from "../wall/letters"
import { Door } from "./door"
import "./home.css"

const ICON: Record<PageId, ReactNode> = {
  home: <HouseLineIcon aria-hidden size={13} weight="bold" />,
  person: <UserIcon aria-hidden size={13} weight="bold" />,
  professional: <BriefcaseIcon aria-hidden size={13} weight="bold" />,
  notes: <NotePencilIcon aria-hidden size={13} weight="bold" />,
  projects: <FolderIcon aria-hidden size={13} weight="bold" />,
  "wall-of-love": <HeartIcon aria-hidden size={13} weight="bold" />,
  contact: <EnvelopeSimpleIcon aria-hidden size={13} weight="bold" />,
}

export function Home() {
  const now = new Date()
  const years = calcYearsOfExp(now)
  const ruler = axis(CAREER, [now.getFullYear(), now.getMonth() + 1, now.getDate()])
  const posts = getPublishedPosts()
  const note = posts.find((post) => post.featured) ?? posts[0]
  const projects = getPublishedProjects()
  const project = projects.find((item) => item.featured) ?? projects[0]

  const techs = (project?.tags ?? [])
    .flatMap((tag) => {
      const brand = findBrand(tag)
      return brand ? [{ name: tag, ...brand }] : []
    })
    .slice(0, 3)
  const letter = featuredLetter(LETTERS)
  const initials = (letter?.name ?? "")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")

  const thumb: Record<Exclude<PageId, "home">, ReactNode> = {
    person: (
      <span className="st-hm-photos">
        {[palmTrees, cat, selfie].map((photo, index) => (
          <span key={photo.src} className={POLAROID} style={{ "--i": index } as CSSProperties}>
            <Image src={photo} alt="" width={84} height={84} sizes="100px" />
          </span>
        ))}
      </span>
    ),

    professional: (
      <span className="st-hm-chart">
        <span className="st-hm-axis text-mono-xs font-mono">
          <span>{ruler.years[0]}</span>
          <span>{ruler.years[ruler.years.length - 1]}</span>
        </span>
        <span className="st-hm-bars">
          {CAREER.map((entry) => {
            const { left, width } = ruler.range(entry)
            return (
              <i
                key={entry.id}
                data-type={entry.type}
                data-current={(entry.current && entry.type === "work") || undefined}
                style={{ marginLeft: `${left}%`, width: `${width}%` }}
              >
                <span className="text-mono-xs font-mono">{entry.org}</span>
              </i>
            )
          })}
          <b style={{ left: `${(ruler.now / ruler.months) * 100}%` }} />
        </span>
      </span>
    ),
    notes: (
      <span className="st-hm-slip">
        <Tape />
        <span className="text-heading-md line-clamp-3 font-serif text-[var(--fg-primary)]">
          <span className="st-hm-stroke">{note?.title ?? "notes"}</span>
        </span>
      </span>
    ),
    projects: (
      <span className="st-hm-folder">
        <Folder
          title={project?.title ?? "projects"}
          cover={project?.cover ?? null}
          techs={techs}
          featured
          badge={false}
          sizes="160px"
        />
      </span>
    ),

    "wall-of-love": (
      <span className="st-hm-letters">
        <span className="st-hm-letter" data-behind />
        <span className="st-hm-letter">
          <Pushpin />
          <span className="flex min-w-0 items-center gap-2">
            <i className="text-mono-xs font-mono">{initials}</i>
            <span className="min-w-0">
              <span className="text-mono-xs block truncate font-mono text-[var(--fg-primary)]">
                {letter?.name}
              </span>
              <span className="text-mono-xs block truncate font-mono text-[var(--fg-muted)]">
                {letter?.company}
              </span>
            </span>
          </span>
          <span className="st-hm-excerpt text-mono-xs font-sans">{letter?.text}</span>
        </span>
      </span>
    ),

    contact: (
      <span className="st-hm-postal">
        <span className="st-hm-lines" />
        <span className="st-hm-stamp">
          <Cat height={34} />
        </span>
        <svg viewBox="0 0 76 76" className="st-hm-postmark">
          <circle cx="38" cy="38" r="34" />
          <circle cx="38" cy="38" r="24" />
          <text x="38" y="42" textAnchor="middle">
            PE · BR
          </text>
        </svg>
      </span>
    ),
  }

  return (
    <article className="st-room st-screen">
      <header className="flex flex-col gap-4">
        <PageHeader icon={ICON.home} label="home" />
        <h2 className="st-hm-name font-serif text-[var(--fg-primary)]">{siteConfig.name}</h2>

        <Lede>
          I build things <span className="text-[var(--fg-primary)]">end to end</span>, from the UI
          and the front, web or mobile, all the way to shipping, and I&rsquo;ve been at it for about{" "}
          <span className="text-[var(--fg-primary)]">{yearsWord(years).toLowerCase()} years</span>.
        </Lede>

        <ul className="st-hm-hints">
          <Hint as="li" icon={<CursorClickIcon aria-hidden size={13} />}>
            <span>each card is a page, click one to know more</span>
          </Hint>
          <Hint as="li" icon={<SwapIcon aria-hidden size={13} />}>
            <span>
              switch sides at the bottom: <strong className="font-medium">Front</strong> is the
              pages, <strong className="font-medium">Back</strong> is a terminal,{" "}
              <strong className="font-medium">IA</strong> is a chat
            </span>
          </Hint>
        </ul>
      </header>
      <ul className="st-hm-doors">
        {PAGES.filter((page) => page.id !== "home").map((page, index) => (
          <li key={page.id} data-door={page.id}>
            <Reveal index={index} className="h-full">
              <Door
                to={page.id}
                label={page.label}
                className={cn("st-hm-door focus-ring", page.id === "projects" && "st-folder-host")}
              >
                <span className="st-hm-label text-mono-sm font-mono">
                  <span className="text-[var(--fg-brand)]">{ICON[page.id]}</span>
                  {page.label}
                </span>
                <span className="st-hm-mini" aria-hidden>
                  {thumb[page.id as Exclude<PageId, "home">]}
                </span>
                <span className="st-hm-tagline text-body-md font-sans">{page.tagline}</span>
                <span className="st-hm-arrow" aria-hidden>
                  <ArrowRightIcon size={14} weight="bold" />
                </span>
              </Door>
            </Reveal>
          </li>
        ))}
      </ul>
    </article>
  )
}
