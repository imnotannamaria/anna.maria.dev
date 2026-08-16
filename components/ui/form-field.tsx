import type { ReactNode } from "react"

/**
 * The label and error treatment shared by the contact form and the admin.
 * Lifted here so there is one copy rather than two that drift.
 */
export function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-mono-xs flex items-center gap-1.5 font-mono tracking-[0.08em] uppercase"
      style={{ color: "var(--fg-muted)" }}
    >
      <span aria-hidden style={{ color: "var(--fg-brand)", fontSize: 9 }}>
        ◆
      </span>
      {children}
      {required && (
        <span aria-hidden style={{ color: "var(--fg-brand)" }}>
          *
        </span>
      )}
    </label>
  )
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <span
      id={id}
      role="alert"
      className="text-mono-sm flex items-center gap-1 font-mono"
      style={{ color: "var(--status-error-fg)" }}
    >
      <span aria-hidden style={{ opacity: 0.7 }}>
        {"// "}
      </span>
      {message}
    </span>
  )
}

/** Label + control + error, in the layout the admin form uses everywhere. */
export function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
}: {
  id: string
  label: ReactNode
  required?: boolean
  error?: string
  hint?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      {children}
      {error ? (
        <FieldError id={`${id}-error`} message={error} />
      ) : hint ? (
        <span className="text-mono-sm font-mono" style={{ color: "var(--fg-muted)" }}>
          {hint}
        </span>
      ) : null}
    </div>
  )
}
