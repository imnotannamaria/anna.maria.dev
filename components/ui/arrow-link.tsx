import Link from "next/link"
// The `/dist/ssr` entry, not the package root. The root is the client build: it calls
// `createContext` at module scope, and this file has no "use client" — so a server
// component importing `ArrowAffordance` used to fail `next build` during route config
// collection with `createContext is not a function`, an error that names no file. Every
// consumer happened to be a client component, so it stayed hidden until /about needed the
// link. Neither export here uses a hook, so the ssr build serves both sides.
import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr"
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
  /** For when the visible label is too generic to stand on its own — two
   *  "github" links on one page need to name what each one points at. */
  "aria-label": ariaLabel,
}: {
  href: string
  external?: boolean
  children: React.ReactNode
  className?: string
  "aria-label"?: string
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "group/arrow text-mono-sm inline-flex font-mono",
        "text-(--fg-primary) transition-colors duration-200",
        "hover:text-(--fg-brand) focus-visible:text-(--fg-brand) focus-visible:outline-none",
        className,
      )}
    >
      <ArrowAffordance external={external}>{children}</ArrowAffordance>
    </Link>
  )
}
