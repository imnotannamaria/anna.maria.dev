import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import "./page-header.css"

/** The top of a page: the label with its icon (and a count, on a list), and a serif line under it. */
export function PageHeader({
  icon,
  label,
  count,
  children,
}: {
  icon: ReactNode

  label: ReactNode
  count?: number | string
  children?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-4">
      <PageLabel icon={icon} label={label} count={count} />
      {children ? <Lede>{children}</Lede> : null}
    </header>
  )
}

/** The serif line under a page's title. `as="div"` when it holds paragraphs of its own. */
export function Lede({
  as: Tag = "p",
  className,
  children,
}: {
  as?: "p" | "div"
  className?: string
  children: ReactNode
}) {
  return <Tag className={cn("st-lede font-serif", className)}>{children}</Tag>
}

/** The label on its own, for a page whose header has a layout of its own. */
export function PageLabel({
  icon,
  label,
  count,
}: {
  icon: ReactNode
  label: ReactNode
  count?: number | string
}) {
  return (
    <h1 className="text-mono-sm flex items-center gap-2 font-mono tracking-[0.08em] text-[var(--fg-secondary)] uppercase">
      <span className="text-[var(--fg-brand)]">{icon}</span>
      {label}
      {count === undefined ? null : <span className="text-[var(--fg-muted)]">· {count}</span>}
    </h1>
  )
}
