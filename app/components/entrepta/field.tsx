import * as React from "react"
import { Diamond } from "./diamond"
import { type IconProp, IconSlot } from "@/lib/icon"
import { cn } from "@/lib/utils"

interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Adds a brand `*`. Put `required` on the control too; the star is only visual. */
  required?: boolean
  /** A Phosphor icon in place of the ◆. */
  icon?: IconProp
}

const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ className, required, icon: LabelIcon, children, ...props }, ref) => (
    // biome-ignore lint/a11y/noLabelWithoutControl: htmlFor arrives through props
    <label
      ref={ref}
      className={cn(
        "flex items-center gap-1.5",
        "text-mono-xs font-mono tracking-[0.08em] text-[var(--fg-muted)] uppercase",
        className,
      )}
      {...props}
    >
      {LabelIcon ? (
        <IconSlot icon={LabelIcon} size={11} className="text-[var(--fg-brand)]" />
      ) : (
        <Diamond />
      )}
      {children}
      {required && (
        <span aria-hidden className="text-[var(--fg-brand)]">
          *
        </span>
      )}
    </label>
  ),
)
FieldLabel.displayName = "FieldLabel"

interface FieldErrorProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Nothing renders without a message. */
  message?: React.ReactNode
}

/** Announced as soon as it appears, with a dimmed `//` in front. */
const FieldError = React.forwardRef<HTMLSpanElement, FieldErrorProps>(
  ({ className, message, ...props }, ref) => {
    if (!message) return null
    return (
      <span
        ref={ref}
        role="alert"
        className={cn(
          "text-mono-sm flex items-center gap-1 font-mono text-[var(--status-error-fg)]",
          className,
        )}
        {...props}
      >
        <span aria-hidden className="opacity-70">
          {"// "}
        </span>
        {message}
      </span>
    )
  },
)
FieldError.displayName = "FieldError"

interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The control's id. The label points at it and the error and hint ids derive from it. */
  id: string
  label: React.ReactNode
  required?: boolean
  /** A Phosphor icon in place of the label's ◆. */
  icon?: IconProp
  error?: React.ReactNode
  hint?: React.ReactNode
  /** One control: Input, Textarea, Switch or a native element. */
  children: React.ReactElement<Record<string, unknown>>
}

/**
 * Label, control and error or hint, in one column. It wires the control for
 * you: `id`, `aria-describedby` pointing at the error or the hint, and
 * `aria-invalid` while there is an error. Props already set on the control win.
 */
const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, id, label, required, icon, error, hint, children, ...props }, ref) => {
    const errorId = `${id}-error`
    const hintId = `${id}-hint`
    const describedBy = error ? errorId : hint ? hintId : undefined

    const control = React.isValidElement(children)
      ? React.cloneElement(children, {
          id: children.props.id ?? id,
          "aria-describedby": children.props["aria-describedby"] ?? describedBy,
          "aria-invalid": children.props["aria-invalid"] ?? (error ? true : undefined),
        })
      : children

    return (
      <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props}>
        <FieldLabel htmlFor={id} required={required} icon={icon}>
          {label}
        </FieldLabel>
        {control}
        {error ? (
          <FieldError id={errorId} message={error} />
        ) : hint ? (
          <span id={hintId} className="text-mono-sm font-mono text-[var(--fg-muted)]">
            {hint}
          </span>
        ) : null}
      </div>
    )
  },
)
Field.displayName = "Field"

export { Field, FieldError, FieldLabel }
export type { FieldErrorProps, FieldLabelProps, FieldProps }
