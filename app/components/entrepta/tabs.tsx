"use client"

import type { Icon } from "@phosphor-icons/react"
import { Slot } from "@radix-ui/react-slot"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion, useReducedMotion } from "motion/react"
import * as React from "react"
import { Diamond } from "./diamond"
import { EASE_OUT } from "@/lib/motion"
import { cn } from "@/lib/utils"

/**
 * Editor tabs, in two flavors that look the same:
 *
 * - `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`: Radix tabs that switch a
 *   panel in place.
 * - `TabNav`, `TabNavLink`: a row of links, for tabs that are routes. Which one
 *   is active stays in your project: pass `active`.
 *
 * Both share the scroller that fades only the edge with hidden tabs, one brand
 * underline that travels to the active tab, an icon that fills when active and
 * grows on hover, and a × on the active tab when closing it leads somewhere.
 *
 * `variant="window"` turns either row into the editor's title bar: three window
 * dots first, and `end` as muted meta on the right, hidden below 768px.
 */

type TabIcon = React.ReactNode | Icon

const StripContext = React.createContext<{ value?: string; layoutId: string } | null>(null)

function useStrip() {
  const ctx = React.useContext(StripContext)
  if (!ctx) throw new Error("Tab parts must be used inside Tabs or TabNav")
  return ctx
}

/** Fade an edge of the scroller only when tabs are actually hidden past it. */
function useFadeMask(ref: React.RefObject<HTMLElement | null>, deps: unknown[]) {
  const [edges, setEdges] = React.useState({ start: false, end: false })

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure when the tab set changes
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () =>
      setEdges({
        start: el.scrollLeft > 1,
        end: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
      })
    update()
    el.addEventListener("scroll", update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", update)
      ro.disconnect()
    }
  }, deps)

  const start = edges.start ? "28px" : "0px"
  const end = edges.end ? "28px" : "0px"
  const mask = `linear-gradient(to right, transparent 0, #000 ${start}, #000 calc(100% - ${end}), transparent 100%)`
  return { maskImage: mask, WebkitMaskImage: mask } as React.CSSProperties
}

type RowVariant = "strip" | "window"

const rowClass = cn(
  "flex min-h-10 min-w-0 items-stretch select-none",
  "border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]",
)

function WindowDots() {
  return (
    <div
      aria-hidden
      data-window-dots
      className="group/dots flex w-[84px] shrink-0 items-center gap-1.5 border-r border-[var(--border-subtle)] px-3"
    >
      {["--status-error", "--status-warning", "--status-success"].map((tone) => (
        <span
          key={tone}
          className="h-3 w-3 rounded-full opacity-85 transition-[opacity,transform] duration-[var(--motion-fast)] group-hover/dots:scale-110 group-hover/dots:opacity-100"
          style={{ background: `var(${tone})` }}
        />
      ))}
    </div>
  )
}

/** The row around a scroller: window dots, the tabs, `after`, then `end` pinned right. */
function Row({
  variant,
  className,
  after,
  end,
  children,
}: {
  variant: RowVariant
  className?: string
  after?: React.ReactNode
  end?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className={cn(rowClass, className)} data-variant={variant}>
      {variant === "window" && <WindowDots />}
      {children}
      {after}
      {end && (
        <div
          className={cn(
            "ml-auto flex shrink-0 items-stretch",
            variant === "window" &&
              "text-mono-sm hidden items-center gap-4 px-4 font-mono text-[var(--fg-muted)] md:flex",
          )}
        >
          {end}
        </div>
      )}
    </div>
  )
}

const scrollerClass = cn(
  "flex min-w-0 items-stretch overflow-x-auto",
  "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
)

function tabLabelClass(active: boolean, closable: boolean) {
  return cn(
    "inline-flex h-full items-center gap-2 pl-3 sm:pl-4 font-mono text-mono-sm",
    closable ? "pr-1.5" : "pr-3 sm:pr-4",
    "transition-colors duration-[var(--motion-fast)]",
    // the tab fills the row, so the ring goes inside it
    "focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--fg-brand)]",
    "disabled:cursor-not-allowed disabled:opacity-40",
    active
      ? "text-[var(--fg-primary)]"
      : "text-[var(--fg-muted)] hover:text-[var(--fg-secondary)] cursor-pointer",
  )
}

function TabGlyph({ icon, active }: { icon?: TabIcon; active: boolean }) {
  if (!icon) {
    return <Diamond className={cn("transition-colors", !active && "text-transparent")} />
  }
  if (React.isValidElement(icon)) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 transition-transform duration-200 ease-[var(--ease-out)] group-hover:scale-115 group-has-[:focus-visible]:scale-115",
          active ? "text-[var(--fg-brand)]" : "text-inherit",
        )}
      >
        {icon}
      </span>
    )
  }
  const Glyph = icon as Icon
  return (
    <Glyph
      aria-hidden
      size={15}
      weight={active ? "fill" : "regular"}
      className={cn(
        "shrink-0 transition-transform duration-200 ease-[var(--ease-out)] group-hover:scale-115 group-has-[:focus-visible]:scale-115",
        active && "text-[var(--fg-brand)]",
      )}
    />
  )
}

/** The per-tab box: hover, divider, active surface, the travelling underline and the ×. */
function TabShell({
  active,
  onClose,
  closeLabel,
  children,
}: {
  active: boolean
  onClose?: () => void
  closeLabel: string
  children: React.ReactNode
}) {
  const { layoutId } = useStrip()
  const reduce = useReducedMotion() ?? false
  const closable = active && Boolean(onClose)

  return (
    <div
      data-state={active ? "active" : "inactive"}
      className={cn(
        "group relative inline-flex h-full shrink-0 items-center border-r border-[var(--border-subtle)]",
        "transition-colors duration-150",
        // the active tab glows up from its underline, the brand rising into the surface
        active
          ? "bg-[var(--bg-card)] bg-[linear-gradient(to_top,color-mix(in_srgb,var(--fg-brand)_12%,transparent),transparent_80%)]"
          : "hover:bg-[var(--bg-hover-soft)]",
      )}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          aria-hidden
          data-tab-underline
          transition={reduce ? { duration: 0 } : { duration: 0.32, ease: EASE_OUT }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[var(--fg-brand)]"
        />
      )}
      {children}
      {closable && (
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className={cn(
            "focus-ring mr-1.5 inline-grid h-6 w-6 shrink-0 cursor-pointer place-items-center",
            "text-mono-sm rounded-[var(--radius-sm)] font-mono text-[var(--fg-muted)] opacity-60",
            "transition-[opacity,background-color] hover:bg-[var(--bg-hover-strong)] hover:opacity-100",
          )}
        >
          <span aria-hidden>×</span>
        </button>
      )}
    </div>
  )
}

function closeLabelFor(children: React.ReactNode) {
  return typeof children === "string" ? `Close ${children}` : "Close tab"
}

/* ------------------------------------------------------------------ */
/* Tabs that switch a panel in place                                   */
/* ------------------------------------------------------------------ */

const Tabs = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ value: valueProp, defaultValue, onValueChange, ...props }, ref) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const value = valueProp ?? uncontrolled
  const layoutId = React.useId()

  const handleChange = (next: string) => {
    if (valueProp === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  return (
    <StripContext.Provider value={{ value, layoutId }}>
      <TabsPrimitive.Root ref={ref} value={value} onValueChange={handleChange} {...props} />
    </StripContext.Provider>
  )
})
Tabs.displayName = "Tabs"

interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  /** `window` adds the window dots and styles `end` as title bar meta. */
  variant?: RowVariant
  /** Right after the last tab, outside the scroller, such as a `+` button. */
  after?: React.ReactNode
  /** Pinned to the far end of the row, outside the scroller. */
  end?: React.ReactNode
}

const TabsList = React.forwardRef<React.ComponentRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className, style, variant = "strip", after, end, children, ...props }, ref) => {
    const innerRef = React.useRef<HTMLDivElement>(null)
    React.useImperativeHandle(ref, () => innerRef.current as HTMLDivElement)
    const count = React.Children.count(children)
    const mask = useFadeMask(innerRef, [count])

    return (
      <Row variant={variant} className={className} after={after} end={end}>
        <TabsPrimitive.List
          ref={innerRef}
          className={scrollerClass}
          style={{ ...mask, ...style }}
          {...props}
        >
          {children}
        </TabsPrimitive.List>
      </Row>
    )
  },
)
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  /** An element, or a Phosphor icon component, which fills when active. Defaults to a ◆. */
  icon?: TabIcon
  /** Shows a × on the active tab. */
  onClose?: () => void
  /** Accessible name for the ×. Defaults to "Close {label}". */
  closeLabel?: string
}

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, value, icon, onClose, closeLabel, children, ...props }, ref) => {
  const { value: current } = useStrip()
  const active = current === value

  return (
    <TabShell active={active} onClose={onClose} closeLabel={closeLabel ?? closeLabelFor(children)}>
      <TabsPrimitive.Trigger
        ref={ref}
        value={value}
        className={cn(tabLabelClass(active, active && Boolean(onClose)), className)}
        {...props}
      >
        <TabGlyph icon={icon} active={active} />
        {/* with an icon, phones show only the active tab's name */}
        <span className={cn(icon && !active && "hidden sm:inline")}>{children}</span>
      </TabsPrimitive.Trigger>
    </TabShell>
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "rounded-[var(--radius-sm)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)] focus-visible:outline-none",
      className,
    )}
    {...props}
  />
))
TabsContent.displayName = "TabsContent"

/* ------------------------------------------------------------------ */
/* Tabs that are routes                                                */
/* ------------------------------------------------------------------ */

interface TabNavProps extends React.HTMLAttributes<HTMLElement> {
  /** Names the landmark: "Pages". */
  "aria-label": string
  /** `window` adds the window dots and styles `end` as title bar meta. */
  variant?: RowVariant
  after?: React.ReactNode
  end?: React.ReactNode
}

/** A `<nav>` of route tabs. With `variant="window"`, the editor's title bar. */
const TabNav = React.forwardRef<HTMLElement, TabNavProps>(
  ({ className, style, variant = "strip", after, end, children, ...props }, ref) => {
    const innerRef = React.useRef<HTMLElement>(null)
    React.useImperativeHandle(ref, () => innerRef.current as HTMLElement)
    const layoutId = React.useId()
    const count = React.Children.count(children)
    const mask = useFadeMask(innerRef, [count])

    return (
      <StripContext.Provider value={{ layoutId }}>
        <Row variant={variant} className={className} after={after} end={end}>
          <nav ref={innerRef} className={scrollerClass} style={{ ...mask, ...style }} {...props}>
            {children}
          </nav>
        </Row>
      </StripContext.Provider>
    )
  },
)
TabNav.displayName = "TabNav"

interface TabNavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean
  icon?: TabIcon
  onClose?: () => void
  closeLabel?: string
  /** Render your router's link: `<TabNavLink asChild active><Link href="/">home.tsx</Link></TabNavLink>`. */
  asChild?: boolean
}

/** One route tab. Marked `aria-current="page"` when active. */
const TabNavLink = React.forwardRef<HTMLAnchorElement, TabNavLinkProps>(
  (
    { className, active = false, icon, onClose, closeLabel, asChild = false, children, ...props },
    ref,
  ) => {
    const label =
      asChild && React.isValidElement<{ children?: React.ReactNode }>(children)
        ? children.props.children
        : children
    const inner = (
      <>
        <TabGlyph icon={icon} active={active} />
        <span className={cn(icon && !active && "hidden sm:inline")}>{label}</span>
      </>
    )
    const shared = {
      "aria-current": active ? ("page" as const) : undefined,
      className: cn(tabLabelClass(active, active && Boolean(onClose)), className),
    }

    return (
      <TabShell active={active} onClose={onClose} closeLabel={closeLabel ?? closeLabelFor(label)}>
        {asChild && React.isValidElement(children) ? (
          <Slot ref={ref} {...shared} {...props}>
            {React.cloneElement(children, undefined, inner)}
          </Slot>
        ) : (
          <a ref={ref} {...shared} {...props}>
            {inner}
          </a>
        )}
      </TabShell>
    )
  },
)
TabNavLink.displayName = "TabNavLink"

export { TabNav, TabNavLink, Tabs, TabsContent, TabsList, TabsTrigger }
export type { TabNavLinkProps, TabNavProps, TabsListProps, TabsTriggerProps }
