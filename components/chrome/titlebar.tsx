"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  type Icon,
  HouseLineIcon,
  UserSquareIcon,
  FileMdIcon,
  TerminalWindowIcon,
  ChatsCircleIcon,
  PianoKeysIcon,
  SquaresFourIcon,
  FileIcon,
  ListChecksIcon,
  SwatchesIcon,
} from "@phosphor-icons/react"
import Link from "next/link"
import { TabNav, TabNavLink } from "@/app/components/entrepta/tabs"
import { toast } from "@/app/components/entrepta/toast"
import dynamic from "next/dynamic"
import { useCommandPalette } from "@/hooks/use-command-palette"

// cmdk + the palette only ship once the user actually opens it (⌘K / "+").
const CommandMenu = dynamic(() => import("./command-menu").then((m) => m.CommandMenu), {
  ssr: false,
})

type Tab = { href: string; name: string; icon: Icon }

/** Traffic-light easter egg — deduped by id so mashing the dots won't stack toasts. */
function showEasterEgg() {
  toast("Hey there, person testing a feature I haven't built yet 🤭", {
    id: "traffic-light-easter-egg",
  })
}

/**
 * Tab order, and it is the same list in the same order in three places — here, the sidebar and
 * the command palette. Work first — home, about, posts, projects — then contact, then the three
 * that are about the site itself: components, roadmap, log. Contact sits ahead of them because
 * it is the one tab with something to ask of a visitor, and it was behind the roadmap.
 *
 * Piano is last on purpose and stays last. It is the one page that is a toy rather than a
 * claim, so it reads as the thing at the end of the row rather than something competing with
 * the work above it.
 */
const NAV_TABS: Tab[] = [
  { href: "/", name: "home.tsx", icon: HouseLineIcon },
  { href: "/about", name: "about.md", icon: UserSquareIcon },
  { href: "/blog", name: "blog/", icon: FileMdIcon },
  { href: "/projects", name: "projects/", icon: TerminalWindowIcon },
  { href: "/contact", name: "contact.tsx", icon: ChatsCircleIcon },
  { href: "/components", name: "components/", icon: SwatchesIcon },
  { href: "/roadmap", name: "roadmap.md", icon: ListChecksIcon },
  { href: "/log", name: "log.tsx", icon: SquaresFourIcon },
  { href: "/piano", name: "piano.tsx", icon: PianoKeysIcon },
]

/**
 * Detail pages only. The roadmap used to open here rather than living in NAV_TABS, on the
 * grounds that an eighth permanent tab would crowd the row — but the row is a scroller with
 * fade edges, so it degrades on its own, and a page reachable from the sidebar and the
 * palette but never from the tabs was the odd one out.
 */
function getDynamicTab(pathname: string): Tab | null {
  const blogMatch = pathname.match(/^\/blog\/(.+)/)
  if (blogMatch) return { href: pathname, name: `${blogMatch[1]}.mdx`, icon: FileIcon }
  const projectMatch = pathname.match(/^\/projects\/(.+)/)
  if (projectMatch) return { href: pathname, name: `${projectMatch[1]}.tsx`, icon: FileIcon }
  const componentMatch = pathname.match(/^\/components\/(.+)/)
  if (componentMatch) return { href: pathname, name: `${componentMatch[1]}.mdx`, icon: FileIcon }
  return null
}

/**
 * Where the × sends you when a tab is "closed". Dynamic detail tabs fall back to
 * their parent listing (which also makes the tab disappear); the fixed nav tabs
 * fall back to home. Home has no meaningful close, so it shows no ×.
 */
function closeTarget(href: string): string {
  if (href.startsWith("/blog/")) return "/blog"
  if (href.startsWith("/projects/")) return "/projects"
  if (href.startsWith("/components/")) return "/components"
  return "/"
}

function isTabActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/"
  if (href === pathname) return true
  // directory tabs: active only if no dynamic tab takes over
  if (href === "/blog" && pathname.startsWith("/blog/")) return false
  if (href === "/projects" && pathname.startsWith("/projects/")) return false
  if (href === "/components" && pathname.startsWith("/components/")) return false
  return false
}

export function Titlebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { open, setOpen, toggle } = useCommandPalette()
  // Latch: mount the palette (and pull its chunk) only after the first open, then keep it.
  // Guarded set-during-render — no effect needed, avoids the extra commit.
  const [paletteMounted, setPaletteMounted] = useState(false)
  if (open && !paletteMounted) setPaletteMounted(true)
  const dynamicTab = getDynamicTab(pathname)
  const tabs = dynamicTab ? [...NAV_TABS, dynamicTab] : NAV_TABS

  return (
    // The window dots are entrepta's and purely decorative, so the easter egg is a delegated
    // click: anything inside `[data-window-dots]` says hi. They were never focusable either.
    <div
      onClick={(e) => {
        if ((e.target as Element).closest("[data-window-dots]")) showEasterEgg()
      }}
    >
      <TabNav
        aria-label="Pages"
        variant="window"
        after={
          <button
            type="button"
            onClick={toggle}
            aria-label="Open command palette"
            title="Open command palette (⌘K)"
            className="focus-ring text-mono-md flex shrink-0 cursor-pointer items-center px-3 font-mono text-[var(--fg-muted)] transition-colors hover:text-[var(--fg-primary)]"
          >
            +
          </button>
        }
        end={
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--fg-brand)]" />
            main
          </span>
        }
      >
        {tabs.map((tab) => {
          const active = isTabActive(tab.href, pathname)
          return (
            <TabNavLink
              key={tab.href}
              asChild
              active={active}
              icon={tab.icon}
              // The × only shows on the active tab, and only where "closing" leads somewhere
              // meaningful (everything except home).
              onClose={
                active && tab.href !== "/" ? () => router.push(closeTarget(tab.href)) : undefined
              }
              closeLabel={`Close ${tab.name}`}
            >
              <Link href={tab.href} data-sound="click">
                {tab.name}
              </Link>
            </TabNavLink>
          )
        })}
      </TabNav>

      {paletteMounted && <CommandMenu open={open} onOpenChange={setOpen} />}
    </div>
  )
}
