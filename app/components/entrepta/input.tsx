import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr"
import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Kbd } from "./kbd"

/** The Input's frame: the field, its border, focus ring and error state. */
const inputWrapperVariants = cva(
  [
    "flex items-center gap-2 w-full",
    "bg-[var(--bg-field)]",
    "border rounded-[var(--radius-md)]",
    "transition-[border-color,box-shadow] duration-150 ease-out",
    "hover:border-[var(--fg-muted)]",
    "focus-within:border-[var(--fg-brand)] focus-within:shadow-[0_0_0_3px_var(--bg-surface-brand)]",
    "has-[:disabled]:opacity-40 has-[:disabled]:pointer-events-none",
    // an invalid input, such as one a Field marks, looks like the error state
    "has-[[aria-invalid=true]]:border-[var(--status-error)]",
    "has-[[aria-invalid=true]]:focus-within:shadow-[0_0_0_3px_var(--status-error-soft)]",
  ],
  {
    variants: {
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-3",
        lg: "h-12 px-4",
      },
      state: {
        default: "border-[var(--border-strong)]",
        error: [
          "border-[var(--status-error)]",
          "hover:border-[var(--status-error)]",
          "focus-within:border-[var(--status-error)] focus-within:shadow-[0_0_0_3px_var(--status-error-soft)]",
        ],
      },
    },
    defaultVariants: {
      size: "md",
      state: "default",
    },
  },
)

/**
 * The Input's frame on a button that opens a choice: Select, Combobox,
 * DatePicker. A button has no caret to focus within, so its ring shows on
 * focus-visible, and it reads its error from its own aria-invalid.
 */
function fieldTrigger(options: VariantProps<typeof inputWrapperVariants> = {}): string {
  return cn(
    inputWrapperVariants(options),
    "justify-between text-left font-mono text-mono-md text-[var(--fg-primary)] outline-none",
    "focus-visible:border-[var(--fg-brand)] focus-visible:shadow-[0_0_0_3px_var(--bg-surface-brand)]",
    "aria-[invalid=true]:border-[var(--status-error)]",
    "disabled:pointer-events-none disabled:opacity-40",
  )
}

/** The field inside the frame, for a control that shares the Input's look. */
const inputFieldClass = [
  "flex-1 min-w-0 h-full",
  "bg-transparent border-0 appearance-none outline-none",
  "font-mono text-mono-md text-[var(--fg-primary)]",
  "placeholder:text-[var(--fg-muted)]",
  "disabled:cursor-not-allowed",
].join(" ")

export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputWrapperVariants> {
  variant?: "default" | "search" | "command"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = "default", size, state, ...props }, ref) => {
    return (
      <div className={cn(inputWrapperVariants({ size, state }), className)}>
        {variant === "search" && (
          <MagnifyingGlassIcon aria-hidden className="shrink-0 text-[var(--fg-muted)]" size={14} />
        )}
        {variant === "command" && (
          <span
            aria-hidden
            className="shrink-0 font-mono leading-none text-[var(--fg-brand)] select-none"
          >
            $
          </span>
        )}
        <input
          ref={ref}
          aria-invalid={state === "error" || undefined}
          className={inputFieldClass}
          {...props}
        />
        {variant === "command" && <Kbd aria-hidden>⌘K</Kbd>}
      </div>
    )
  },
)
Input.displayName = "Input"

export { Input, fieldTrigger, inputFieldClass, inputWrapperVariants }
