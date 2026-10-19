"use client"

import { DotsThreeIcon, type Icon } from "@phosphor-icons/react"
import { motion, useReducedMotion } from "motion/react"
import * as React from "react"
import { type IconProp, IconSlot } from "@/lib/icon"
import { EASE_OUT } from "@/lib/motion"
import { NAV_ROW_CURRENT, NAV_ROW_IDLE } from "@/lib/nav"
import { cn } from "@/lib/utils"
import { IconTile } from "./icon-tile"
import { Sheet, SheetContent, SheetTrigger } from "./sheet"

export interface MobileNavItem {
  id: string
  label: string
  href: string
  icon: IconProp
}

type LinkComponent = React.ElementType<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>

export interface MobileNavProps extends React.HTMLAttributes<HTMLElement> {
  /** The first four go in the bar. The rest, if any, go in More. */
  items: readonly MobileNavItem[]
  /** The id of the current item. Route matching stays in your project. */
  active?: string
  /** Anything else for the More sheet, under the extra destinations: settings, sign out. */
  more?: React.ReactNode
  /** `fixed` to the bottom of the viewport, or `static` in the flow. */
  position?: "fixed" | "static"
  /** Your router's link, such as next/link. Defaults to `<a>`. */
  linkComponent?: LinkComponent
  /** Names the nav landmark. */
  label?: string
  labels?: { more?: string }
  /** Where the More sheet renders. See SheetContent's `container`. */
  container?: HTMLElement | null
}

const IN_BAR = 4

/**
 * The app's navigation below 768px, where a Sidebar does not fit: up to four
 * destinations in reach of the thumb, and More for the rest in a bottom
 * Sheet. The current one fills its icon and a ◆ travels along the top edge,
 * away from the icon, since some glyphs are not symmetric. It clears
 * the home indicator on phones that have one. Hide it from `md` up.
 */
const MobileNav = React.forwardRef<HTMLElement, MobileNavProps>(
  (
    {
      items,
      active,
      more,
      position = "fixed",
      linkComponent: LinkComp = "a",
      label = "Primary",
      labels,
      container,
      className,
      ...props
    },
    ref,
  ) => {
    const reduce = useReducedMotion() ?? false
    const layoutId = React.useId()
    const [open, setOpen] = React.useState(false)

    const hasMore = items.length > IN_BAR || more != null
    const inBar = hasMore && items.length > IN_BAR ? items.slice(0, IN_BAR) : items
    const overflow = items.slice(inBar.length)
    const moreActive = overflow.some((item) => item.id === active)
    const moreLabel = labels?.more ?? "More"

    const mark = (
      <motion.span
        layoutId={layoutId}
        aria-hidden
        data-mobile-nav-mark
        transition={reduce ? { duration: 0 } : { duration: 0.32, ease: EASE_OUT }}
        className="pointer-events-none absolute top-[-0.5px] left-1/2 -translate-1/2 leading-none text-[var(--fg-brand)]"
        style={{ fontSize: 8 }}
      >
        ◆
      </motion.span>
    )

    const cell = cn(
      "group focus-ring relative flex h-14 w-full flex-col items-center justify-center gap-1 rounded-[var(--radius-md)]",
      "font-mono text-mono-xs transition-colors duration-[var(--motion-fast)]",
    )

    return (
      <nav
        ref={ref}
        aria-label={label}
        className={cn(
          "z-40 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]",
          "px-2 pb-[env(safe-area-inset-bottom)]",
          position === "fixed" && "fixed inset-x-0 bottom-0",
          className,
        )}
        {...props}
      >
        <ul
          className="m-0 grid list-none p-0"
          style={{
            gridTemplateColumns: `repeat(${inBar.length + (hasMore ? 1 : 0)}, minmax(0, 1fr))`,
          }}
        >
          {inBar.map((item) => {
            const isActive = item.id === active
            return (
              <li key={item.id} className="min-w-0">
                <LinkComp
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    cell,
                    isActive
                      ? "text-[var(--fg-primary)]"
                      : "text-[var(--fg-muted)] hover:text-[var(--fg-secondary)]",
                  )}
                >
                  {isActive ? mark : null}
                  <NavIcon icon={item.icon} active={isActive} />
                  <span className="max-w-full truncate px-1">{item.label}</span>
                </LinkComp>
              </li>
            )
          })}
          {hasMore ? (
            <li className="min-w-0">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger
                  className={cn(
                    cell,
                    "cursor-pointer",
                    moreActive
                      ? "text-[var(--fg-primary)]"
                      : "text-[var(--fg-muted)] hover:text-[var(--fg-secondary)]",
                  )}
                >
                  {moreActive ? mark : null}
                  <DotsThreeIcon aria-hidden size={20} weight="bold" className="shrink-0" />
                  <span className="max-w-full truncate px-1">{moreLabel}</span>
                </SheetTrigger>
                <SheetContent side="bottom" title={moreLabel} container={container}>
                  {overflow.length > 0 ? (
                    // a grid of tiles, like the home screen the thumb already knows
                    <ul className="m-0 grid list-none grid-cols-3 gap-2 p-0">
                      {overflow.map((item) => {
                        const isActive = item.id === active
                        return (
                          <li key={item.id}>
                            <LinkComp
                              href={item.href}
                              aria-current={isActive ? "page" : undefined}
                              // not SheetClose: a router's link prevents the click's
                              // default, and SheetClose then stays open
                              onClick={() => setOpen(false)}
                              className={cn(
                                "group focus-ring flex flex-col items-center gap-2 rounded-[var(--radius-md)] px-1 py-3",
                                "text-mono-xs font-mono transition-colors duration-[var(--motion-fast)]",
                                isActive ? NAV_ROW_CURRENT : NAV_ROW_IDLE,
                              )}
                            >
                              <IconTile
                                icon={item.icon}
                                size="lg"
                                color={isActive ? "brand" : "neutral"}
                                className="transition-transform duration-200 ease-[var(--ease-out)] group-hover:scale-105 group-focus-visible:scale-105"
                              />
                              <span className="max-w-full truncate">{item.label}</span>
                            </LinkComp>
                          </li>
                        )
                      })}
                    </ul>
                  ) : null}
                  {more != null ? (
                    <div
                      className={cn(
                        overflow.length > 0 && "mt-4 border-t border-[var(--border-subtle)] pt-4",
                      )}
                    >
                      {more}
                    </div>
                  ) : null}
                </SheetContent>
              </Sheet>
            </li>
          ) : null}
        </ul>
      </nav>
    )
  },
)
MobileNav.displayName = "MobileNav"

function NavIcon({ icon, active, size = 20 }: { icon: IconProp; active: boolean; size?: number }) {
  if (React.isValidElement(icon)) return <IconSlot icon={icon} size={size} />
  const Glyph = icon as Icon
  return <Glyph aria-hidden size={size} weight={active ? "fill" : "regular"} className="shrink-0" />
}

export { MobileNav }
