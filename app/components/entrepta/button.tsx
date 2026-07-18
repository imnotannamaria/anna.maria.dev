"use client"

import { Slot } from "@radix-ui/react-slot"
import { Loader2 } from "lucide-react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { buttonVariants, type ButtonVariantProps } from "./button-variants"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariantProps {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, disabled, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        data-loading={loading ? "true" : undefined}
        aria-busy={loading || undefined}
        {...props}
      >
        <span className={cn("inline-flex items-center gap-2", loading && "opacity-0")}>
          {children}
        </span>
        {loading && (
          <span
            aria-hidden
            className="absolute top-1/2 left-1/2 inline-flex -translate-x-1/2 -translate-y-1/2"
          >
            <Loader2 className="animate-spin" style={{ width: 14, height: 14, strokeWidth: 1.5 }} />
          </span>
        )}
      </Comp>
    )
  },
)
Button.displayName = "Button"

export { Button }
export { buttonVariants } from "./button-variants"
