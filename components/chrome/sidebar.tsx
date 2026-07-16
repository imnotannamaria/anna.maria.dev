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
      {/* Logo */}
      <Link
        href="/"
        aria-label="Home"
        className="mb-2 grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-md)] transition-opacity hover:opacity-80"
        style={{ background: "var(--fg-brand)" }}
      >
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "20px",
            lineHeight: 1,
            fontWeight: 500,
            color: "var(--bg-canvas)",
            display: "block",
            transform: "translateY(-0.5px)",
          }}
        >
          a
        </span>
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
