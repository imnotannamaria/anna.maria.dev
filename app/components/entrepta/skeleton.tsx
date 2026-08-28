import * as React from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "line" | "circle" | "rect"
  /**
   * Seconds to offset this piece's shimmer by, so a card full of them reads as one sweep
   * travelling across it rather than every bar blinking in lockstep. Pass the piece's position
   * in reading order times a small number — `i * 0.06` is the going rate here.
   *
   * Applied negative: a positive delay would hold the piece at the start of the gradient until
   * its turn came, so the top-left of a card sat frozen while the rest moved. A negative one
   * starts it part-way through a cycle it is already in, which is the same wave with nothing
   * ever still.
   */
  delay?: number
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "rect", style, delay = 0, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 50%, var(--bg-surface) 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s linear infinite",
        animationDelay: delay ? `${-delay}s` : undefined,
        ...style,
      }}
      className={cn(
        "block",
        variant === "circle" && "rounded-full",
        variant === "line" && "h-4 w-full rounded-[var(--radius-sm)]",
        variant === "rect" && "rounded-[var(--radius-sm)]",
        className,
      )}
      {...props}
    />
  ),
)
Skeleton.displayName = "Skeleton"

const SkeletonText = ({ lines = 3, className }: { lines?: number; className?: string }) => (
  <div className={cn("flex flex-col gap-2", className)}>
    {Array.from({ length: lines }, (_, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: skeleton lines are stateless, index is safe
      <Skeleton key={i} variant="line" className={i === lines - 1 ? "w-3/4" : "w-full"} />
    ))}
  </div>
)
SkeletonText.displayName = "SkeletonText"

export { Skeleton, SkeletonText }
export type { SkeletonProps }
