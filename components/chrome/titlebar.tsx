"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const NAV_TABS = [
  { href: "/", name: "home.tsx" },
  { href: "/about", name: "about.md" },
  { href: "/blog", name: "posts/" },
  { href: "/projects", name: "projects/" },
  { href: "/contact", name: "contact.tsx" },
  { href: "/piano", name: "piano.tsx" },
  { href: "/log", name: "log.tsx" },
]

function getDynamicTab(pathname: string): { href: string; name: string } | null {
  const blogMatch = pathname.match(/^\/blog\/(.+)/)
  if (blogMatch) return { href: pathname, name: `${blogMatch[1]}.mdx` }
  const projectMatch = pathname.match(/^\/projects\/(.+)/)
  if (projectMatch) return { href: pathname, name: `${projectMatch[1]}.tsx` }
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

  return (
    <div className="flex items-stretch border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-none">
      {/* Traffic lights */}
      <div className="flex w-[84px] shrink-0 items-center gap-1.5 border-r border-[var(--border-subtle)] px-3">
        <span className="h-3 w-3 rounded-full bg-[var(--status-error)] opacity-85" />
        <span className="h-3 w-3 rounded-full bg-[var(--status-warning)] opacity-85" />
        <span className="h-3 w-3 rounded-full bg-[var(--status-success)] opacity-85" />
      </div>

      {/* Tabs */}
      <div className="flex flex-1 items-stretch overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const active = isTabActive(tab.href, pathname)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "inline-flex h-full shrink-0 items-center gap-2 px-4",
                "border-r border-[var(--border-subtle)] font-mono text-[12px]",
                "transition-colors duration-[120ms]",
                active
                  ? "bg-[var(--bg-surface)] text-[var(--fg-primary)]"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg-secondary)]",
              )}
            >
              <span
                className="text-[9px]"
                style={{ color: active ? "var(--fg-brand)" : "transparent" }}
              >
                ◆
              </span>
              {tab.name}
              <span
                className={cn(
                  "inline-grid h-3.5 w-3.5 place-items-center rounded-sm text-[12px]",
                  "text-[var(--fg-muted)] transition-opacity",
                  active ? "opacity-60 hover:opacity-100" : "opacity-0",
                )}
              >
                ×
              </span>
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
