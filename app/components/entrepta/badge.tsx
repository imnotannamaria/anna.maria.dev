"use client"

import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap",
    "font-mono font-medium leading-none tracking-[0.02em]",
  ],
  {
    variants: {
      variant: {
        solid: "",
        soft: "",
        outline: "border bg-transparent",
      },
      color: {
        neutral: "",
        brand: "",
        success: "",
        warning: "",
        error: "",
        info: "",
      },
      size: {
        sm: "h-5 px-1.5 text-mono-xs rounded-[var(--radius-sm)]",
        md: "h-6 px-2 text-mono-sm rounded-[var(--radius-sm)]",
      },
    },
    compoundVariants: [
      // solid
      {
        variant: "solid",
        color: "neutral",
        className: "bg-[var(--border-strong)] text-[var(--fg-primary)]",
      },
      {
        variant: "solid",
        color: "brand",
        // The brand fill is the one that changes hue per theme, so its ink is a token
        // rather than the canvas. The status fills below are fixed colours and keep it.
        className: "bg-[var(--fg-brand)] text-[var(--fg-on-brand)]",
      },
      {
        variant: "solid",
        color: "success",
        className: "bg-[var(--status-success)] text-[var(--bg-canvas)]",
      },
      {
        variant: "solid",
        color: "warning",
        className: "bg-[var(--status-warning)] text-[var(--bg-canvas)]",
      },
      {
        variant: "solid",
        color: "error",
        className: "bg-[var(--status-error)] text-[var(--fg-primary)]",
      },
      {
        variant: "solid",
        color: "info",
        className: "bg-[var(--status-info)] text-[var(--bg-canvas)]",
      },
      // soft
      {
        variant: "soft",
        color: "neutral",
        className: "bg-[var(--bg-hover-strong)] text-[var(--fg-secondary)]",
      },
      {
        variant: "soft",
        color: "brand",
        className: "bg-[var(--bg-surface-brand)] text-[var(--fg-brand-hover)]",
      },
      {
        variant: "soft",
        color: "success",
        className: "bg-[var(--status-success-soft)] text-[var(--status-success-fg)]",
      },
      {
        variant: "soft",
        color: "warning",
        className: "bg-[var(--status-warning-soft)] text-[var(--status-warning-fg)]",
      },
      {
        variant: "soft",
        color: "error",
        className: "bg-[var(--status-error-soft)] text-[var(--status-error-fg)]",
      },
      {
        variant: "soft",
        color: "info",
        className: "bg-[var(--status-info-soft)] text-[var(--status-info-fg)]",
      },
      // outline
      {
        variant: "outline",
        color: "neutral",
        className: "border-[var(--border-strong)] text-[var(--fg-secondary)]",
      },
      {
        variant: "outline",
        color: "brand",
        className: "border-[var(--fg-brand)] text-[var(--fg-brand)]",
      },
      {
        variant: "outline",
        color: "success",
        className: "border-[var(--status-success)] text-[var(--status-success)]",
      },
      {
        variant: "outline",
        color: "warning",
        className: "border-[var(--status-warning)] text-[var(--status-warning)]",
      },
      {
        variant: "outline",
        color: "error",
        className: "border-[var(--status-error)] text-[var(--status-error)]",
      },
      {
        variant: "outline",
        color: "info",
        className: "border-[var(--status-info)] text-[var(--status-info)]",
      },
    ],
    defaultVariants: {
      variant: "soft",
      color: "neutral",
      size: "md",
    },
  },
)

const dotColorClass: Record<NonNullable<VariantProps<typeof badgeVariants>["color"]>, string> = {
  neutral: "bg-[var(--fg-muted)]",
  brand: "bg-[var(--fg-brand)]",
  success: "bg-[var(--status-success)]",
  warning: "bg-[var(--status-warning)]",
  error: "bg-[var(--status-error)]",
  info: "bg-[var(--status-info)]",
}

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">, VariantProps<typeof badgeVariants> {
  /** Render a colored status dot before the label */
  dot?: boolean
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, color, size, dot, children, ...props }, ref) => {
    const resolvedColor = color ?? "neutral"
    return (
      <span ref={ref} className={cn(badgeVariants({ variant, color, size }), className)} {...props}>
        {dot && (
          <span
            aria-hidden
            className={cn(
              "inline-block shrink-0 rounded-full",
              size === "sm" ? "size-1.5" : "size-2",
              dotColorClass[resolvedColor],
            )}
          />
        )}
        {children}
      </span>
    )
  },
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
