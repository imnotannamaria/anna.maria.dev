"use client"

import type { Icon } from "@phosphor-icons/react"
import * as React from "react"
import { cn } from "@/lib/utils"

export interface FilterPillProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  label: React.ReactNode
  /** A tally beside the label. At full contrast: it is information, not decoration. */
  count?: number
  active: boolean
  /** A Phosphor icon component. It fills when the pill is active. */
  icon?: Icon
}

/**
 * A toggle for one filter value, announced as pressed or not. Pair it with
 * `useUrlFilter` to keep the choice in the URL.
 */
const FilterPill = React.forwardRef<HTMLButtonElement, FilterPillProps>(
  ({ className, label, count, active, icon: PillIcon, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-pressed={active}
      className={cn(
        "inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap",
        "text-mono-sm rounded-[var(--radius-sm)] border px-3 font-mono",
        "transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out)]",
        "border-[var(--border-subtle)] bg-transparent text-[var(--fg-muted)]",
        "hover:text-[var(--fg-secondary)]",
        // the border can be the brand; the label needs the tint's own ink
        "aria-pressed:border-[var(--fg-brand)] aria-pressed:bg-[var(--bg-surface-brand)]",
        "aria-pressed:text-[var(--fg-brand-text)]",
        "focus-ring",
        className,
      )}
      {...props}
    >
      {PillIcon && (
        <PillIcon aria-hidden size={12} weight={active ? "fill" : "regular"} className="shrink-0" />
      )}
      {label}
      {count != null && (
        <span
          className={cn(
            "rounded-full px-1.5 tabular-nums",
            active ? "bg-[var(--bg-hover-strong)]" : "bg-[var(--bg-surface-elevated)]",
          )}
        >
          {count}
        </span>
      )}
    </button>
  ),
)
FilterPill.displayName = "FilterPill"

export { FilterPill }
