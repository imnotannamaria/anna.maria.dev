"use client"

import type { Icon } from "@phosphor-icons/react"
import { motion, useReducedMotion } from "motion/react"
import * as React from "react"
import { EASE_OUT } from "@/lib/motion"
import { cn } from "@/lib/utils"

export interface SidebarItem {
  id: string
  label: string
  href: string
  icon: Icon
}

type LinkComponent = React.ElementType<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  items: readonly SidebarItem[]
  /** The id of the current item. Route matching stays in your project. */
  active?: string
  /** Top of the rail, such as a logo linking home. */
  logo?: React.ReactNode
  /** Your router's link, such as next/link. Defaults to `<a>`. */
  linkComponent?: LinkComponent
  /** Names the nav landmark. */
  label?: string
}

/**
 * A 56px icon rail. The active item's icon fills, and a ◆ travels to it from
 * the last one instead of blinking out and in. Icons grow on hover; the 36px
 * hit area does not, so nothing slides out from under the cursor.
 */
const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  (
    { className, items, active, logo, linkComponent: LinkComp = "a", label = "Primary", ...props },
    ref,
  ) => {
    const reduce = useReducedMotion() ?? false
    const layoutId = React.useId()

    return (
      <aside
        ref={ref}
        className={cn(
          "flex w-14 shrink-0 flex-col items-center gap-1 py-3",
          "border-r border-[var(--border-subtle)] bg-[var(--bg-canvas)]",
          className,
        )}
        {...props}
      >
        {logo && (
          <div className="mb-2 flex h-8 w-8 shrink-0 items-center justify-center">{logo}</div>
        )}
        <nav aria-label={label} className="flex flex-col items-center gap-1">
          {items.map(({ id, label: itemLabel, href, icon: ItemIcon }) => {
            const isActive = id === active
            return (
              <LinkComp
                key={id}
                href={href}
                aria-label={itemLabel}
                title={itemLabel}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group focus-ring relative grid h-9 w-9 place-items-center rounded-[var(--radius-md)]",
                  "transition-colors duration-[var(--motion-fast)]",
                  isActive
                    ? "text-[var(--fg-primary)]"
                    : "text-[var(--fg-muted)] hover:bg-[var(--bg-hover-soft)] hover:text-[var(--fg-primary)]",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId={layoutId}
                    aria-hidden
                    data-sidebar-mark
                    transition={reduce ? { duration: 0 } : { duration: 0.32, ease: EASE_OUT }}
                    className="pointer-events-none absolute top-1/2 -left-2.5 -translate-y-1/2 leading-none text-[var(--fg-brand)]"
                    style={{ fontSize: 10 }}
                  >
                    ◆
                  </motion.span>
                )}
                <ItemIcon
                  aria-hidden
                  size={18}
                  weight={isActive ? "fill" : "regular"}
                  className="transition-transform duration-200 ease-[var(--ease-out)] group-hover:scale-115 group-focus-visible:scale-115"
                />
              </LinkComp>
            )
          })}
        </nav>
      </aside>
    )
  },
)
Sidebar.displayName = "Sidebar"

export { Sidebar }
