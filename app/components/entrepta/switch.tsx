"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode
}

/**
 * A real `<input type="checkbox" role="switch">` under the visuals, so focus,
 * keyboard, form submission and screen readers all come from the browser. The
 * track and the knob are `peer-*` styles over it.
 */
const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, disabled, id, ...props }, ref) => {
    const generated = React.useId()
    const inputId = id ?? generated

    return (
      <div className={cn("flex items-center gap-2.5", disabled && "opacity-40", className)}>
        <span className="relative inline-flex shrink-0">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            // biome-ignore lint/a11y/useAriaPropsForRole: a checkbox exposes its checked state on its own
            role="switch"
            disabled={disabled}
            className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            {...props}
          />
          <span
            aria-hidden
            data-switch-track
            className={cn(
              "block h-5 w-9 rounded-full border",
              "border-[var(--border-strong)] bg-[var(--bg-field)]",
              "transition-colors duration-150 ease-out",
              "peer-checked:border-[var(--fg-brand)] peer-checked:bg-[var(--fg-brand)]",
              "peer-focus-visible:shadow-[0_0_0_3px_var(--bg-surface-brand)]",
            )}
          />
          <span
            aria-hidden
            data-switch-thumb
            className={cn(
              "pointer-events-none absolute top-0.5 left-0.5",
              "h-4 w-4 rounded-full bg-[var(--fg-muted)]",
              "transition-transform duration-150 ease-out",
              // the knob sits on the brand fill, so it takes the theme's on-brand ink
              "peer-checked:translate-x-4 peer-checked:bg-[var(--fg-on-brand)]",
            )}
          />
        </span>

        {label && (
          <label
            htmlFor={inputId}
            className="text-mono-md cursor-pointer font-mono text-[var(--fg-secondary)] select-none"
          >
            {label}
          </label>
        )}
      </div>
    )
  },
)
Switch.displayName = "Switch"

export { Switch }
