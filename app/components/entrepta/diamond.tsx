import * as React from "react"
import { cn } from "@/lib/utils"

interface DiamondProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /**
   * A glyph sized to the text beside it, so a number rather than a scale step:
   * 9 beside `text-mono-xs`, 10 beside `text-mono-sm`.
   */
  size?: 9 | 10
}

/** `◆`, the brand mark before a label. Always hidden from screen readers. */
const Diamond = React.forwardRef<HTMLSpanElement, DiamondProps>(
  ({ className, size = 9, style, ...props }, ref) => (
    <span
      ref={ref}
      {...props}
      aria-hidden="true"
      className={cn("shrink-0 leading-none text-[var(--fg-brand)]", className)}
      style={{ fontSize: size, ...style }}
    >
      ◆
    </span>
  ),
)
Diamond.displayName = "Diamond"

export { Diamond }
export type { DiamondProps }
