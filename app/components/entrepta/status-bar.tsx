"use client"

import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"
import { cn } from "@/lib/utils"

const statusBarVariants = cva(
  [
    "items-center justify-between gap-4",
    "py-1.5 px-4",
    "bg-[var(--fg-brand)] text-[var(--fg-on-brand)]",
    "font-mono text-mono-sm",
    "hidden sm:flex",
  ],
  {
    variants: {
      position: {
        // pinned to the bottom of the viewport
        fixed: "fixed bottom-0 left-0 right-0 z-40",
        // a row in your own layout, such as the last row of an editor grid
        static: "relative",
      },
    },
    defaultVariants: { position: "fixed" },
  },
)

interface StatusBarProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof statusBarVariants> {
  left?: React.ReactNode
  right?: React.ReactNode
}

const StatusBar = React.forwardRef<HTMLDivElement, StatusBarProps>(
  ({ className, position, left, right, children, ...props }, ref) => (
    <div ref={ref} className={cn(statusBarVariants({ position }), className)} {...props}>
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

export { StatusBar, StatusBarItem, StatusBarSeparator, statusBarVariants }
export type { StatusBarItemProps, StatusBarProps }
