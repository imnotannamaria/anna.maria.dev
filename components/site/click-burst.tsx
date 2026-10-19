"use client"

import { useEffect, useRef, type CSSProperties } from "react"
import "./click-burst.css"

const LINES = 8

/**
 * A small burst on the screen where a click landed: eight short lines flying out from the
 * point. One listener on the document and one layer over everything, dialogs included; each
 * click adds an element that animates in CSS and takes itself away.
 *
 * Nothing is drawn for someone who asked for less motion, for a right click, or for a click
 * that came from the keyboard, which has no place on the screen to draw at.
 */
export function ClickBurst() {
  const layer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onDown = (event: PointerEvent) => {
      const host = layer.current
      if (!host || event.button !== 0 || calm.matches) return
      const mark = document.createElement("span")
      mark.className = "st-burst"
      mark.style.left = `${event.clientX}px`
      mark.style.top = `${event.clientY}px`
      for (let index = 0; index < LINES; index++) {
        const line = document.createElement("i")
        line.style.setProperty("--turn", `${(360 / LINES) * index}deg`)
        mark.append(line)
      }
      host.append(mark)
      window.setTimeout(() => mark.remove(), 500)
    }
    document.addEventListener("pointerdown", onDown, { passive: true })
    return () => document.removeEventListener("pointerdown", onDown)
  }, [])

  return <div ref={layer} aria-hidden className="st-burst-layer" />
}

/**
 * The same burst as a piece of the page, for a moment that is not a click: the end of a round of
 * the footer's memory game. `scale` makes it bigger, `delay` starts it later, so several can go
 * off in a wave. It plays once on mount; give it a new key to play it again.
 */
export function Burst({ scale = 1, delay = 0 }: { scale?: number; delay?: number }) {
  return (
    <span
      aria-hidden
      className="st-burst"
      style={{ "--burst-scale": scale, "--burst-delay": `${delay}ms` } as CSSProperties}
    >
      {Array.from({ length: LINES }, (_, index) => (
        <i key={index} style={{ "--turn": `${(360 / LINES) * index}deg` } as CSSProperties} />
      ))}
    </span>
  )
}
