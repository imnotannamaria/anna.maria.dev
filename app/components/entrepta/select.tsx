"use client"

import { type VariantProps, cva } from "class-variance-authority"
import { ChevronDown } from "lucide-react"
import * as React from "react"
import { cn } from "@/lib/utils"

const selectWrapperVariants = cva(
  [
    "relative flex items-center w-full",
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
        sm: "h-8 pl-3 pr-8",
        md: "h-10 pl-3 pr-8",
        lg: "h-12 pl-4 pr-9",
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
    defaultVariants: { size: "md", state: "default" },
  },
)

export interface SelectProps
  extends
    Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">,
    VariantProps<typeof selectWrapperVariants> {}

/**
 * A styled native `<select>`, not a Radix listbox. It comes with keyboard behaviour, type
 * ahead and the platform picker on mobile — all of which a custom one would have to
 * reimplement, worse.
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, size, state, children, ...props }, ref) => (
    <div className={cn(selectWrapperVariants({ size, state }), className)}>
      <select
        ref={ref}
        className={[
          "h-full w-full min-w-0 flex-1",
          "cursor-pointer appearance-none border-0 bg-transparent outline-none",
          "font-mono text-[13px] text-[var(--fg-primary)]",
          "disabled:cursor-not-allowed",
        ].join(" ")}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 shrink-0 text-[var(--fg-muted)]"
        style={{ width: 14, height: 14, strokeWidth: 1.5 }}
      />
    </div>
  ),
)
Select.displayName = "Select"

export { Select }
