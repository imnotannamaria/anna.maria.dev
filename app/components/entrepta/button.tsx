import { CircleNotchIcon } from "@phosphor-icons/react/dist/ssr"
import { Slot } from "@radix-ui/react-slot"
import * as React from "react"
import { cn } from "@/lib/utils"
import { type ButtonVariantProps, buttonVariants } from "./button-variants"

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
    // Slot takes exactly one element, the caller's, so the label wrapper and the
    // spinner stay out of it. A link cannot be disabled, so `loading` does not apply.
    if (asChild) {
      return (
        <Slot ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props}>
          {children}
        </Slot>
      )
    }
    return (
      <button
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
            <CircleNotchIcon className="animate-spin" size={14} />
          </span>
        )}
      </button>
    )
  },
)
Button.displayName = "Button"

export { Button }
export { buttonVariants } from "./button-variants"
