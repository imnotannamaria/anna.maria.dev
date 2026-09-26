import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"
import { Diamond } from "./diamond"
import { type IconProp, IconSlot } from "@/lib/icon"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  [
    "relative flex flex-col overflow-hidden border",
    // `translate`, not `transform`: Tailwind's hover lift sets the `translate` property, while
    // Motion writes `transform` every frame when it animates `x` or `y`. A CSS transition on
    // `transform` would ease each of those frames and drag a card's entrance behind its spring.
    "transition-[border-color,background-color,box-shadow,translate] duration-200 ease-[var(--ease-out)]",
  ],
  {
    variants: {
      variant: {
        // a hair above the canvas, defined by its border
        default: [
          "sheen bg-[var(--bg-card)] border-[var(--border-subtle)] shadow-[var(--shadow-card)]",
          "hover:border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)]",
        ],
        featured: [
          "bg-[var(--bg-surface-brand)] border-[var(--border-brand)]",
          "hover:border-[var(--border-brand-strong)] hover:-translate-y-0.5",
          "hover:shadow-[var(--shadow-lift-brand)]",
        ],
        // Stays dark in both modes. It sets its own text color too: color
        // inherits as a computed value, so a light page's ink would leak in.
        terminal: [
          "sheen bg-[var(--bg-overlay)] border-[var(--border-subtle)] shadow-[var(--shadow-card)]",
          "text-[var(--fg-primary)] font-mono",
        ],
        data: [
          // glass: the card color at 80%, blurred, with the corner glow
          "sheen bg-[color-mix(in_srgb,var(--bg-card)_80%,transparent)] border-[var(--border-subtle)] backdrop-blur-sm shadow-[var(--shadow-card)]",
          "hover:border-[var(--border-strong)]",
        ],
      },
      size: {
        sm: "rounded-[var(--radius-lg)] p-3.5 gap-2.5",
        md: "rounded-[var(--radius-lg)] p-6 gap-4 max-sm:p-5",
        xl: "rounded-[var(--radius-xl)] pt-14 px-12 pb-12 gap-4 max-sm:pt-8 max-sm:px-5 max-sm:pb-7",
      },
    },
    compoundVariants: [
      // the terminal's bar and body carry their own padding
      { variant: "terminal", className: "p-0 max-sm:p-0 gap-0" },
    ],
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

/** Clips its content with no ellipsis, so long strings belong in parts that wrap. */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      data-surface={variant === "terminal" ? "dark" : undefined}
      className={cn(cardVariants({ variant, size }), className)}
      {...props}
    />
  ),
)
Card.displayName = "Card"

/**
 * The row wraps and each half does not. The label and the meta are short
 * strings, so when they do not fit side by side the meta moves to the next
 * line instead of either one breaking mid-word.
 */
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-3 gap-y-1",
        "text-mono-sm font-mono tracking-[0.08em] text-[var(--fg-secondary)] uppercase",
        className,
      )}
      {...props}
    />
  ),
)
CardHeader.displayName = "CardHeader"

interface CardLabelProps extends React.HTMLAttributes<HTMLElement> {
  /** Render the label as a heading when it names the card. */
  as?: "span" | "h2" | "h3"
  /** A Phosphor icon in place of the ◆, when the label names a kind of thing. */
  icon?: IconProp
}

/** Editor-style label with the ◆ prefix, or an icon. Use inside CardHeader. */
const CardLabel = React.forwardRef<HTMLElement, CardLabelProps>(
  ({ className, children, as: Tag = "span", icon: LabelIcon, ...props }, ref) => (
    <Tag
      ref={ref as React.Ref<HTMLHeadingElement>}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap",
        Tag !== "span" && "m-0 font-[inherit] text-[length:inherit]",
        className,
      )}
      {...props}
    >
      {LabelIcon ? (
        <IconSlot icon={LabelIcon} size={12} className="text-[var(--fg-brand)]" />
      ) : (
        <Diamond size={10} />
      )}
      {children}
    </Tag>
  ),
)
CardLabel.displayName = "CardLabel"

/** Muted meta info (versions, dates). Use inside CardHeader. */
const CardMeta = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("whitespace-nowrap text-[var(--fg-muted)]", className)}
      {...props}
    />
  ),
)
CardMeta.displayName = "CardMeta"

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-heading-lg m-0 font-serif leading-snug font-normal text-[var(--fg-primary)]",
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
      "text-body-md m-0 font-sans leading-relaxed text-[var(--fg-secondary)]",
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
        "mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1",
        "text-mono-sm font-mono text-[var(--fg-muted)]",
        className,
      )}
      {...props}
    />
  ),
)
CardFooter.displayName = "CardFooter"

/** Inline code comment with a dimmed // prefix. Use inside CardFooter. */
const CardComment = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, children, ...props }, ref) => (
    <span ref={ref} className={cn(className)} {...props}>
      <span aria-hidden className="opacity-60">
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
        // no band of its own, like the CodeBlock bar: the card's glow shows through
        "border-b border-[var(--border-subtle)]",
        "text-mono-sm font-mono tracking-[0.08em] text-[var(--fg-secondary)] uppercase",
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
      className={cn("text-mono-md p-4 font-mono leading-relaxed", className)}
      {...props}
    />
  ),
)
CardTerminalBody.displayName = "CardTerminalBody"

export {
  Card,
  cardVariants,
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
export type { CardLabelProps }
