"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  type Icon,
  HouseLineIcon,
  UserSquareIcon,
  FileMdIcon,
  TerminalWindowIcon,
  ChatsCircleIcon,
  PianoKeysIcon,
  BookBookmarkIcon,
  FileIcon,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

type Tab = { href: string; name: string; icon: Icon }

const NAV_TABS: Tab[] = [
  { href: "/", name: "home.tsx", icon: HouseLineIcon },
  { href: "/about", name: "about.md", icon: UserSquareIcon },
  { href: "/blog", name: "posts/", icon: FileMdIcon },
  { href: "/projects", name: "projects/", icon: TerminalWindowIcon },
  { href: "/contact", name: "contact.tsx", icon: ChatsCircleIcon },
  { href: "/piano", name: "piano.tsx", icon: PianoKeysIcon },
  { href: "/log", name: "log.tsx", icon: BookBookmarkIcon },
]

function getDynamicTab(pathname: string): Tab | null {
  const blogMatch = pathname.match(/^\/blog\/(.+)/)
  if (blogMatch) return { href: pathname, name: `${blogMatch[1]}.mdx`, icon: FileIcon }
  const projectMatch = pathname.match(/^\/projects\/(.+)/)
  if (projectMatch) return { href: pathname, name: `${projectMatch[1]}.tsx`, icon: FileIcon }
  return null
}

function isTabActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/"
  if (href === pathname) return true
  // directory tabs: active only if no dynamic tab takes over
  if (href === "/blog" && pathname.startsWith("/blog/")) return false
  if (href === "/projects" && pathname.startsWith("/projects/")) return false
  return false
}

export function Titlebar() {
  const pathname = usePathname()
  const dynamicTab = getDynamicTab(pathname)
  const tabs = dynamicTab ? [...NAV_TABS, dynamicTab] : NAV_TABS

  // Fade the scroll edges only when tabs actually overflow that side — on desktop
  // everything fits, so no fade; on mobile it signals the tabs are horizontally scrollable.
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: false, end: false })

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const update = () => {
      setEdges({
        start: el.scrollLeft > 1,
        end: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
      })
    }
    update()
    el.addEventListener("scroll", update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", update)
      ro.disconnect()
    }
  }, [tabs.length])

  const fadeLeft = edges.start ? "28px" : "0px"
  const fadeRight = edges.end ? "28px" : "0px"
  const fadeMask = `linear-gradient(to right, transparent 0, #000 ${fadeLeft}, #000 calc(100% - ${fadeRight}), transparent 100%)`

  return (
    <div className="flex items-stretch border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none">
      {/* Traffic lights */}
      <div className="flex w-[84px] shrink-0 items-center gap-1.5 border-r border-[var(--border-subtle)] px-3">
        <span className="h-3 w-3 rounded-full bg-[var(--status-error)] opacity-85" />
        <span className="h-3 w-3 rounded-full bg-[var(--status-warning)] opacity-85" />
        <span className="h-3 w-3 rounded-full bg-[var(--status-success)] opacity-85" />
      </div>

      {/* Tabs */}
      <div
        ref={scrollerRef}
        className="flex flex-1 items-stretch overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ maskImage: fadeMask, WebkitMaskImage: fadeMask }}
      >
        {tabs.map((tab) => {
          const active = isTabActive(tab.href, pathname)
          const TabIcon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              title={tab.name}
              className={cn(
                "inline-flex h-full shrink-0 items-center gap-2 px-3 sm:px-4",
                "border-r border-[var(--border-subtle)] font-mono text-[12px]",
                "transition-colors duration-[120ms]",
                active
                  ? "bg-[var(--bg-surface)] text-[var(--fg-primary)]"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg-secondary)]",
              )}
            >
              <TabIcon
                size={15}
                weight={active ? "fill" : "regular"}
                style={{ color: active ? "var(--fg-brand)" : "currentColor" }}
                className="shrink-0"
              />
              {/* Filename: always for the active tab, only on sm+ for inactive ones */}
              <span className={cn(active ? "inline" : "hidden sm:inline")}>{tab.name}</span>
              {active && (
                <span
                  className={cn(
                    "inline-grid h-3.5 w-3.5 place-items-center rounded-sm text-[12px]",
                    "text-[var(--fg-muted)] opacity-60 transition-opacity hover:opacity-100",
                  )}
                >
                  ×
                </span>
              )}
            </Link>
          )
        })}
        <button
          className="flex shrink-0 items-center px-3 font-mono text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--fg-primary)]"
          aria-label="New tab"
        >
          +
        </button>
      </div>

      {/* Right meta */}
      <div className="hidden shrink-0 items-center gap-4 px-4 font-mono text-[11px] text-[var(--fg-muted)] md:flex">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--fg-brand)]" />
          main
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full bg-[var(--status-success)]"
            style={{
              animation: "pulse-ok 2.2s ease-out infinite",
              boxShadow: "0 0 0 0 rgba(16,185,129,0.5)",
            }}
          />
          live
        </span>
      </div>
    </div>
  )
}
