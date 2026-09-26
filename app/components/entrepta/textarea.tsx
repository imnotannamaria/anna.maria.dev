"use client"

import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"
import { cn } from "@/lib/utils"

const textareaVariants = cva(
  [
    "block w-full",
    "bg-[var(--bg-field)]",
    "border rounded-[var(--radius-md)]",
    "px-3 py-2.5",
    "font-sans text-body-md leading-relaxed text-[var(--fg-primary)]",
    "placeholder:font-mono placeholder:text-[var(--fg-muted)]",
    "appearance-none outline-none resize-y",
    "transition-all duration-150 ease-out",
    "hover:border-[var(--fg-muted)]",
    "focus:border-[var(--fg-brand)] focus:shadow-[0_0_0_3px_var(--bg-surface-brand)]",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
    // an invalid textarea, such as one a Field marks, looks like the error state
    "aria-invalid:border-[var(--status-error)] aria-invalid:focus:shadow-[0_0_0_3px_var(--status-error-soft)]",
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

/** Sans, not mono: a textarea holds prose. The placeholder stays mono, like a hint. */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, state, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={state === "error" || undefined}
      className={cn(textareaVariants({ state }), className)}
      {...props}
    />
  ),
)
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }
