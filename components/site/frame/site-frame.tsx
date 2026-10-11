"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { MobileNav } from "@/app/components/entrepta/mobile-nav"
import { Sidebar, type SidebarGroup } from "@/app/components/entrepta/sidebar"
import { Abimaela, pet } from "@/components/site/abimaela/abimaela"
import { ClickBurst } from "@/components/site/click-burst"
import { Footer } from "@/components/site/footer/footer"
import { ICON } from "@/components/site/icons"
import { useNavigate } from "@/components/site/navigation"
import { PAGES, hrefOf, listedPageOf, screenOf } from "@/components/site/pages"
import { Island, PARTS, type Part } from "./island"
import "./site-frame.css"
import "@/components/site/enter.css"

/**
 * The frame of the site, as the layout of its routes: the sidebar, the header (an island with
 * the Front / Back / IA switcher and the actions), the cat, and the page in between.
 *
 * The side comes from the address: `/back` is the terminal, `/ai` is the chat, anything else is
 * a page of the Front. The terminal and the chat are handed in once and stay mounted, hidden
 * while another side shows, so a session and a conversation survive a trip to the other side.
 */
export type { Part }

const PART_HREF: Record<Exclude<Part, "front">, string> = { back: "/back", ia: "/ai" }

const NAV: SidebarGroup[] = [PAGES.slice(0, 1), PAGES.slice(1)].map((group) => ({
  items: group.map((page) => ({
    id: page.id,
    label: page.label,
    href: hrefOf(page.id),
    icon: ICON[page.id],
  })),
}))

/** The same pages for the phone's bottom bar: the first four in reach, the rest under More. */
const BAR = PAGES.map((page) => ({
  id: page.id,
  label: page.short,
  href: hrefOf(page.id),
  icon: ICON[page.id],
}))

const partOf = (pathname: string): Part =>
  pathname === "/back" ? "back" : pathname === "/ai" ? "ia" : "front"

function BrandMark({ compact }: { compact: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <Image
        src="/brand/mark.png"
        alt=""
        width={28}
        height={28}
        sizes="28px"
        className="shrink-0"
        priority
      />
      {compact ? null : (
        <span className="flex min-w-0 flex-col font-mono leading-tight">
          <span className="text-mono-sm truncate text-[var(--fg-primary)]">Anna Maria</span>
          <span className="text-mono-xs truncate text-[var(--fg-muted)]">software engineer</span>
        </span>
      )}
    </span>
  )
}

export function SiteFrame({
  back,
  ia,
  children,
}: {
  back: ReactNode
  ia: ReactNode
  /** The page of the Front the address points at. */
  children: ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const navigate = useNavigate()
  const part = partOf(pathname)
  const screen = screenOf(pathname)
  // the page of the sidebar this screen belongs to: lit in the nav, and where the footer starts
  const listed = screen ? listedPageOf(screen) : null
  // Two places where the side switcher and the corner cat only get in the way: an invite, which
  // is one person writing one letter (and she is already on the page, walking the steps), and
  // the admin, which is a tool and not part of the visit. The header keeps its actions there.
  const focused =
    pathname.startsWith("/invite/") || pathname === "/admin" || pathname.startsWith("/admin/")

  // where the Front was last, so the switcher goes back to that page and not to the home
  const lastFront = useRef("/")
  useEffect(() => {
    if (part === "front") lastFront.current = pathname
  }, [part, pathname])

  // The new site has one theme. A visitor who picked another on the old site still has it
  // saved, and there is no switcher here to change it back, so it is dropped for these pages.
  useEffect(() => {
    document.documentElement.removeAttribute("data-theme")
  }, [])

  // with the footer on screen the corner cat steps out: she is in the game down there
  const [atFooter, setAtFooter] = useState(false)

  const swap = (to: Part) => {
    if (to === part) return
    router.push(to === "front" ? lastFront.current : PART_HREF[to])
    pet.notify(to)
  }

  // a new page starts at the top, and the cat notices
  const front = useRef<HTMLDivElement>(null)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (part !== "front") return
    front.current?.scrollTo({ top: 0 })
    pet.notify("page")
  }, [pathname, part])

  const panes: Record<Part, ReactNode> = {
    front: (
      // `data-page` is how the CSS gives the page its width, which the footer shares
      <div key={pathname} className="st-enter" data-page={screen ?? undefined}>
        {children}
        {/* Every page of the Front ends in the footer. On an inner page the cat starts at the
            page it is reached from. The admin has none: it is not a page for a visitor. */}
        {listed ? <Footer page={listed} onGo={navigate} onVisible={setAtFooter} /> : null}
      </div>
    ),
    back,
    ia,
  }

  return (
    <div className="st">
      <ClickBurst />
      <Sidebar
        variant="labeled"
        collapsible
        storageKey="site:sidebar"
        onCollapsedChange={(closed) => {
          if (closed) pet.notify("sidebar")
        }}
        groups={NAV}
        active={part === "front" ? (listed ?? undefined) : undefined}
        label="Site"
        linkComponent={Link}
        logo={({ collapsed }) => <BrandMark compact={collapsed} />}
      />

      {/* the skip link lands here: always visible, whichever side is showing */}
      <div
        id="main-content"
        tabIndex={-1}
        className="st-main outline-none"
        data-at-footer={(part === "front" && atFooter) || undefined}
        data-focused={focused || undefined}
      >
        {PARTS.map(({ value }) => (
          <div
            key={value}
            ref={value === "front" ? front : undefined}
            className="st-page st-enter"
            data-part={value}
            hidden={value !== part}
          >
            {panes[value]}
          </div>
        ))}

        <Island part={part} onSwap={swap} sides={!focused} />

        <Abimaela />
      </div>

      {/* Below 768px the sidebar is gone (CSS) and this takes over, in reach of the thumb. Both
          are always rendered and CSS picks one, so the first paint is already right. */}
      <MobileNav
        position="static"
        className="st-bar"
        items={BAR}
        active={part === "front" ? (listed ?? undefined) : undefined}
        label="Site"
        linkComponent={Link}
      />
    </div>
  )
}
