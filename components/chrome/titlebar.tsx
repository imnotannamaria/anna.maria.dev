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
import { TabStrip } from "./tab-strip"
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

const NAV_TABS: Tab[] = [
  { href: "/", name: "home.tsx", icon: HouseLineIcon },
  { href: "/about", name: "about.md", icon: UserSquareIcon },
  { href: "/blog", name: "posts/", icon: FileMdIcon },
  { href: "/projects", name: "projects/", icon: TerminalWindowIcon },
  { href: "/contact", name: "contact.tsx", icon: ChatsCircleIcon },
  { href: "/log", name: "log.tsx", icon: SquaresFourIcon },
  { href: "/piano", name: "piano.tsx", icon: PianoKeysIcon },
  { href: "/roadmap", name: "roadmap.md", icon: ListChecksIcon },
  { href: "/components", name: "components/", icon: SwatchesIcon },
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
    <div className="flex items-stretch border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none">
      {/* Traffic lights — non-functional, but they say hi if you poke them */}
      <div className="flex w-[84px] shrink-0 items-center gap-1.5 border-r border-[var(--border-subtle)] px-3">
        {["var(--status-error)", "var(--status-warning)", "var(--status-success)"].map((color) => (
          <button
            key={color}
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={showEasterEgg}
            className="h-3 w-3 rounded-full opacity-85 transition-[opacity,transform] hover:scale-110 hover:opacity-100"
            style={{ background: color }}
          />
        ))}
      </div>

      {/* Tabs. The row itself lives in `TabStrip`, which /components uses too — two tab
          rows that did not match was the divergence worth removing. */}
      <TabStrip
        tabs={tabs.map((tab) => {
          const active = isTabActive(tab.href, pathname)
          return {
            key: tab.href,
            name: tab.name,
            icon: tab.icon,
            active,
            href: tab.href,
            // The × only shows on the active tab, and only where "closing" leads somewhere
            // meaningful (everything except home).
            onClose:
              active && tab.href !== "/" ? () => router.push(closeTarget(tab.href)) : undefined,
          }
        })}
        label="Pages"
        layoutId="titlebar-active-tab"
      >
        <button
          type="button"
          onClick={toggle}
          aria-label="Open command palette"
          title="Open command palette (⌘K)"
          className="focus-ring text-mono-md flex shrink-0 cursor-pointer items-center px-3 font-mono text-[var(--fg-muted)] transition-colors hover:text-[var(--fg-primary)]"
        >
          +
        </button>
      </TabStrip>

      {/* Right meta */}
      <div className="text-mono-sm hidden shrink-0 items-center gap-4 px-4 font-mono text-[var(--fg-muted)] md:flex">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--fg-brand)]" />
          main
        </span>
      </div>

      {paletteMounted && <CommandMenu open={open} onOpenChange={setOpen} />}
    </div>
  )
}
