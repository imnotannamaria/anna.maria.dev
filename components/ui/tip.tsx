"use client"

import type * as React from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipShortcut,
  TooltipTrigger,
} from "@/app/components/entrepta/tooltip"
import { cn } from "@/lib/utils"

/**
 * entrepta's Tooltip around one child, for the places that used a native `title`.
 *
 * A `title` is the browser's own tooltip: it shows after a second, in the system's look, and
 * never on keyboard focus. This one is the design system's, opens on focus too, and is the same
 * box the sidebar's icons use. The four parts are always assembled the same way here, so they
 * are assembled once.
 *
 * The child must be something that takes a ref and a focus, a button or a link: `asChild` hands
 * the trigger's props straight to it. The provider is in `app/layout.tsx`.
 *
 * It is not the child's accessible name. Radix points `aria-describedby` at the content while
 * it is open; an icon-only control still needs its own `aria-label`.
 */
export function Tip({
  label,
  shortcut,
  side = "top",
  wrap = false,
  children,
}: {
  label: React.ReactNode
  /** A key hint after the label, such as `⌘K`. */
  shortcut?: string
  side?: "top" | "right" | "bottom" | "left"
  /** For a sentence rather than a word: wraps inside a capped width instead of running on. */
  wrap?: boolean
  children: React.ReactElement
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side={side}
        className={cn(wrap && "max-w-[min(360px,calc(100vw-32px))] whitespace-normal")}
      >
        {label}
        {shortcut && <TooltipShortcut>{shortcut}</TooltipShortcut>}
      </TooltipContent>
    </Tooltip>
  )
}
