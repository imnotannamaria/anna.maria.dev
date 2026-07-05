import * as React from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "line" | "circle" | "rect"
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "rect", style, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 50%, var(--bg-surface) 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s linear infinite",
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
