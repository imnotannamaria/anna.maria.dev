"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { Cat, CatWalking, CatStopping } from "../../abimaela/abimaela"
import type { Destination } from "../icons"
import type { PageId } from "../pages"

const PER_SIGN = 560
const MIN = 560
const MAX = 2400

const STOP = 220
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
  const [where, setWhere] = useState(here)
  const [looking, setLooking] = useState<"left" | "right">("right")

  const [trip, setTrip] = useState(0)

  const [stopping, setStopping] = useState(false)
  const fallback = useRef<ReturnType<typeof setTimeout>>(undefined)
  const sit = useRef<ReturnType<typeof setTimeout>>(undefined)
  const destination = destinations[where]
  const center = (where + 0.5) / destinations.length

  useEffect(
    () => () => {
      clearTimeout(fallback.current)
      clearTimeout(sit.current)
    },
    [],
  )

  const arrive = () => {
    clearTimeout(fallback.current)
    clearTimeout(sit.current)
    setTrip(0)
    setStopping(true)
    sit.current = setTimeout(() => setStopping(false), STOP)
  }
  const walk = (to: number) => {
    if (to === where) return
    const duration = Math.min(Math.max(Math.abs(to - where) * PER_SIGN, MIN), MAX)
    setLooking(to < where ? "left" : "right")
    setWhere(to)
    setTrip(duration)
    setStopping(false)
    clearTimeout(sit.current)
    clearTimeout(fallback.current)
    fallback.current = setTimeout(arrive, duration + 120)
  }

  return (
    <div className="st-ft-path" style={{ "--n": destinations.length } as CSSProperties}>
      <div className="st-ft-ground" aria-hidden>
        <div
          className="st-ft-cat"
          style={
            {
              left: `${center * 100}%`,

              ...(trip
                ? {
                    transitionDuration: `${trip}ms`,
                    transitionTimingFunction: "cubic-bezier(0.3, 0.15, 0.7, 0.9)",
                  }
                : null),

              "--offset": `${(0.5 - center) * 150}px`,
            } as CSSProperties
          }
          onTransitionEnd={(event) => {
            if (event.target === event.currentTarget && event.propertyName === "left") arrive()
          }}
        >
          <p key={destination.id} className="st-ft-speech text-mono-sm font-mono">
            <strong className="block font-medium">{destination.label}</strong>
            <span className="text-[var(--fg-secondary)]">
              {destination.id === current ? "you are here." : destination.tagline}
            </span>
          </p>
          <span data-looking={looking} className="st-ft-flip">
            {trip ? (
              <CatWalking height={70} />
            ) : stopping ? (
              <CatStopping height={78} />
            ) : (
              <Cat height={64} />
            )}
          </span>
        </div>
      </div>

      <ul className="st-ft-plates">
        {destinations.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              className="st-ft-plate focus-ring"
              aria-current={item.id === current ? "page" : undefined}
              aria-label={
                item.id === current ? `${item.label}: you are here` : `Go to ${item.label}`
              }
              data-target={index === where || undefined}
              onPointerEnter={() => walk(index)}
              onFocus={() => walk(index)}
              onClick={() => onGo(item.id)}
            >
              <span className="st-ft-plate-icon">
                <item.Icon aria-hidden size={18} weight={index === where ? "fill" : "regular"} />
              </span>
              <span className="st-ft-plate-name text-mono-xs font-mono">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
