import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import "./window.css"

/**
 * A browser window: three dots, an address, and whatever goes inside. With an `action` (a pin
 * button) the bar is interactive; without one it is decoration and hidden from screen readers.
 */
export function BrowserWindow({
  as: Tag = "div",
  address,
  action,
  className,
  children,
}: {
  as?: "div" | "article"
  address: string
  action?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <Tag className={cn("st-window", className)}>
      <div className="st-window-bar" aria-hidden={action ? undefined : true}>
        <span className="st-window-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span aria-hidden className="st-window-address text-mono-xs font-mono">
          {address}
        </span>
        {action}
      </div>
      {children}
    </Tag>
  )
}
