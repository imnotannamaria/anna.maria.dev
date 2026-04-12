import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  className?: string
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1",
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
        "text-[11px] font-medium tracking-[0.06em] uppercase",
        className,
      )}
    >
      {children}
    </span>
  )
}
