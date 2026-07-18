"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HouseLineIcon,
  UserSquareIcon,
  FileMdIcon,
  TerminalWindowIcon,
  ChatsCircleIcon,
  PianoKeysIcon,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/", icon: HouseLineIcon, label: "Home" },
  { href: "/about", icon: UserSquareIcon, label: "About" },
  { href: "/blog", icon: FileMdIcon, label: "Blog" },
  { href: "/projects", icon: TerminalWindowIcon, label: "Projects" },
  { href: "/contact", icon: ChatsCircleIcon, label: "Contact" },
  { href: "/piano", icon: PianoKeysIcon, label: "Piano" },
]

function isNavActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(href + "/")
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col items-center gap-1 border-r border-[var(--border-subtle)] bg-[var(--bg-canvas)] py-3">
      {/* Logo — gradient mark, matches the favicon. Gradient stops derive from
          --fg-brand so it still follows the active theme; the 'a' is centred by
          its baseline (y=67.25 on a 100 box) not the em-box, so it isn't low. */}
      <Link
        href="/"
        aria-label="Home"
        className="mb-2 block h-8 w-8 shrink-0 transition-opacity hover:opacity-80"
      >
        <svg viewBox="0 0 100 100" width={32} height={32} aria-hidden style={{ display: "block" }}>
          <defs>
            <linearGradient id="sidebar-logo-a" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" style={{ stopColor: "var(--fg-brand-hover)" }} />
              <stop
                offset="1"
                style={{ stopColor: "color-mix(in srgb, var(--fg-brand) 55%, #09090b)" }}
              />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="26" fill="url(#sidebar-logo-a)" />
          <text
            x="50"
            y="67.25"
            textAnchor="middle"
            fill="var(--zinc-50)"
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: "72px",
            }}
          >
            a
          </text>
        </svg>
      </Link>

      {/* Nav buttons */}
      <nav aria-label="Primary" className="flex flex-col items-center gap-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = isNavActive(href, pathname)
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              title={label}
              className={cn(
                "relative grid h-9 w-9 place-items-center rounded-[var(--radius-md)]",
                "transition-colors duration-[120ms]",
                active
                  ? "text-[var(--fg-primary)]"
                  : "text-[var(--fg-muted)] hover:bg-[var(--bg-hover-soft)] hover:text-[var(--fg-primary)]",
              )}
            >
              {active && (
                <span
                  className="pointer-events-none absolute top-1/2 -left-2.5 -translate-y-1/2 text-[9px] leading-none"
                  style={{ color: "var(--fg-brand)" }}
                  aria-hidden
                >
                  ◆
                </span>
              )}
              <Icon size={18} weight={active ? "fill" : "regular"} />
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
