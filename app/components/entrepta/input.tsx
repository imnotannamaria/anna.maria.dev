"use client"

import { type VariantProps, cva } from "class-variance-authority"
import { Search } from "lucide-react"
import * as React from "react"
import { cn } from "@/lib/utils"

const inputWrapperVariants = cva(
  [
    "flex items-center gap-2 w-full",
    "bg-[var(--bg-surface)]",
    "border rounded-[var(--radius-md)]",
    "transition-all duration-150 ease-out",
    "hover:border-[var(--fg-muted)]",
    "focus-within:border-[var(--fg-brand)] focus-within:shadow-[0_0_0_3px_var(--bg-surface-brand)]",
    "has-[:disabled]:opacity-40 has-[:disabled]:pointer-events-none",
  ],
  {
    variants: {
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-3",
        lg: "h-12 px-4",
      },
      state: {
        default: "border-[var(--border-strong)]",
        error: [
          "border-[var(--status-error)]",
          "hover:border-[var(--status-error)]",
          "focus-within:border-[var(--status-error)] focus-within:shadow-[0_0_0_3px_var(--status-error-soft)]",
        ],
      },
    },
    defaultVariants: {
      size: "md",
      state: "default",
    },
  },
)

const inputBaseClass = [
  "flex-1 min-w-0 h-full",
  "bg-transparent border-0 appearance-none outline-none",
  "font-mono text-[13px] text-[var(--fg-primary)]",
  "placeholder:text-[var(--fg-muted)]",
  "disabled:cursor-not-allowed",
].join(" ")

export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputWrapperVariants> {
  variant?: "default" | "search" | "command"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = "default", size, state, ...props }, ref) => {
    return (
      <div className={cn(inputWrapperVariants({ size, state }), className)}>
        {variant === "search" && (
          <Search
            aria-hidden
            className="shrink-0 text-[var(--fg-muted)]"
            style={{ width: 14, height: 14, strokeWidth: 1.5 }}
          />
        )}
        {variant === "command" && (
          <span
            aria-hidden
            className="shrink-0 font-mono leading-none text-[var(--fg-brand)] select-none"
          >
            $
          </span>
        )}
        <input ref={ref} className={inputBaseClass} {...props} />
        {variant === "command" && (
          <kbd
            aria-hidden
            className="inline-flex shrink-0 items-center gap-0.5 font-mono text-[11px] tracking-wide text-[var(--fg-muted)] select-none"
          >
            <span>⌘</span>
            <span>K</span>
          </kbd>
        )}
      </div>
    )
  },
)
Input.displayName = "Input"

export { Input }
