import type { ReactNode } from "react"
import type { PageId } from "@/components/site/pages"
import { ScreenLink } from "@/components/site/screen-link"

/** A card on the home that is, whole, the link to a page. `label` is its whole accessible name. */
export function Door({
  to,
  label,
  className,
  children,
}: {
  to: PageId
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <ScreenLink to={to} className={className} aria-label={label}>
      {children}
    </ScreenLink>
  )
}
