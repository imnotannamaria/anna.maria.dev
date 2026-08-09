import Link from "next/link"
import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

/**
 * The label, its arrow, and a brand rule that wipes in from the left.
 *
 * Split out from `ArrowLink` because some cards are a single link end to end —
 * the whole card is the anchor, and the affordance in the footer is a span that
 * has to react to the card's hover rather than its own. Both spellings share
 * the `group/arrow` name, so whoever owns the anchor owns the group.
 */
export function ArrowAffordance({
  children,
  external,
}: {
  children: React.ReactNode
  external?: boolean
}) {
  const Icon = external ? ArrowUpRightIcon : ArrowRightIcon

  return (
    <span className="relative inline-flex min-h-6 items-center gap-1 py-0.5">
      {children}
      <Icon
        aria-hidden
        size={12}
        weight="bold"
        className={cn(
          "transition-transform duration-200 ease-out",
          external
            ? "group-hover/arrow:translate-x-0.5 group-hover/arrow:-translate-y-0.5"
            : "group-hover/arrow:translate-x-1",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 h-px origin-left scale-x-0",
          "bg-(--fg-brand) transition-transform duration-200 ease-out",
          "group-hover/arrow:scale-x-100 group-focus-visible/arrow:scale-x-100",
        )}
      />
    </span>
  )
}

export function ArrowLink({
  href,
  external,
  children,
  className,
}: {
  href: string
  external?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "group/arrow inline-flex font-mono text-xs",
        "text-(--fg-primary) transition-colors duration-200",
        "hover:text-(--fg-brand) focus-visible:text-(--fg-brand) focus-visible:outline-none",
        className,
      )}
    >
      <ArrowAffordance external={external}>{children}</ArrowAffordance>
    </Link>
  )
}
