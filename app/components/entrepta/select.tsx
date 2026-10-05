"use client"

import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react"
import * as SelectPrimitive from "@radix-ui/react-select"
import * as React from "react"
import { MENU_LABEL, MENU_ROW, MENU_SEPARATOR, OVERLAY_SURFACE } from "@/lib/overlay"
import { cn } from "@/lib/utils"
import { fieldTrigger } from "./input"

// What a Field hands its control: the id its label points at, and the ids of
// its error and hint. The root has no DOM of its own, so the trigger takes them.
type FieldWiring = Pick<
  React.HTMLAttributes<HTMLButtonElement>,
  "id" | "aria-describedby" | "aria-invalid"
>

const FieldWiringContext = React.createContext<FieldWiring>({})

interface SelectProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
  id?: string
  "aria-describedby"?: string
  "aria-invalid"?: boolean | "true" | "false"
}

/**
 * A value picked from a short list, in a form. A Dropdown is a menu of
 * actions; this is a field with a value. For a long list, or one to search,
 * use Combobox.
 */
function Select({
  id,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  ...props
}: SelectProps) {
  const wiring = React.useMemo(
    () => ({ id, "aria-describedby": describedBy, "aria-invalid": invalid }),
    [id, describedBy, invalid],
  )
  return (
    <FieldWiringContext.Provider value={wiring}>
      <SelectPrimitive.Root {...props} />
    </FieldWiringContext.Provider>
  )
}

const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    size?: "sm" | "md" | "lg"
    state?: "default" | "error"
  }
>(({ className, children, size, state, ...props }, ref) => {
  const wiring = React.useContext(FieldWiringContext)
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      {...wiring}
      className={cn(
        fieldTrigger({ size, state }),
        "data-[placeholder]:text-[var(--fg-muted)] [&>span]:min-w-0 [&>span]:truncate",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <CaretDownIcon aria-hidden size={14} className="shrink-0 text-[var(--fg-muted)]" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", sideOffset = 6, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      sideOffset={sideOffset}
      className={cn(
        OVERLAY_SURFACE,
        "motion-pop z-50 overflow-hidden rounded-[var(--radius-md)]",
        "origin-[var(--radix-select-content-transform-origin)]",
        position === "popper" &&
          "max-h-[min(320px,var(--radix-select-content-available-height))] w-[var(--radix-select-trigger-width)]",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
    /** A short note on the right, in the muted ink. */
    hint?: React.ReactNode
  }
>(({ className, children, hint, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      MENU_ROW,
      "cursor-default pr-8",
      // the same highlight as every other list of choices: the brand tint
      "data-[highlighted]:bg-[var(--bg-surface-brand)] data-[highlighted]:text-[var(--fg-primary)]",
      "data-[state=checked]:text-[var(--fg-primary)]",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    {hint ? (
      <span className="text-mono-sm ml-auto shrink-0 text-[var(--fg-muted)]">{hint}</span>
    ) : null}
    <SelectPrimitive.ItemIndicator className="absolute right-2.5 inline-flex">
      <CheckIcon aria-hidden size={12} weight="bold" className="text-[var(--fg-brand)]" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
))
SelectItem.displayName = "SelectItem"

const SelectLabel = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label ref={ref} className={cn(MENU_LABEL, className)} {...props} />
))
SelectLabel.displayName = "SelectLabel"

const SelectSeparator = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn(MENU_SEPARATOR, className)} {...props} />
))
SelectSeparator.displayName = "SelectSeparator"

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
export type { SelectProps }
