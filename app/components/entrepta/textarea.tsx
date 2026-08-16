"use client"

import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"
import { cn } from "@/lib/utils"

const textareaVariants = cva(
  [
    "w-full block",
    "bg-[var(--bg-surface)]",
    "border rounded-[var(--radius-md)]",
    "px-3 py-2.5",
    "font-sans text-mono-md leading-relaxed text-[var(--fg-primary)]",
    "placeholder:text-[var(--fg-muted)] placeholder:font-mono",
    "appearance-none outline-none resize-y",
    "transition-all duration-150 ease-out",
    "hover:border-[var(--fg-muted)]",
    "focus:border-[var(--fg-brand)] focus:shadow-[0_0_0_3px_var(--bg-surface-brand)]",
    "disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed",
  ],
  {
    variants: {
      state: {
        default: "border-[var(--border-strong)]",
        error: [
          "border-[var(--status-error)]",
          "hover:border-[var(--status-error)]",
          "focus:border-[var(--status-error)] focus:shadow-[0_0_0_3px_var(--status-error-soft)]",
        ],
      },
    },
    defaultVariants: { state: "default" },
  },
)

export interface TextareaProps
  extends
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

/** Sans rather than mono: this holds prose, and prose reads better in Inter. */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, state, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(textareaVariants({ state }), className)}
      {...props}
    />
  ),
)
Textarea.displayName = "Textarea"

export { Textarea }
