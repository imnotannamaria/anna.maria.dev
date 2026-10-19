import type { ReactNode } from "react"
import type { PageId } from "@/components/site/pages"
import { ScreenLink } from "@/components/site/screen-link"

/**
 * A card on the home that is, whole, the link to a page. Its accessible name is its visible text
 * (the label and the tagline): an aria-label that left the tagline out is a name that does not
 * contain what is on the card, which a voice-control user cannot say.
 */
export function Door({
  to,
  className,
  children,
}: {
  to: PageId
  className?: string
  children: ReactNode
}) {
  return (
    <ScreenLink to={to} className={className}>
      {children}
    </ScreenLink>
  )
}
