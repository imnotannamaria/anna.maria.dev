"use client"

import * as React from "react"
import { Card, type CardProps } from "./card"
import { Spotlight, useSpotlight } from "./spotlight"

interface SpotlightCardProps extends CardProps {
  /** Diameter of the glow in px. */
  glow?: number
}

/**
 * A Card with the brand glow trailing the cursor, for tiles that should feel
 * alive: a dashboard's numbers, a call to action. Everything a Card takes, it
 * takes. A server page can use it as is, since it holds the hook itself.
 */
const SpotlightCard = React.forwardRef<HTMLDivElement, SpotlightCardProps>(
  ({ glow = 640, children, onMouseMove, ...props }, ref) => {
    const { onMouseMove: follow, spotlight } = useSpotlight(glow)
    return (
      <Card
        ref={ref}
        onMouseMove={(event) => {
          follow(event)
          onMouseMove?.(event)
        }}
        {...props}
      >
        <Spotlight {...spotlight} />
        {/* over the glow, laid out like the Card's own children: its gap, and the
            alignment a caller sets on the card, such as justify-center */}
        <div className="relative flex min-w-0 flex-1 flex-col [align-items:inherit] [justify-content:inherit] [gap:inherit]">
          {children}
        </div>
      </Card>
    )
  },
)
SpotlightCard.displayName = "SpotlightCard"

export { SpotlightCard }
export type { SpotlightCardProps }
