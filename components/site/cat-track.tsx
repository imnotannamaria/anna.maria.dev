"use client"

import type { Icon } from "@phosphor-icons/react"
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { Cat, CatStopping, CatWalking } from "@/components/site/abimaela/abimaela"
import "./cat-track.css"

export type Stop = {
  id: string
  label: string
  Icon: Icon
  /** What she says under the label when she is at this stop. */
  say?: ReactNode
}

/**
 * A row of signs with Abimaela walking between them: the footer's "where to next", and the
 * steps of an invite.
 *
 * She walks to `value` whenever it changes, and, with `hoverWalks`, to whatever sign the pointer
 * or the focus is on. The walk is a CSS transition on her position. Its length grows with the
 * distance (so many ms per sign, between a floor and a ceiling), and the timing is close to
 * linear on purpose: an ease-out tail kept her legs moving while she was already standing still.
 * When she arrives she plays the stopping frame for a moment, then sits.
 */
const PER_SIGN = 560
const MIN = 560
const MAX = 2400
const STOP = 220

export function CatTrack({
  stops,
  value,
  current,
  hoverWalks = false,
  canPick = () => true,
  onPick,
  pickLabel = (stop) => stop.label,
}: {
  stops: Stop[]
  /** The stop she should be at. */
  value: number
  /** The stop that is "here" for the reader: marked for assistive tech, and not a target. */
  current?: number
  hoverWalks?: boolean
  /** Whether a sign can be chosen. A sign that cannot is drawn, but is not a button. */
  canPick?: (index: number) => boolean
  onPick?: (index: number) => void
  /** The accessible name of a sign that can be chosen. */
  pickLabel?: (stop: Stop, index: number) => string
}) {
  const [at, setAt] = useState(value)
  const [looking, setLooking] = useState<"left" | "right">("right")
  // how long the walk under way takes; 0 when she is standing
  const [trip, setTrip] = useState(0)
  const [stopping, setStopping] = useState(false)
  const fallback = useRef<ReturnType<typeof setTimeout>>(undefined)
  const sit = useRef<ReturnType<typeof setTimeout>>(undefined)
  const stop = stops[at]
  const center = (at + 0.5) / stops.length

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
    if (to === at) return
    const duration = Math.min(Math.max(Math.abs(to - at) * PER_SIGN, MIN), MAX)
    setLooking(to < at ? "left" : "right")
    setAt(to)
    setTrip(duration)
    setStopping(false)
    clearTimeout(sit.current)
    clearTimeout(fallback.current)
    // a transition that never ends (a hidden tab, reduced motion) still gets her seated
    fallback.current = setTimeout(arrive, duration + 120)
  }

  // follow the stop she is sent to
  const sent = useRef(value)
  useEffect(() => {
    if (sent.current === value) return
    sent.current = value
    walk(value)
    // `walk` reads the latest state by closure; only a new `value` should start a walk
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div className="st-track" style={{ "--n": stops.length } as CSSProperties}>
      <div className="st-track-ground" aria-hidden>
        <div
          className="st-track-cat"
          style={
            {
              left: `${center * 100}%`,
              ...(trip
                ? {
                    transitionDuration: `${trip}ms`,
                    transitionTimingFunction: "cubic-bezier(0.3, 0.15, 0.7, 0.9)",
                  }
                : null),
              // the bubble leans toward the middle, so it never leaves the track at the ends
              "--offset": `${(0.5 - center) * 150}px`,
            } as CSSProperties
          }
          onTransitionEnd={(event) => {
            if (event.target === event.currentTarget && event.propertyName === "left") arrive()
          }}
        >
          <p key={stop.id} className="st-track-speech text-mono-sm font-mono">
            <strong className="block font-medium">{stop.label}</strong>
            {stop.say ? <span className="text-[var(--fg-secondary)]">{stop.say}</span> : null}
          </p>
          <span data-looking={looking} className="st-track-flip">
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

      <ul className="st-track-plates">
        {stops.map((item, index) => {
          const inner = (
            <>
              <span className="st-track-plate-icon">
                <item.Icon aria-hidden size={18} weight={index === at ? "fill" : "regular"} />
              </span>
              <span className="st-track-plate-name text-mono-xs font-mono">{item.label}</span>
            </>
          )
          return (
            <li key={item.id}>
              {onPick && canPick(index) ? (
                <button
                  type="button"
                  className="st-track-plate focus-ring"
                  aria-current={index === current ? "step" : undefined}
                  aria-label={pickLabel(item, index)}
                  data-target={index === at || undefined}
                  onPointerEnter={hoverWalks ? () => walk(index) : undefined}
                  onFocus={hoverWalks ? () => walk(index) : undefined}
                  onClick={() => onPick(index)}
                >
                  {inner}
                </button>
              ) : (
                <span
                  className="st-track-plate"
                  aria-current={index === current ? "step" : undefined}
                  data-target={index === at || undefined}
                >
                  {inner}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
