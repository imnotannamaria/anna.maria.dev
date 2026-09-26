import * as React from "react"
import { cn } from "@/lib/utils"

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  /** `chip` is a key cap with a border. `plain` is the same text with no box, for rows that already have a surface. */
  variant?: "chip" | "plain"
}

/**
 * A key or a shortcut: `⌘K`, `esc`, `↵`. One look for every keyboard hint, in a
 * menu row, a tooltip, an input or a button. Inside a highlighted menu row it
 * takes the brand ink, through the `group/item` the row sets.
 */
const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, variant = "chip", ...props }, ref) => (
    <kbd
      ref={ref}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-0.5 select-none",
        "font-mono tracking-[0.04em] text-[var(--fg-muted)]",
        variant === "chip" ? "text-mono-xs" : "text-mono-sm",
        "transition-colors group-data-[highlighted]/item:text-[var(--fg-brand-text)] group-data-[selected=true]/item:text-[var(--fg-brand-text)]",
        variant === "chip" &&
          "h-5 min-w-5 rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-1.5",
        className,
      )}
      {...props}
    />
  ),
)
Kbd.displayName = "Kbd"

export { Kbd }
