"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TopNavProps extends React.HTMLAttributes<HTMLElement> {
  left?: React.ReactNode
  center?: React.ReactNode
  right?: React.ReactNode
}

const TopNav = React.forwardRef<HTMLElement, TopNavProps>(
  ({ className, left, center, right, children, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn(
        "relative flex items-center justify-between gap-4",
        "px-4 py-4 sm:px-6",
        "border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-2">{left ?? children}</div>
      {center && (
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center sm:flex">
          {center}
        </div>
      )}
      <div className="flex shrink-0 items-center gap-3">{right}</div>
    </nav>
  ),
)
TopNav.displayName = "TopNav"

type TopNavLogoProps = React.HTMLAttributes<HTMLDivElement>

const TopNavLogo = React.forwardRef<HTMLDivElement, TopNavLogoProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "text-mono-md inline-flex items-center gap-2 font-mono text-[var(--fg-primary)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
)
TopNavLogo.displayName = "TopNavLogo"

type TopNavLogoMarkProps = React.HTMLAttributes<HTMLSpanElement>

/** Brand-colored 24x24 tile with serif italic letter. Compose inside TopNavLogo. */
const TopNavLogoMark = React.forwardRef<HTMLSpanElement, TopNavLogoMarkProps>(
  ({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-grid shrink-0 place-items-center",
        "size-6 rounded-[var(--radius-sm)]",
        "bg-[var(--fg-brand)] text-[var(--fg-on-brand)]",
        "text-body-md font-serif leading-none italic",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  ),
)
TopNavLogoMark.displayName = "TopNavLogoMark"

type TopNavBreadcrumbProps = React.HTMLAttributes<HTMLDivElement>

const TopNavBreadcrumb = React.forwardRef<HTMLDivElement, TopNavBreadcrumbProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "hidden items-center gap-1.5 sm:flex",
        "text-mono-md font-mono text-[var(--fg-muted)]",
        "[&_.here]:text-[var(--fg-primary)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
)
TopNavBreadcrumb.displayName = "TopNavBreadcrumb"

const TopNavSeparator = () => (
  <span aria-hidden className="text-[var(--fg-muted)] opacity-60 select-none">
    /
  </span>
)
TopNavSeparator.displayName = "TopNavSeparator"

type TopNavMenuProps = React.HTMLAttributes<HTMLElement>

const TopNavMenu = React.forwardRef<HTMLElement, TopNavMenuProps>(
  ({ className, children, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn(
        "hidden items-center gap-6 md:flex",
        "text-mono-sm font-mono tracking-[0.06em] uppercase",
        className,
      )}
      {...props}
    >
      {children}
    </nav>
  ),
)
TopNavMenu.displayName = "TopNavMenu"

interface TopNavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean
  external?: boolean
}

const TopNavLink = React.forwardRef<HTMLAnchorElement, TopNavLinkProps>(
  ({ className, children, active, external, ...props }, ref) => (
    <a
      ref={ref}
      data-state={active ? "active" : undefined}
      className={cn(
        "inline-flex items-center gap-1",
        "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]",
        "transition-colors duration-150",
        active && "font-medium text-[var(--fg-primary)]",
        className,
      )}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    >
      {children}
      {external && (
        <span aria-hidden className="text-[var(--fg-muted)]">
          ↗
        </span>
      )}
    </a>
  ),
)
TopNavLink.displayName = "TopNavLink"

export {
  TopNav,
  TopNavBreadcrumb,
  TopNavLink,
  TopNavLogo,
  TopNavLogoMark,
  TopNavMenu,
  TopNavSeparator,
}
export type {
  TopNavBreadcrumbProps,
  TopNavLinkProps,
  TopNavLogoMarkProps,
  TopNavLogoProps,
  TopNavMenuProps,
  TopNavProps,
}
