import type { SiteData } from "@/components/site/frame/site-data"
import { AiSide, BackSide } from "@/components/site/frame/sides"
import { SiteFrame } from "@/components/site/frame/site-frame"
import { APP_LIST } from "@/components/site/professional/app-list"
import { CAREER } from "@/components/site/professional/career"
import { STACK } from "@/components/site/professional/stack-data"
import { calcYearsOfExp } from "@/lib/experience"
import { siteConfig } from "@/lib/site-config"
import { STACK_GROUPS } from "@/lib/stack"
import { getPublishedPosts, getPublishedProjects } from "@/lib/velite"

/**
 * The frame around every page of the site. It also holds the two sides that are not pages of
 * the Front, the terminal (/back) and the chat (/ai). They load on the first visit to their
 * address and then stay mounted, so a session survives a trip to another side.
 *
 * Nothing here reads the database, on purpose: this layout wraps every route, and a query in it
 * would make the MDX pages dynamic too. The one thing those two sides need from Postgres, the
 * log, they fetch themselves when first opened (see use-site-data.ts).
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const data: SiteData = {
    years: calcYearsOfExp(),
    email: siteConfig.email,
    socials: siteConfig.socials,
    // the same career "Anna, the professional" draws
    jobs: CAREER.map(({ org, role, from, until, current, type }) => ({
      org,
      role,
      from: from[0],
      until: until?.[0] ?? new Date().getFullYear(),
      current,
      type,
    })),
    apps: APP_LIST.map(({ name, what }) => ({ name, what })),
    stack: STACK_GROUPS,
    posts: getPublishedPosts().map(({ slug, title, description, date, tags, featured }) => ({
      slug,
      title,
      description,
      date,
      tags,
      featured,
    })),
    projects: getPublishedProjects().map((project) => ({
      slug: project.slug,
      title: project.title,
      description: project.description,
      date: project.date,
      tags: project.tags,
      type: project.kind,
      cover: project.cover ?? null,
      featured: project.featured,
      github: project.github ?? null,
      live: project.live ?? null,
    })),
  }

  return (
    <SiteFrame back={<BackSide data={data} />} ia={<AiSide data={data} stack={STACK} />}>
      {children}
    </SiteFrame>
  )
}
