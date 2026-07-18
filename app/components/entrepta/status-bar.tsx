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
        "fixed right-0 bottom-0 left-0 z-40",
        "flex items-center justify-between gap-4",
        "px-4 py-1.5",
        "bg-[var(--fg-brand)] text-[var(--zinc-50)]",
        "font-mono text-[11px]",
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
