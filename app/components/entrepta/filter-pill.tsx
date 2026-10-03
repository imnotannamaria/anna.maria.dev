import type { Icon } from "@phosphor-icons/react"
import { XIcon } from "@phosphor-icons/react/dist/ssr"
import * as React from "react"
import { type IconProp, IconSlot } from "@/lib/icon"
import { cn } from "@/lib/utils"

export interface FilterPillProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  label: React.ReactNode
  /** A tally beside the label. At full contrast: it is information, not decoration. */
  count?: number
  /** A toggle's state. An applied filter, one with `onRemove`, leaves it out. */
  active?: boolean
  /** A Phosphor icon, or an element from a server file. A component fills when the pill is on. */
  icon?: IconProp
  /**
   * Makes it an applied filter, such as "category is Groceries": always on,
   * with a × that calls this. `onClick` then edits the filter.
   */
  onRemove?: () => void
  /** The ×'s name. Defaults to "Remove filter: " and the label, when the label is text. */
  removeLabel?: string
}

const PILL = cn(
  // a long label shortens rather than push the pill past its row
  "inline-flex h-7 max-w-full shrink-0 items-center whitespace-nowrap",
  "rounded-[var(--radius-sm)] border font-mono text-mono-sm",
  "transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out)]",
)

// the border can be the brand; the label needs the tint's own ink
const ON = "border-[var(--fg-brand)] bg-[var(--bg-surface-brand)] text-[var(--fg-brand-text)]"

// Inside the pill's border a ring outside would sit on the tint, so it goes in.
const INNER_FOCUS = "outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--fg-brand)]"

function Content({
  label,
  count,
  on,
  icon,
}: Pick<FilterPillProps, "label" | "count" | "icon"> & { on: boolean }) {
  return (
    <>
      {icon ? <PillIcon icon={icon} on={on} /> : null}
      <span className="min-w-0 truncate">{label}</span>
      {count != null && (
        <span
          className={cn(
            "rounded-full px-1.5 tabular-nums",
            on ? "bg-[var(--bg-hover-strong)]" : "bg-[var(--bg-surface-elevated)]",
          )}
        >
          {count}
        </span>
      )}
    </>
  )
}

function PillIcon({ icon, on }: { icon: IconProp; on: boolean }) {
  if (React.isValidElement(icon)) return <IconSlot icon={icon} size={12} />
  const Glyph = icon as Icon
  return <Glyph aria-hidden size={12} weight={on ? "fill" : "regular"} className="shrink-0" />
}

/**
 * A toggle for one filter value, announced as pressed or not. Pair it with
 * `useUrlFilter` to keep the choice in the URL. With `onRemove` it is an
 * applied filter instead: always on, with a × named after what it removes.
 */
const FilterPill = React.forwardRef<HTMLButtonElement, FilterPillProps>(
  (
    {
      className,
      label,
      count,
      active = false,
      icon,
      onRemove,
      removeLabel,
      type = "button",
      onClick,
      ...props
    },
    ref,
  ) => {
    if (onRemove) {
      const name =
        removeLabel ?? (typeof label === "string" ? `Remove filter: ${label}` : "Remove filter")
      return (
        <span className={cn(PILL, ON, "gap-0", className)}>
          {onClick ? (
            <button
              ref={ref}
              type={type}
              onClick={onClick}
              className={cn(
                INNER_FOCUS,
                "inline-flex h-full min-w-0 cursor-pointer items-center gap-1.5 pr-1.5 pl-3",
                "rounded-l-[calc(var(--radius-sm)-1px)] hover:bg-[var(--bg-hover-soft)]",
              )}
              {...props}
            >
              <Content label={label} count={count} icon={icon} on />
            </button>
          ) : (
            <span className="inline-flex min-w-0 items-center gap-1.5 pr-1.5 pl-3">
              <Content label={label} count={count} icon={icon} on />
            </span>
          )}
          <button
            type="button"
            aria-label={name}
            onClick={onRemove}
            className={cn(
              INNER_FOCUS,
              "grid h-full w-6 shrink-0 cursor-pointer place-items-center",
              "rounded-r-[calc(var(--radius-sm)-1px)] hover:bg-[var(--bg-hover-strong)]",
              "hover:text-[var(--fg-primary)]",
            )}
          >
            <XIcon aria-hidden size={11} weight="bold" />
          </button>
        </span>
      )
    }

    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={active}
        onClick={onClick}
        className={cn(
          PILL,
          "cursor-pointer gap-1.5 px-3",
          "border-[var(--border-subtle)] bg-transparent text-[var(--fg-muted)]",
          "hover:text-[var(--fg-secondary)]",
          "aria-pressed:border-[var(--fg-brand)] aria-pressed:bg-[var(--bg-surface-brand)]",
          "aria-pressed:text-[var(--fg-brand-text)]",
          "focus-ring",
          className,
        )}
        {...props}
      >
        <Content label={label} count={count} icon={icon} on={active} />
      </button>
    )
  },
)
FilterPill.displayName = "FilterPill"

export { FilterPill }
