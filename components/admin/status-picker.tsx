"use client"

import { CaretDownIcon } from "@phosphor-icons/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/app/components/entrepta/dropdown"
import { ROADMAP_STATUSES, STATUS_LABEL, type RoadmapStatus } from "@/lib/roadmap/validation"

/** The same control as TypePicker, for the one field that decides which column an item is in. */
export function StatusPicker({
  value,
  onChange,
  id,
  invalid,
}: {
  value: RoadmapStatus
  onChange: (v: RoadmapStatus) => void
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
          {STATUS_LABEL[value]}
          <CaretDownIcon size={13} aria-hidden style={{ color: "var(--fg-muted)" }} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-(--radix-dropdown-menu-trigger-width)">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as RoadmapStatus)}>
          {ROADMAP_STATUSES.map((s) => (
            <DropdownMenuRadioItem key={s} value={s}>
              {STATUS_LABEL[s]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
