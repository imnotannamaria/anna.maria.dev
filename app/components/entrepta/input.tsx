"use client"

import { MagnifyingGlassIcon } from "@phosphor-icons/react"
import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Kbd } from "./kbd"

const inputWrapperVariants = cva(
  [
    "flex items-center gap-2 w-full",
    "bg-[var(--bg-field)]",
    "border rounded-[var(--radius-md)]",
    "transition-all duration-150 ease-out",
    "hover:border-[var(--fg-muted)]",
    "focus-within:border-[var(--fg-brand)] focus-within:shadow-[0_0_0_3px_var(--bg-surface-brand)]",
    "has-[:disabled]:opacity-40 has-[:disabled]:pointer-events-none",
    // an invalid input, such as one a Field marks, looks like the error state
    "has-[[aria-invalid=true]]:border-[var(--status-error)]",
    "has-[[aria-invalid=true]]:focus-within:shadow-[0_0_0_3px_var(--status-error-soft)]",
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
  "font-mono text-mono-md text-[var(--fg-primary)]",
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
          <MagnifyingGlassIcon aria-hidden className="shrink-0 text-[var(--fg-muted)]" size={14} />
        )}
        {variant === "command" && (
          <span
            aria-hidden
            className="shrink-0 font-mono leading-none text-[var(--fg-brand)] select-none"
          >
            $
          </span>
        )}
        <input
          ref={ref}
          aria-invalid={state === "error" || undefined}
          className={inputBaseClass}
          {...props}
        />
        {variant === "command" && <Kbd aria-hidden>⌘K</Kbd>}
      </div>
    )
  },
)
Input.displayName = "Input"

export { Input }
