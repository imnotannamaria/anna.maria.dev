import type { Icon } from "@phosphor-icons/react"
import * as React from "react"
import { cn } from "./utils"

/**
 * An icon prop: a Phosphor component (`icon={RocketLaunchIcon}`) or an element
 * (`icon={<RocketLaunchIcon />}`). A server file passing to a client component
 * has to use the element, since a component function cannot cross that line.
 */
export type IconProp = Icon | React.ReactElement

/** Renders an IconProp at a size, hidden from screen readers. */
export function IconSlot({
  icon,
  size,
  className,
}: {
  icon: IconProp
  size: number
  className?: string
}) {
  if (React.isValidElement(icon)) {
    return (
      <span
        aria-hidden
        className={cn("inline-flex shrink-0 [&_svg]:size-[1em]", className)}
        style={{ fontSize: size }}
      >
        {icon}
      </span>
    )
  }
  const Glyph = icon as Icon
  return <Glyph aria-hidden size={size} weight="bold" className={cn("shrink-0", className)} />
}
