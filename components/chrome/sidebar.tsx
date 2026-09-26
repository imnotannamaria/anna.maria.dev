"use client"

/**
 * The site's rail: entrepta's `Sidebar`, given this site's pages, its route matching and its logo.
 *
 * The rail itself — the 56px column, the icon that fills, the ◆ that travels to the active item —
 * is entrepta's. What stays here is what only this site knows: which pages exist and in what order
 * (the same order as the titlebar and the palette, which `lib/nav-order.test.ts` holds it to),
 * when a route counts as active, and the gradient `a`.
 */

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ComponentProps } from "react"
import {
  HouseLineIcon,
  UserSquareIcon,
  FileMdIcon,
  TerminalWindowIcon,
  ChatsCircleIcon,
  PianoKeysIcon,
  SquaresFourIcon,
  ListChecksIcon,
  SwatchesIcon,
} from "@phosphor-icons/react"
import { Sidebar as EntreptaSidebar } from "@/app/components/entrepta/sidebar"

const NAV_ITEMS = [
  // Same order as the titlebar and the palette — see the note in `titlebar.tsx`.
  { href: "/", icon: HouseLineIcon, label: "Home" },
  { href: "/about", icon: UserSquareIcon, label: "About" },
  { href: "/blog", icon: FileMdIcon, label: "Blog" },
  { href: "/projects", icon: TerminalWindowIcon, label: "Projects" },
  { href: "/contact", icon: ChatsCircleIcon, label: "Contact" },
  { href: "/components", icon: SwatchesIcon, label: "Components" },
  { href: "/roadmap", icon: ListChecksIcon, label: "Roadmap" },
  { href: "/log", icon: SquaresFourIcon, label: "Log" },
  { href: "/piano", icon: PianoKeysIcon, label: "Piano" },
]

const ITEMS = NAV_ITEMS.map((item) => ({ ...item, id: item.href }))

function isNavActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(href + "/")
}

/** next/link, marked so the site's click sound plays for a rail link as it does for a button. */
function SoundLink(props: ComponentProps<typeof Link>) {
  return <Link data-sound="click" {...props} />
}

/** Gradient mark, matches the favicon. Gradient stops derive from --fg-brand so it still follows
 *  the active theme; the 'a' is centred by its baseline (y=67.25 on a 100 box), not the em-box. */
const logo = (
  <Link
    href="/"
    aria-label="Home"
    data-sound="click"
    className="block h-8 w-8 transition-opacity hover:opacity-80"
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
)

export function Sidebar() {
  const pathname = usePathname()
  const active = ITEMS.find((item) => isNavActive(item.href, pathname))?.id

  return <EntreptaSidebar items={ITEMS} active={active} logo={logo} linkComponent={SoundLink} />
}
