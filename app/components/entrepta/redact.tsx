"use client"

import * as React from "react"
import { MaskedScope, useRedacted } from "@/hooks/use-redact"
import { cn } from "@/lib/utils"

interface RedactProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  /** What screen readers hear in its place. */
  label?: string
}

/**
 * A value that hides when the app says so, behind a mask of its own width, so
 * nothing around it moves. Screen readers hear "hidden value" instead. Amount,
 * Metric and RollingNumber already do this; wrap anything else.
 */
const Redact = React.forwardRef<HTMLSpanElement, RedactProps>(
  ({ children, label = "hidden value", className, ...props }, ref) => {
    const redacted = useRedacted()
    if (!redacted) return <>{children}</>
    return (
      <span
        ref={ref}
        data-redacted
        className={cn("relative inline-flex max-w-full align-baseline", className)}
        {...props}
      >
        {/* kept for its width, out of sight and out of the reading order */}
        <span aria-hidden className="invisible select-none">
          <MaskedScope>{children}</MaskedScope>
        </span>
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-0 top-[12%] bottom-[12%] rounded-[var(--radius-sm)]",
            "bg-[repeating-linear-gradient(135deg,var(--bg-hover-strong)_0_4px,transparent_4px_8px)]",
            "border border-[var(--border-subtle)] bg-[var(--bg-hover-soft)]",
          )}
        />
        <span className="sr-only">{label}</span>
      </span>
    )
  },
)
Redact.displayName = "Redact"

export { Redact }
export type { RedactProps }
