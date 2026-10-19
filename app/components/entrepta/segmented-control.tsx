"use client"

import * as React from "react"
import { type IconProp, IconSlot } from "@/lib/icon"
import { cn } from "@/lib/utils"

interface SegmentedOption {
  value: string
  label: React.ReactNode
  icon?: IconProp
  disabled?: boolean
}

interface SegmentedControlProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  /** Two to five choices, always visible. More than that wants a Select. */
  options: readonly SegmentedOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  size?: "sm" | "md"
  /** The radio group's name. One is generated if left out. */
  name?: string
  disabled?: boolean
}

const SIZE = {
  sm: { box: "h-7", segment: "px-2 text-mono-xs", icon: 12 },
  md: { box: "h-9", segment: "px-3 text-mono-sm", icon: 14 },
} as const

/**
 * One choice out of a few, all in view: expense or income, 3M, 6M or 12M.
 * Picking one clears the other, unlike a FilterPill. Native radio inputs, so
 * the arrow keys move between them and it takes one Tab stop. Name the group
 * with `aria-label` or `aria-labelledby`.
 */
const SegmentedControl = React.forwardRef<HTMLDivElement, SegmentedControlProps>(
  (
    {
      options,
      value: valueProp,
      defaultValue,
      onValueChange,
      size = "md",
      name: nameProp,
      disabled,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const generated = React.useId()
    const name = nameProp ?? generated
    const [own, setOwn] = React.useState(defaultValue)
    const value = valueProp ?? own
    const active = options.findIndex((option) => option.value === value)

    const select = (next: string) => {
      if (valueProp === undefined) setOwn(next)
      onValueChange?.(next)
    }

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-disabled={disabled || undefined}
        className={cn(
          "relative inline-grid auto-cols-fr grid-flow-col items-stretch",
          "rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-field)] p-0.5",
          SIZE[size].box,
          disabled && "pointer-events-none opacity-40",
          className,
        )}
        style={
          {
            "--segments": options.length,
            "--active": Math.max(active, 0),
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        {/* Equal segments, so the indicator moves by its own width, in CSS alone. */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-y-0.5 left-0.5 w-[calc((100%-4px)/var(--segments))]",
            "translate-x-[calc(var(--active)*100%)]",
            "rounded-[calc(var(--radius-md)-3px)] border border-[var(--border-brand)] bg-[var(--bg-surface-brand)]",
            "transition-[translate,opacity] duration-[var(--motion-base)] ease-[var(--ease-out)]",
            active === -1 && "opacity-0",
          )}
        />
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "relative z-[1] flex min-w-0 cursor-pointer items-center justify-center gap-1.5 select-none",
              "rounded-[calc(var(--radius-md)-3px)] font-mono whitespace-nowrap",
              "text-[var(--fg-secondary)] transition-colors duration-[var(--motion-fast)]",
              "hover:text-[var(--fg-primary)] has-[:checked]:text-[var(--fg-primary)]",
              "has-[:focus-visible]:shadow-[0_0_0_2px_var(--fg-brand)]",
              "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-40",
              SIZE[size].segment,
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              disabled={disabled || option.disabled}
              onChange={() => select(option.value)}
              className="sr-only"
            />
            {option.icon ? <IconSlot icon={option.icon} size={SIZE[size].icon} /> : null}
            <span className="truncate">{option.label}</span>
          </label>
        ))}
      </div>
    )
  },
)
SegmentedControl.displayName = "SegmentedControl"

export { SegmentedControl }
export type { SegmentedControlProps, SegmentedOption }
