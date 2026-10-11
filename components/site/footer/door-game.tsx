"use client"

import { CatTrack } from "@/components/site/cat-track"
import type { Destination } from "@/components/site/icons"
import type { PageId } from "@/components/site/pages"

/**
 * The footer as a game and as navigation: one sign per page, and the cat walks to the sign you
 * point at. Clicking a sign goes to that page.
 */
export function DoorGame({
  destinations,
  current,
  onGo,
}: {
  destinations: Destination[]
  current: PageId
  onGo: (id: PageId) => void
}) {
  const here = Math.max(
    0,
    destinations.findIndex((destination) => destination.id === current),
  )
  return (
    <CatTrack
      stops={destinations.map((destination, index) => ({
        id: destination.id,
        label: destination.label,
        Icon: destination.Icon,
        say: index === here ? "you are here." : destination.tagline,
      }))}
      value={here}
      current={here}
      hoverWalks
      onPick={(index) => onGo(destinations[index].id)}
      pickLabel={(stop, index) =>
        index === here ? `${stop.label}: you are here` : `Go to ${stop.label}`
      }
    />
  )
}
