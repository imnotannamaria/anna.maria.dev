"use client"

import { Slot } from "@radix-ui/react-slot"
import { type VariantProps, cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import * as React from "react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "group relative inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap",
    "font-mono font-medium",
    "border rounded-[var(--radius-md)]",
    "transition-all duration-150 ease-out",
    "focus-visible:outline-none focus-visible:border-[var(--fg-brand)] focus-visible:shadow-[0_0_0_3px_var(--bg-surface-brand)]",
    "disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-[var(--fg-brand)] text-[var(--bg-canvas)] border-transparent",
          "hover:bg-[var(--fg-brand-hover)] hover:-translate-y-px",
          "active:translate-y-0",
        ],
        secondary: [
          "bg-transparent text-[var(--fg-primary)] border-[var(--border-strong)]",
          "hover:border-[var(--fg-muted)] hover:bg-[var(--bg-hover-soft)]",
        ],
        ghost: [
          "bg-transparent text-[var(--fg-secondary)] border-transparent",
          "hover:text-[var(--fg-primary)] hover:bg-[var(--bg-hover-soft)]",
        ],
        command: [
          "bg-[var(--bg-surface)] text-[var(--fg-primary)] border-[var(--border-subtle)] font-normal",
          "before:content-['$'] before:text-[var(--fg-brand)] before:mr-0.5",
          "hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-elevated)]",
        ],
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-[13px]",
        lg: "h-12 px-6 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, disabled, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        data-loading={loading ? "true" : undefined}
        aria-busy={loading || undefined}
        {...props}
      >
        <span className={cn("inline-flex items-center gap-2", loading && "opacity-0")}>
          {children}
        </span>
        {loading && (
          <span
            aria-hidden
            className="absolute top-1/2 left-1/2 inline-flex -translate-x-1/2 -translate-y-1/2"
          >
            <Loader2 className="animate-spin" style={{ width: 14, height: 14, strokeWidth: 1.5 }} />
          </span>
        )}
      </Comp>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
