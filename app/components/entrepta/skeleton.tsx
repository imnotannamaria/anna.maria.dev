import * as React from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "line" | "circle" | "rect"
  /**
   * Seconds to offset the shimmer, so a card of pieces reads as one wave
   * instead of blinking in lockstep. Pass the piece's index times a small
   * step, such as `i * 0.06`. Applied as a negative delay, so every piece is
   * already moving on the first frame.
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
          // translucent, like the sweep, so a piece reads on a card, an overlay or a light page
          "linear-gradient(90deg, var(--bg-hover-strong) 0%, color-mix(in srgb, var(--fg-primary) 12%, transparent) 50%, var(--bg-hover-strong) 100%)",
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
