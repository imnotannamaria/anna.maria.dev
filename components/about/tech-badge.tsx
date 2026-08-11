import { Badge } from "@/app/components/entrepta/badge"
import { TECH_ICONS } from "@/lib/stack"

/**
 * A technology pill: entrepta's soft-brand `Badge` with a simple-icons glyph when the map
 * has one, and nothing when it doesn't — see the note in `lib/stack.ts` for why ten of them
 * never will.
 *
 * No `"use client"` on purpose. It has no hooks, so it works from the server page's stack
 * list and from the timeline, which is a client component.
 */
export function TechBadge({ name }: { name: string }) {
  const icon = TECH_ICONS[name]

  return (
    <Badge
      variant="soft"
      color="brand"
      className="h-[26px] cursor-default gap-1.5 border border-transparent px-2.5 transition-[border-color,transform,color] duration-150 hover:-translate-y-px hover:border-[var(--fg-brand)] hover:text-[var(--fg-brand)]"
    >
      {icon && (
        <svg
          viewBox="0 0 24 24"
          width={10}
          height={10}
          fill="currentColor"
          aria-hidden
          style={{ opacity: 0.85, flexShrink: 0 }}
        >
          <path d={icon} />
        </svg>
      )}
      {name}
    </Badge>
  )
}
