"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ListChecksIcon } from "@phosphor-icons/react"

/**
 * The roadmap's entry in the sidebar.
 *
 * It sits under a hairline, apart from the primary nav, because the roadmap is not one of
 * the pages the titlebar keeps a permanent tab for. Everything else about it matches the
 * nav buttons above: same box, same hover, same ◆ when you are on the page.
 *
 * This used to open a dialog holding a copy of the board. The page says the same thing
 * with a URL people can send each other, so the dialog was a second implementation of it
 * that had to be kept in step.
 */
export function RoadmapNavLink() {
  const pathname = usePathname()
  const active = pathname === "/roadmap"

  return (
    <>
      {/* The rule pushes itself and the launcher to the bottom of the rail — margin-top:auto
          lives in the CSS rule, because an `mt-auto` utility loses to it. */}
      <span aria-hidden className="rm-launcher-rule" />

      <Link
        href="/roadmap"
        aria-label="Roadmap"
        aria-current={active ? "page" : undefined}
        title="Roadmap"
        className="rm-launcher mb-1"
      >
        <span aria-hidden className="rm-launcher-dot">
          ◆
        </span>
        {/* The same icon the titlebar tab and the command palette use for /roadmap. */}
        <ListChecksIcon size={18} weight={active ? "fill" : "regular"} aria-hidden />
      </Link>
    </>
  )
}
