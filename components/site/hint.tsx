import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"
import "./hint.css"

/** A dashed pill that says how something works: "hover to peek, click a folder to pin it". */
export function Hint({
  as: Tag = "p",
  icon,
  className,
  children,
  ...rest
}: { as?: "p" | "li"; icon: ReactNode } & HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={cn("st-hint text-mono-xs font-mono", className)} {...rest}>
      {icon}
      {children}
    </Tag>
  )
}
