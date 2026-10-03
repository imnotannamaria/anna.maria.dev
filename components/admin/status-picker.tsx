"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/entrepta/select"
import { ROADMAP_STATUSES, STATUS_LABEL, type RoadmapStatus } from "@/lib/roadmap/constants"

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
    <Select
      id={id}
      value={value}
      onValueChange={(v) => onChange(v as RoadmapStatus)}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && id ? `${id}-error` : undefined}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROADMAP_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {STATUS_LABEL[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
