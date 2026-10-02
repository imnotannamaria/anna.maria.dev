"use client"

import { type Icon, SidebarSimpleIcon } from "@phosphor-icons/react"
import { motion, useReducedMotion } from "motion/react"
import * as React from "react"
import { type IconProp, IconSlot } from "@/lib/icon"
import { EASE_OUT } from "@/lib/motion"
import { NAV_ROW_CURRENT, NAV_ROW_IDLE } from "@/lib/nav"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"

export interface SidebarItem {
  id: string
  label: string
  href: string
  /** Needed in the rail; a labeled sidebar can be text only. The rail falls back to the first letter. */
  icon?: IconProp
}

export interface SidebarGroup {
  /** A small heading over the group. Collapsed, it stays for screen readers only. */
  title?: string
  items: readonly SidebarItem[]
}

type LinkComponent = React.ElementType<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>

/** Content, or a function of the state when it has to fit the 56px rail. */
type SidebarSlot = React.ReactNode | ((state: { collapsed: boolean }) => React.ReactNode)

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** The destinations, in one list. For titled sections pass `groups` instead. */
  items?: readonly SidebarItem[]
  groups?: readonly SidebarGroup[]
  /** The id of the current item. Route matching stays in your project. */
  active?: string
  /** `rail` is icons only. `labeled` adds the labels, group titles, search and footer. */
  variant?: "rail" | "labeled"
  /** Top of the sidebar, such as a logo linking home. */
  logo?: SidebarSlot
  /** Under the logo, in the labeled sidebar only. A search field or a ⌘K button. */
  search?: React.ReactNode
  /** Pinned to the bottom, such as the account menu. */
  footer?: SidebarSlot
  /** A button that folds the labeled sidebar back to the rail. */
  collapsible?: boolean
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  /**
   * Where the choice is kept, in localStorage. It is read after hydration, so a
   * server that knows the choice passes `defaultCollapsed`. `null` keeps nothing.
   */
  storageKey?: string | null
  /** Your router's link, such as next/link. Defaults to `<a>`. */
  linkComponent?: LinkComponent
  /** Names the nav landmark. */
  label?: string
  labels?: { collapse?: string; expand?: string }
}

/**
 * How far a rail tooltip stands off its icon. The icon's 36px target ends 10px short of the
 * rail's edge, so the Tooltip's default 8px put the label on top of the border; 18 clears the
 * border by the same 8.
 *
 * LOCAL EDIT, not in entrepta 3.0.0. It belongs upstream: `add sidebar --overwrite` undoes it.
 */
const RAIL_TOOLTIP_OFFSET = 18

const STORAGE_EVENT = "entrepta:sidebar"

function readStored(key: string): boolean | null {
  try {
    const value = window.localStorage.getItem(key)
    return value === "1" ? true : value === "0" ? false : null
  } catch {
    return null
  }
}

function subscribeStored(onChange: () => void) {
  window.addEventListener("storage", onChange)
  window.addEventListener(STORAGE_EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(STORAGE_EVENT, onChange)
  }
}

const serverStored = () => null

function renderSlot(slot: SidebarSlot, collapsed: boolean) {
  return typeof slot === "function" ? slot({ collapsed }) : slot
}

/**
 * The app's main navigation. As a rail it is 56px of icons, each with its
 * Tooltip; labeled it is 240px with group titles, a search slot and a footer,
 * and `collapsible` folds it back to the rail. The current item sits on a
 * raised row, its icon filled, and a ◆ travels to it from the last one. Icons
 * grow on hover; the hit area does not.
 */
const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  (
    {
      className,
      items,
      groups: groupsProp,
      active,
      variant = "rail",
      logo,
      search,
      footer,
      collapsible = false,
      collapsed: collapsedProp,
      defaultCollapsed = false,
      onCollapsedChange,
      storageKey = "entrepta:sidebar",
      linkComponent: LinkComp = "a",
      label = "Primary",
      labels,
      ...props
    },
    ref,
  ) => {
    const reduce = useReducedMotion() ?? false
    const layoutId = React.useId()
    const navId = React.useId()
    const navRef = React.useRef<HTMLElement>(null)
    const placed = React.useRef(false)

    // The current item stays in view: centered when the page loads, since a
    // reload starts the list at the top, and brought in when it changes and
    // has scrolled out. The list scrolls, never the page.
    // biome-ignore lint/correctness/useExhaustiveDependencies: `active` is the trigger; the effect reads the DOM it produced
    React.useEffect(() => {
      const nav = navRef.current
      const current = nav?.querySelector<HTMLElement>('[aria-current="page"]')
      if (!nav || !current) return
      const box = nav.getBoundingClientRect()
      const item = current.getBoundingClientRect()
      const first = !placed.current
      placed.current = true
      if (item.top >= box.top && item.bottom <= box.bottom) return
      const offset = first
        ? item.top - box.top - (box.height - item.height) / 2
        : item.top < box.top
          ? item.top - box.top - 8
          : item.bottom - box.bottom + 8
      nav.scrollTo({ top: nav.scrollTop + offset, behavior: first || reduce ? "auto" : "smooth" })
    }, [active, reduce])

    const key = collapsible ? storageKey : null
    const readKey = React.useCallback(() => (key ? readStored(key) : null), [key])
    const stored = React.useSyncExternalStore(subscribeStored, readKey, serverStored)
    const [own, setOwn] = React.useState(defaultCollapsed)
    const folded = collapsedProp ?? stored ?? own
    const collapsed = variant === "rail" || (collapsible && folded)

    const setCollapsed = (next: boolean) => {
      if (collapsedProp === undefined) {
        setOwn(next)
        if (key) {
          try {
            window.localStorage.setItem(key, next ? "1" : "0")
          } catch {
            // private mode or blocked storage: the choice lasts this visit
          }
          window.dispatchEvent(new Event(STORAGE_EVENT))
        }
      }
      onCollapsedChange?.(next)
    }

    const groups = groupsProp ?? (items ? [{ items }] : [])
    const toggleLabel = collapsed
      ? (labels?.expand ?? "Expand sidebar")
      : (labels?.collapse ?? "Collapse sidebar")

    const mark = (
      <motion.span
        layoutId={layoutId}
        aria-hidden
        data-sidebar-mark
        transition={reduce ? { duration: 0 } : { duration: 0.32, ease: EASE_OUT }}
        className="pointer-events-none absolute top-1/2 -left-2 -translate-y-1/2 leading-none text-[var(--fg-brand)]"
        style={{ fontSize: 10 }}
      >
        ◆
      </motion.span>
    )

    return (
      <TooltipProvider delayDuration={300}>
        <aside
          ref={ref}
          data-collapsed={collapsed || undefined}
          className={cn(
            "flex shrink-0 flex-col gap-1 py-3",
            "border-r border-[var(--border-subtle)] bg-[var(--bg-canvas)]",
            collapsed ? "w-14 items-center" : "w-60 px-3",
            className,
          )}
          {...props}
        >
          {logo ? (
            <div
              className={cn(
                "mb-2 flex h-8 shrink-0 items-center",
                collapsed ? "w-8 justify-center" : "px-2.5",
              )}
            >
              {renderSlot(logo, collapsed)}
            </div>
          ) : null}
          {search && !collapsed ? <div className="mb-3">{search}</div> : null}

          <nav
            ref={navRef}
            id={navId}
            aria-label={label}
            className={cn(
              // It scrolls, which clips: it spans the sidebar's full width, so the
              // ◆ outside each link and the focus ring stay inside it.
              "flex min-h-0 flex-1 flex-col overflow-y-auto py-1",
              collapsed ? "w-full items-center gap-1" : "-mx-3 gap-5 px-3",
            )}
          >
            {groups.map((group, index) => {
              const titleId = `${navId}-g${index}`
              return (
                <div key={group.title ?? index} className="flex flex-col gap-1">
                  {collapsed && index > 0 ? (
                    <span
                      aria-hidden
                      className="mx-auto my-1.5 h-px w-6 bg-[var(--border-subtle)]"
                    />
                  ) : null}
                  {group.title ? (
                    <div
                      id={titleId}
                      className={cn(
                        collapsed
                          ? "sr-only"
                          : "text-mono-xs mb-1 px-2.5 font-mono tracking-widest text-[var(--fg-muted)] uppercase",
                      )}
                    >
                      {group.title}
                    </div>
                  ) : null}
                  <ul
                    aria-labelledby={group.title ? titleId : undefined}
                    className={cn(
                      "m-0 flex list-none flex-col gap-0.5 p-0",
                      collapsed && "items-center gap-1",
                    )}
                  >
                    {group.items.map((item) => {
                      const isActive = item.id === active
                      const link = (
                        <LinkComp
                          href={item.href}
                          aria-label={collapsed ? item.label : undefined}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "group focus-ring relative flex items-center rounded-[var(--radius-md)]",
                            "transition-colors duration-[var(--motion-fast)]",
                            collapsed
                              ? "size-9 justify-center"
                              : "text-mono-sm h-8 w-full gap-2.5 rounded-[var(--radius-sm)] px-2.5 font-mono",
                            collapsed
                              ? isActive
                                ? "text-[var(--fg-primary)]"
                                : "text-[var(--fg-muted)] hover:bg-[var(--bg-hover-soft)] hover:text-[var(--fg-primary)]"
                              : isActive
                                ? NAV_ROW_CURRENT
                                : NAV_ROW_IDLE,
                          )}
                        >
                          {isActive ? mark : null}
                          {item.icon ? (
                            <ItemIcon
                              icon={item.icon}
                              size={collapsed ? 18 : 16}
                              active={isActive}
                            />
                          ) : collapsed ? (
                            <span aria-hidden className="text-mono-sm font-mono uppercase">
                              {item.label.charAt(0)}
                            </span>
                          ) : null}
                          {collapsed ? null : (
                            <span className="min-w-0 truncate">{item.label}</span>
                          )}
                        </LinkComp>
                      )
                      return (
                        <li key={item.id} className={collapsed ? undefined : "flex"}>
                          {collapsed ? (
                            <Tooltip>
                              <TooltipTrigger asChild>{link}</TooltipTrigger>
                              <TooltipContent side="right" sideOffset={RAIL_TOOLTIP_OFFSET}>
                                {item.label}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            link
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </nav>

          {footer || (collapsible && variant === "labeled") ? (
            <div className={cn("mt-2 flex flex-col gap-1", collapsed && "items-center")}>
              {renderSlot(footer, collapsed)}
              {collapsible && variant === "labeled" ? (
                <CollapseButton
                  collapsed={collapsed}
                  label={toggleLabel}
                  controls={navId}
                  onClick={() => setCollapsed(!collapsed)}
                />
              ) : null}
            </div>
          ) : null}
        </aside>
      </TooltipProvider>
    )
  },
)
Sidebar.displayName = "Sidebar"

function ItemIcon({ icon, size, active }: { icon: IconProp; size: number; active: boolean }) {
  const grow =
    "transition-transform duration-200 ease-[var(--ease-out)] group-hover:scale-115 group-focus-visible:scale-115"
  if (React.isValidElement(icon)) return <IconSlot icon={icon} size={size} className={grow} />
  const Glyph = icon as Icon
  return (
    <Glyph
      aria-hidden
      size={size}
      weight={active ? "fill" : "regular"}
      className={cn("shrink-0", grow)}
    />
  )
}

function CollapseButton({
  collapsed,
  label,
  controls,
  onClick,
}: {
  collapsed: boolean
  label: string
  controls: string
  onClick: () => void
}) {
  const button = (
    <button
      type="button"
      aria-expanded={!collapsed}
      aria-controls={controls}
      aria-label={collapsed ? label : undefined}
      onClick={onClick}
      className={cn(
        "focus-ring flex cursor-pointer items-center text-[var(--fg-muted)]",
        "transition-colors duration-[var(--motion-fast)] hover:bg-[var(--bg-hover-soft)] hover:text-[var(--fg-secondary)]",
        collapsed
          ? "size-9 justify-center rounded-[var(--radius-md)]"
          : "text-mono-sm h-8 w-full gap-2.5 rounded-[var(--radius-sm)] px-2.5 font-mono",
      )}
    >
      <SidebarSimpleIcon aria-hidden size={collapsed ? 18 : 16} className="shrink-0" />
      {collapsed ? null : <span className="truncate">{label}</span>}
    </button>
  )
  if (!collapsed) return button
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={RAIL_TOOLTIP_OFFSET}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

export { Sidebar }
