"use client"

/**
 * The site's rail: entrepta's `Sidebar`, given this site's pages, its route matching and its logo.
 *
 * The rail itself — the 56px column, the icon that fills, the ◆ that travels to the active item —
 * is entrepta's. What stays here is what only this site knows: which pages exist and in what order
 * (the same order as the titlebar and the palette, which `lib/nav-order.test.ts` holds it to),
 * when a route counts as active, and the logo.
 */

import Image from "next/image"
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

/** The mark, the same cat as the favicon. */
const logo = (
  <Link
    href="/"
    aria-label="Home"
    data-sound="click"
    className="block h-8 w-8 transition-opacity hover:opacity-80"
  >
    <Image
      src="/brand/mark.png"
      alt=""
      width={32}
      height={32}
      sizes="32px"
      priority
      style={{ display: "block" }}
    />
  </Link>
)

export function Sidebar() {
  const pathname = usePathname()
  const active = ITEMS.find((item) => isNavActive(item.href, pathname))?.id

  return <EntreptaSidebar items={ITEMS} active={active} logo={logo} linkComponent={SoundLink} />
}
