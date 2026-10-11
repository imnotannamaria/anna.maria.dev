"use client"

import { useEffect, useRef } from "react"
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
