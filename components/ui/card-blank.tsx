import { cn } from "@/lib/utils"

/**
 * The dashed frame a home card shows when it has nothing to draw: empty and error share it
 * and differ only in the line, the way the contributions calendar does.
 *
 * The frame is shared and the size is not. Each caller knows how tall its real content is,
 * and the blank has to hold that height so nothing below it moves when the data arrives or
 * fails, so the height comes in through `className` or `style`.
 *
 * It was a private `Blank` in the log card and again in the roadmap card; the shortlog card
 * would have been the third copy.
 */
export function CardBlank({
  message,
  className,
  style,
}: {
  message: string
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={cn(
        "relative grid place-items-center rounded-[10px] border border-dashed border-[var(--border-subtle)]",
        className,
      )}
      style={style}
    >
      <span className="text-mono-sm font-mono" style={{ color: "var(--fg-muted)" }}>
        {message}
      </span>
    </div>
  )
}
