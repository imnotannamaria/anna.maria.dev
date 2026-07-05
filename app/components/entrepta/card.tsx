"use client"

import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  [
    "relative flex flex-col gap-4 overflow-hidden",
    "rounded-[var(--radius-lg)] border",
    "transition-all duration-200 ease-out",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-[var(--bg-surface)] border-[var(--border-subtle)] p-6",
          "hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-elevated)]",
        ],
        featured: [
          "bg-[var(--bg-surface-brand)] border-[var(--fg-brand)]/30 p-6",
          "hover:border-[var(--fg-brand)]/50",
        ],
        terminal: ["bg-[var(--bg-surface)] border-[var(--border-subtle)] p-0", "font-mono"],
        data: [
          "bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] p-6 backdrop-blur-sm",
          "hover:border-[var(--border-strong)]",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      // Terminal cards intentionally stay dark in light mode for the IDE-chrome feel.
      data-surface={variant === "terminal" ? "dark" : undefined}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  ),
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between gap-3",
        "font-mono text-[11px] tracking-[0.08em] text-[var(--fg-secondary)] uppercase",
        className,
      )}
      {...props}
    />
  ),
)
CardHeader.displayName = "CardHeader"

/** Editor-style label with diamond glyph prefix. Use inside CardHeader. */
const CardLabel = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, children, ...props }, ref) => (
    <span ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props}>
      <span aria-hidden className="text-[10px] leading-none text-[var(--fg-brand)]">
        ◆
      </span>
      {children}
    </span>
  ),
)
CardLabel.displayName = "CardLabel"

/** Muted meta info (versions, dates). Use inside CardHeader. */
const CardMeta = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("text-[var(--fg-muted)]", className)} {...props} />
  ),
)
CardMeta.displayName = "CardMeta"

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "m-0 font-serif text-2xl leading-snug font-normal text-[var(--fg-primary)]",
        "[&_em]:text-[var(--fg-brand)] [&_em]:italic",
        className,
      )}
      {...props}
    />
  ),
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "m-0 font-sans text-[13px] leading-relaxed text-[var(--fg-secondary)]",
      className,
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn(className)} {...props} />,
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between gap-3",
        "font-mono text-[11px] text-[var(--fg-muted)]",
        className,
      )}
      {...props}
    />
  ),
)
CardFooter.displayName = "CardFooter"

/** Inline code-comment styling with // prefix. Use inside CardFooter. */
const CardComment = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, children, ...props }, ref) => (
    <span ref={ref} className={cn(className)} {...props}>
      <span aria-hidden className="text-[var(--fg-muted)]">
        {"// "}
      </span>
      {children}
    </span>
  ),
)
CardComment.displayName = "CardComment"

/** Terminal-style header bar with bg + border-bottom. Use as first child of Card variant="terminal". */
const CardTerminalBar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between gap-3 px-4 py-3",
        "border-b border-[var(--border-subtle)] bg-[var(--bg-chrome)]",
        "font-mono text-[11px] tracking-[0.08em] text-[var(--fg-secondary)] uppercase",
        className,
      )}
      {...props}
    />
  ),
)
CardTerminalBar.displayName = "CardTerminalBar"

/** Body wrapper for Card variant="terminal" (provides inner padding). */
const CardTerminalBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-4 font-mono text-[13px] leading-relaxed", className)}
      {...props}
    />
  ),
)
CardTerminalBody.displayName = "CardTerminalBody"

export {
  Card,
  CardHeader,
  CardLabel,
  CardMeta,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardComment,
  CardTerminalBar,
  CardTerminalBody,
}
