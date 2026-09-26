// No "use client": this file has no hooks, so server components can use it.
// That is also why the icons come from Phosphor's /dist/ssr entry.
import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr"
import { Slot } from "@radix-ui/react-slot"
import * as React from "react"
import { cn } from "@/lib/utils"

interface ArrowAffordanceProps {
  children: React.ReactNode
  /** Points the arrow up and to the right, for links that leave the site. */
  external?: boolean
}

/**
 * The label, an arrow that travels, and a brand rule that wipes in from the
 * left. It reacts to the nearest `group/arrow`, so a card that is one big link
 * can put this in its footer and have it answer the card's hover.
 */
function ArrowAffordance({ children, external }: ArrowAffordanceProps) {
  const Icon = external ? ArrowUpRightIcon : ArrowRightIcon

  return (
    <span className="relative inline-flex min-h-6 items-center gap-1 py-0.5">
      {children}
      <Icon
        aria-hidden
        data-icon={external ? "arrow-up-right" : "arrow-right"}
        size={12}
        weight="bold"
        className={cn(
          "transition-transform duration-200 ease-[var(--ease-out)]",
          external
            ? "group-hover/arrow:translate-x-0.5 group-hover/arrow:-translate-y-0.5 group-focus-visible/arrow:translate-x-0.5 group-focus-visible/arrow:-translate-y-0.5"
            : "group-hover/arrow:translate-x-1 group-focus-visible/arrow:translate-x-1",
        )}
      />
      <span
        aria-hidden
        data-arrow-rule
        className={cn(
          "absolute inset-x-0 bottom-0 h-px origin-left scale-x-0",
          "bg-[var(--fg-brand)] transition-transform duration-200 ease-[var(--ease-out)]",
          "group-hover/arrow:scale-x-100 group-focus-visible/arrow:scale-x-100",
        )}
      />
    </span>
  )
}

interface ArrowLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  external?: boolean
  /** Render your router's link instead of an `<a>`: `<ArrowLink asChild><Link href="/x">x</Link></ArrowLink>`. */
  asChild?: boolean
}

/** A text link with the arrow affordance. Renders an `<a>`, or your router's link with `asChild`. */
const ArrowLink = React.forwardRef<HTMLAnchorElement, ArrowLinkProps>(
  ({ className, external, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "a"
    const externalProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {}
    const classes = cn(
      "group/arrow inline-flex font-mono text-mono-sm",
      "text-[var(--fg-primary)] transition-colors duration-200",
      "hover:text-[var(--fg-brand-text)] focus-visible:text-[var(--fg-brand-text)] focus-visible:outline-none",
      className,
    )

    // With asChild the child is the anchor, so the affordance goes inside it.
    if (asChild && React.isValidElement<{ children?: React.ReactNode }>(children)) {
      return (
        <Slot ref={ref} className={classes} {...externalProps} {...props}>
          {React.cloneElement(
            children,
            undefined,
            <ArrowAffordance external={external}>{children.props.children}</ArrowAffordance>,
          )}
        </Slot>
      )
    }

    return (
      <Comp ref={ref} className={classes} {...externalProps} {...props}>
        <ArrowAffordance external={external}>{children}</ArrowAffordance>
      </Comp>
    )
  },
)
ArrowLink.displayName = "ArrowLink"

export { ArrowAffordance, ArrowLink }
export type { ArrowAffordanceProps, ArrowLinkProps }
