"use client"

import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import * as React from "react"
import { OVERLAY_SURFACE } from "@/lib/overlay"
import { cn } from "@/lib/utils"
import { Kbd } from "./kbd"

const TooltipProvider = ({
  delayDuration = 200,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>) => (
  <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />
)
TooltipProvider.displayName = "TooltipProvider"

const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 8, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      data-surface="dark"
      className={cn(
        OVERLAY_SURFACE,
        "z-50 inline-flex items-center gap-2 whitespace-nowrap",
        "rounded-[var(--radius-sm)] px-2.5 py-1.5",
        "text-mono-sm font-mono text-[var(--fg-primary)]",
        "motion-pop origin-[var(--radix-tooltip-content-transform-origin)]",
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

const TooltipShortcut = (props: React.HTMLAttributes<HTMLElement>) => <Kbd {...props} />
TooltipShortcut.displayName = "TooltipShortcut"

export { Tooltip, TooltipContent, TooltipProvider, TooltipShortcut, TooltipTrigger }
