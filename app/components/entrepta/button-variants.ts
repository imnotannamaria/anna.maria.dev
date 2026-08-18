import { type VariantProps, cva } from "class-variance-authority"

// Kept in a client-free module so both the "use client" Button and
// server components (e.g. Link-as-button on the home page) can share it.
export const buttonVariants = cva(
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
          // --fg-on-brand, not --bg-canvas: the canvas flips with the mode, and the label
          // sits on the brand, whose hue decides which ink is legible. See globals.css.
          "bg-[var(--fg-brand)] text-[var(--fg-on-brand)] border-transparent",
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
        sm: "h-8 px-3 text-mono-sm",
        md: "h-10 px-4 text-mono-md",
        lg: "h-12 px-6 text-body-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
)

export type ButtonVariantProps = VariantProps<typeof buttonVariants>
