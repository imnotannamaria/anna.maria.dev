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
import { useLocale, useTranslations } from "next-intl"
import Image from "next/image"
import type { CSSProperties, ReactNode } from "react"
import { Reveal } from "@/app/components/entrepta/reveal"
import { CAREER_START_YEAR } from "@/lib/experience"
import { siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"
import { getPublishedPosts, getPublishedProjects } from "@/lib/velite"
import { Cat } from "@/components/site/abimaela/abimaela"
import { findBrand } from "@/components/site/brand-data"
import { PAGES, type PageId } from "@/components/site/pages"
import selfie from "@/components/site/person/photos/01-selfie.jpg"
import cat from "@/components/site/person/photos/02-abimaela.jpg"
import palmTrees from "@/components/site/person/photos/03-palm-trees.jpg"
import { CAREER, axis } from "@/components/site/professional/career"
import { Folder } from "@/components/site/folder"
import { Hint } from "@/components/site/hint"
import { Lede, PageHeader } from "@/components/site/page-header"
import { POLAROID } from "@/components/site/polaroid"
import { Tape } from "@/components/site/tape"
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
  const t = useTranslations("home")
  const pages = useTranslations("pages")
  const wall = useTranslations("wall")
  const strong = (words: ReactNode) => (
    <span className="st-lede-keep text-[var(--fg-primary)]">{words}</span>
  )
  const now = new Date()
  const ruler = axis(CAREER, [now.getFullYear(), now.getMonth() + 1, now.getDate()])
  const locale = useLocale()
  const posts = getPublishedPosts(locale)
  const note = posts.find((post) => post.featured) ?? posts[0]
  const projects = getPublishedProjects(locale)
  const project = projects.find((item) => item.featured) ?? projects[0]

  const techs = (project?.tags ?? [])
    .flatMap((tag) => {
      const brand = findBrand(tag)
      return brand ? [{ name: tag, ...brand }] : []
    })
    .slice(0, 3)

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
          <span className="st-hm-stroke">{note?.title ?? t("notesFallback")}</span>
        </span>
      </span>
    ),
    projects: (
      <span className="st-hm-folder">
        <Folder
          title={project?.title ?? t("projectsFallback")}
          cover={project?.cover ?? null}
          techs={techs}
          featured
          badge={false}
          sizes="160px"
        />
      </span>
    ),

    // The home is static and reads no database, so this is the gesture of a message in the
    // channel, not one of the real ones: those are on the page.
    "wall-of-love": (
      <span className="st-hm-channel">
        <span className="st-hm-channel-head text-mono-xs font-mono"># {wall("channel")}</span>
        <span className="st-hm-msg">
          <i>
            <HeartIcon size={12} weight="fill" />
          </i>
          <span className="st-hm-excerpt text-mono-xs font-sans">{t("wallExcerpt")}</span>
        </span>
        <span className="st-hm-reacts">
          {["\u{1FAF6}", "\u{1F44F}", "\u{1F389}"].map((emoji) => (
            <b key={emoji}>{emoji}</b>
          ))}
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
        <PageHeader icon={ICON.home} label={t("label")} />
        <h2 className="st-hm-name font-serif text-[var(--fg-primary)]">{siteConfig.name}</h2>

        {/* the years are left as the sum, on purpose: the joke is that you do the maths */}
        <Lede className="st-lede-wide">
          {t.rich("lede", {
            b: strong,
            // the chain of arrows stays on one line: broken in the middle it stops reading as a path
            flow: (words) => <span className="st-lede-flow">{words}</span>,
            now: String(now.getFullYear()),
            since: String(CAREER_START_YEAR),
          })}
        </Lede>

        <ul className="st-hm-hints">
          <Hint as="li" icon={<CursorClickIcon aria-hidden size={13} />}>
            <span>{t("hintCards")}</span>
          </Hint>
          <Hint as="li" icon={<SwapIcon aria-hidden size={13} />}>
            <span>
              {t.rich("hintSides", {
                b: (words) => <strong className="font-medium">{words}</strong>,
              })}
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
                className={cn("st-hm-door focus-ring", page.id === "projects" && "st-folder-host")}
              >
                <span className="st-hm-label text-mono-sm font-mono">
                  <span className="text-[var(--fg-brand)]">{ICON[page.id]}</span>
                  {pages(`${page.id}.label`)}
                </span>
                <span className="st-hm-mini" aria-hidden>
                  {thumb[page.id as Exclude<PageId, "home">]}
                </span>
                <span className="st-hm-tagline text-body-md font-sans">
                  {pages(`${page.id}.tagline`)}
                </span>
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
