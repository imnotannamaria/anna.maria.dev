import * as React from "react"
import { cn } from "@/lib/utils"

export interface SectHeadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "id"> {
  /** The command after the `$`: `ls ./work --featured`. */
  cmd: string
  /** Right side, such as a count or a date. */
  meta?: React.ReactNode
  /** Put on the heading, for an outline or an anchor. */
  id?: string
  /** `h2` by default. `span` when a heading is already above it. */
  as?: "h2" | "h3" | "span"
}

/**
 * The `$ command` rule that opens a section, over a dashed line with meta on
 * the right. The row wraps and each half does not.
 */
const SectHead = React.forwardRef<HTMLDivElement, SectHeadProps>(
  ({ className, cmd, meta, id, as: Label = "h2", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1",
        "border-b border-dashed border-[var(--border-subtle)] pb-3",
        className,
      )}
      {...props}
    >
      <Label
        id={id}
        className="text-mono-sm m-0 font-mono font-normal whitespace-nowrap text-[var(--fg-secondary)]"
      >
        <span aria-hidden className="text-[var(--fg-brand)]">
          ${" "}
        </span>
        {cmd}
      </Label>
      {meta && (
        <span className="text-mono-sm font-mono tracking-[0.08em] whitespace-nowrap text-[var(--fg-muted)] uppercase">
          {meta}
        </span>
      )}
    </div>
  ),
)
SectHead.displayName = "SectHead"

export { SectHead }
