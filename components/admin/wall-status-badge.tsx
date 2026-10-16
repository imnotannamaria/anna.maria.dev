import { Badge, type BadgeProps } from "@/app/components/entrepta/badge"
import { STATUS_LABEL } from "@/lib/wall/constants"
import type { StatusKey } from "@/lib/wall/describe"

const COLOR: Record<StatusKey, BadgeProps["color"]> = {
  invited: "warning",
  expired: "neutral",
  submitted: "brand",
  approved: "success",
  rejected: "error",
}

/** Colour and a word, never colour alone. */
export function WallStatusBadge({ status }: { status: StatusKey }) {
  return (
    <Badge dot color={COLOR[status]}>
      {STATUS_LABEL[status]}
    </Badge>
  )
}
