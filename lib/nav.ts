import { cn } from "./utils"

/**
 * A row in a list of destinations: the labeled Sidebar, the MobileNav's More
 * sheet, a docs menu. The current one is raised, with a card's finish; the
 * rest wait in the muted ink. One place, so every nav marks "you are here"
 * the same way.
 */
export const NAV_ROW_CURRENT = cn(
  "sheen bg-[var(--bg-card-hover)] text-[var(--fg-primary)] shadow-[var(--shadow-card)]",
)

export const NAV_ROW_IDLE = cn(
  "text-[var(--fg-muted)] hover:bg-[var(--bg-hover-soft)] hover:text-[var(--fg-secondary)]",
)
