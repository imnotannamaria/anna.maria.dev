import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"
import { type IconProp, IconSlot } from "@/lib/icon"
import { cn } from "@/lib/utils"

/**
 * An icon in a tinted square: a category, an account, a status. Each color is
 * a pair the contrast test measures: the palette at 15% over the card with
 * the glyph in the full color, the brand ink on the brand tint, a status ink on
 * its soft fill. The raw brand is not one of them: on its own tint it falls
 * under 3:1 in marmalade light.
 */
const iconTileVariants = cva("relative inline-grid shrink-0 place-items-center select-none", {
  variants: {
    size: {
      sm: "size-6 rounded-[var(--radius-sm)]",
      md: "size-8 rounded-[var(--radius-sm)]",
      lg: "size-10 rounded-[var(--radius-md)]",
    },
    color: {
      neutral: "bg-[var(--bg-hover-strong)] text-[var(--fg-secondary)]",
      brand: "bg-[var(--bg-surface-brand)] text-[var(--fg-brand-text)]",
      success: "bg-[var(--status-success-soft)] text-[var(--status-success-fg)]",
      warning: "bg-[var(--status-warning-soft)] text-[var(--status-warning-fg)]",
      error: "bg-[var(--status-error-soft)] text-[var(--status-error-fg)]",
      info: "bg-[var(--status-info-soft)] text-[var(--status-info-fg)]",
      "chart-1": "bg-[color-mix(in_srgb,var(--chart-1)_15%,var(--bg-card))] text-[var(--chart-1)]",
      "chart-2": "bg-[color-mix(in_srgb,var(--chart-2)_15%,var(--bg-card))] text-[var(--chart-2)]",
      "chart-3": "bg-[color-mix(in_srgb,var(--chart-3)_15%,var(--bg-card))] text-[var(--chart-3)]",
      "chart-4": "bg-[color-mix(in_srgb,var(--chart-4)_15%,var(--bg-card))] text-[var(--chart-4)]",
      "chart-5": "bg-[color-mix(in_srgb,var(--chart-5)_15%,var(--bg-card))] text-[var(--chart-5)]",
      "chart-6": "bg-[color-mix(in_srgb,var(--chart-6)_15%,var(--bg-card))] text-[var(--chart-6)]",
      "chart-7": "bg-[color-mix(in_srgb,var(--chart-7)_15%,var(--bg-card))] text-[var(--chart-7)]",
      "chart-8": "bg-[color-mix(in_srgb,var(--chart-8)_15%,var(--bg-card))] text-[var(--chart-8)]",
    },
  },
  defaultVariants: { size: "md", color: "neutral" },
})

const ICON_SIZE = { sm: 13, md: 16, lg: 20 } as const
const BADGE_SIZE = { sm: "size-3", md: "size-3.5", lg: "size-4" } as const

type IconTileColor = NonNullable<VariantProps<typeof iconTileVariants>["color"]>

interface IconTileProps
  extends
    Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof iconTileVariants> {
  icon: IconProp
  /**
   * Something small in the corner, cut out of the surface, such as the bank
   * behind an account. It inherits the tile's size.
   */
  badge?: React.ReactNode
}

/**
 * Lets a row be recognized before it is read. Hidden from screen readers,
 * since the row's text already names it; give it an `aria-label` when it
 * stands alone.
 */
const IconTile = React.forwardRef<HTMLSpanElement, IconTileProps>(
  ({ icon, badge, size, color, className, "aria-label": label, ...props }, ref) => (
    <span
      ref={ref}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(iconTileVariants({ size, color }), className)}
      {...props}
    >
      <IconSlot icon={icon} size={ICON_SIZE[size ?? "md"]} />
      {badge ? (
        <span
          className={cn(
            "absolute -right-1 -bottom-1 grid place-items-center overflow-hidden rounded-full",
            "ring-2 ring-[var(--cutout,var(--bg-canvas))] [&>*]:size-full",
            BADGE_SIZE[size ?? "md"],
          )}
        >
          {badge}
        </span>
      ) : null}
    </span>
  ),
)
IconTile.displayName = "IconTile"

export { IconTile, iconTileVariants }
export type { IconTileColor, IconTileProps }
