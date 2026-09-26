import { cn } from "./utils"

/**
 * What every overlay is made of, in one place: menus, the command palette,
 * tooltips, dialogs, the theme panel and toasts. Change the finish here and all
 * of them follow. Each component adds its own highlighted state, because Radix,
 * cmdk and plain buttons mark it differently (data-highlighted,
 * data-selected, hover and focus-visible).
 */

/** Near black, the corner glow, a strong border and the overlay shadow. */
export const OVERLAY_SURFACE = cn(
  "sheen border border-[var(--border-strong)] bg-[var(--bg-overlay)]",
  "shadow-[var(--shadow-overlay)]",
)

/** A row in a list of choices. Highlighted, it takes the brand tint. */
export const MENU_ROW = cn(
  "group/item relative flex select-none items-center gap-2.5",
  "rounded-[var(--radius-sm)] px-2.5 py-1.5",
  "font-mono text-mono-md text-[var(--fg-secondary)] outline-none",
  "transition-colors duration-[var(--motion-fast)]",
)

/** A group heading above rows. Put a Diamond or an icon first. */
export const MENU_LABEL = cn(
  "flex items-center gap-1.5 px-2.5 pt-2.5 pb-1.5",
  "font-mono text-mono-xs uppercase tracking-[0.08em] text-[var(--fg-muted)]",
)

/** A rule between groups, edge to edge inside the 4px padding. */
export const MENU_SEPARATOR = "-mx-1 my-1 h-px bg-[var(--border-subtle)]"
