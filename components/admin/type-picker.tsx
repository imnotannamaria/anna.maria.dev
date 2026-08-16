"use client"

import { CaretDownIcon } from "@phosphor-icons/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/app/components/entrepta/dropdown"
import { LOG_TYPES, TYPE_LABEL, type LogType } from "@/lib/log/validation"

/**
 * The entrepta dropdown rather than a native `<select>`, so the type field matches the
 * rest of the design system instead of the platform's control.
 *
 * Radix gives it the listbox semantics, roving focus, type-ahead and Escape handling that
 * a native select would have provided.
 */
export function TypePicker({
  value,
  onChange,
  id,
  invalid,
}: {
  value: LogType
  onChange: (v: LogType) => void
  id?: string
  invalid?: boolean
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* aria-invalid is not valid on a button, so the error is announced through
            aria-describedby and shown through the border colour. */}
        <button
          type="button"
          id={id}
          aria-describedby={invalid && id ? `${id}-error` : undefined}
          className={[
            "flex h-10 w-full cursor-pointer items-center justify-between gap-2",
            "rounded-md border bg-(--bg-surface) px-3",
            "text-mono-md font-mono text-(--fg-primary)",
            "transition-all duration-150 ease-out outline-none",
            "hover:border-(--fg-muted)",
            "focus-visible:border-(--fg-brand) focus-visible:shadow-[0_0_0_3px_var(--bg-surface-brand)]",
            "data-[state=open]:border-(--fg-brand)",
          ].join(" ")}
          style={{
            borderColor: invalid ? "var(--status-error)" : "var(--border-strong)",
          }}
        >
          {TYPE_LABEL[value]}
          <CaretDownIcon size={13} aria-hidden style={{ color: "var(--fg-muted)" }} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-(--radix-dropdown-menu-trigger-width)">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as LogType)}>
          {LOG_TYPES.map((t) => (
            <DropdownMenuRadioItem key={t} value={t}>
              {TYPE_LABEL[t]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
