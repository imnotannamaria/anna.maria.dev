"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/entrepta/select"
import { LOG_TYPES, TYPE_LABEL, type LogType } from "@/lib/log/constants"

/**
 * entrepta's `Select`: a field with a value, the look of an Input and the rows of every other
 * menu. Radix gives it the listbox semantics, roving focus, type-ahead and Escape handling a
 * native `<select>` would have provided.
 *
 * It used to be a `DropdownMenu` with a hand-drawn trigger imitating the Input, because v2 had
 * no select. A dropdown is a menu of actions; this is a form field, and v3 ships one.
 *
 * The id and the invalid state go on the root, which hands them to the trigger — so the
 * Field's label points at it and the error is announced through `aria-describedby`.
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
    <Select
      id={id}
      value={value}
      onValueChange={(v) => onChange(v as LogType)}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && id ? `${id}-error` : undefined}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LOG_TYPES.map((t) => (
          <SelectItem key={t} value={t}>
            {TYPE_LABEL[t]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
