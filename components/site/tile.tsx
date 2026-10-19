import type { ReactElement, ReactNode } from "react"
import { CardHeader, CardLabel, CardMeta, cardVariants } from "@/app/components/entrepta/card"
import { cn } from "@/lib/utils"
import "./tile.css"

/** The card of the new pages: entrepta's Card, dashed and unfilled, with an icon in its label. */

export function Tile({
  label,
  icon,
  note,
  size = "sm",
  bare = false,
  className,
  children,
}: {
  label: string
  icon: ReactElement
  note?: ReactNode
  size?: "sm" | "md"

  bare?: boolean
  className?: string
  children: ReactNode
}) {
  if (bare) {
    return (
      <section className={cn("st-bare", className)}>
        <CardHeader className="justify-center">
          <CardLabel as="h2" icon={icon}>
            {label}
          </CardLabel>
          {note ? <CardMeta>{note}</CardMeta> : null}
        </CardHeader>
        {children}
      </section>
    )
  }

  return (
    <section className={cn(cardVariants({ size: size }), "st-card h-full", className)}>
      <CardHeader>
        <CardLabel as="h2" icon={icon}>
          {label}
        </CardLabel>
        {note ? <CardMeta className="min-w-0 truncate">{note}</CardMeta> : null}
      </CardHeader>
      {children}
    </section>
  )
}

/**
 * A card's classes with the dashed, unfilled surface. For a card that is not a `Tile` but sits
 * among them (a post sheet, a log slip): `tileClass({ size: "sm" }, "my-class")`.
 */
export function tileClass(
  options?: Parameters<typeof cardVariants>[0],
  className?: string,
): string {
  return cn(cardVariants(options), TILE_SURFACE, className)
}

/** The surface alone, for a component that brings its own card (the wristkit rings). */
export const TILE_SURFACE = "st-card"
