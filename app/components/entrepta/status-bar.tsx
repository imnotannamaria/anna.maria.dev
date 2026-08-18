"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface StatusBarProps extends React.HTMLAttributes<HTMLDivElement> {
  left?: React.ReactNode
  right?: React.ReactNode
}

const StatusBar = React.forwardRef<HTMLDivElement, StatusBarProps>(
  ({ className, left, right, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Not `fixed`. The only consumer is the editor chrome in app/layout.tsx, which puts
        // this in a grid row, and it was undoing `fixed right-0 bottom-0 left-0 z-40` with
        // five inline properties — a component fighting its single caller. If some page ever
        // wants it pinned to the viewport, that is a variant, not an override.
        "relative",
        // `flex` would be dead here: the `hidden sm:flex` below is in the same class group,
        // so cn() drops it. The bar is hidden under `sm` and a flex row from `sm` up.
        "items-center justify-between gap-4",
        "px-4 py-1.5",
        // `--fg-on-brand`, not a fixed near-white. This bar is text on a --fg-brand fill,
        // which is the exact case that token was added for, and it never adopted it: a
        // hardcoded zinc-50 clears AA on 5 of the 12 theme x mode combinations and fails the
        // other 7, including entrepta dark at 3.72 and marmalade dark at 2.38. The token
        // picks near-black or near-white per theme and takes that to 11 of 12. The one that
        // still fails is entrepta light, where neither ink clears 4.5:1 on #6b5bff — see the
        // note above --fg-on-brand in globals.css; that one needs the brand darkened.
        "bg-[var(--fg-brand)] text-[var(--fg-on-brand)]",
        "text-mono-sm font-mono",
        "hidden sm:flex",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-4">{left ?? children}</div>
      {right && <div className="flex items-center gap-4">{right}</div>}
    </div>
  ),
)
StatusBar.displayName = "StatusBar"

interface StatusBarItemProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon?: React.ReactNode
}

const StatusBarItem = React.forwardRef<HTMLSpanElement, StatusBarItemProps>(
  ({ className, children, icon, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 opacity-95 hover:opacity-100",
        "cursor-default transition-opacity duration-150",
        className,
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  ),
)
StatusBarItem.displayName = "StatusBarItem"

/** Inline `·` separator between items. Sits with reduced opacity. */
const StatusBarSeparator = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden
      className={cn("inline-block opacity-60 select-none", className)}
      {...props}
    >
      ·
    </span>
  ),
)
StatusBarSeparator.displayName = "StatusBarSeparator"

export { StatusBar, StatusBarItem, StatusBarSeparator }
export type { StatusBarItemProps, StatusBarProps }
