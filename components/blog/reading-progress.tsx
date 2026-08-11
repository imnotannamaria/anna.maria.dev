"use client"

import { useEffect, useRef } from "react"

/**
 * Thin brand progress bar pinned to the top of the viewport. The scrolling element in this
 * app is <main> (the layout grid gives it overflow-y: auto), not the document — so we listen
 * on that container, falling back to the window.
 *
 * Nothing here goes through React state. The first version called `setProgress` on every
 * scroll event and animated `width`, which is a render plus a layout plus a paint for each
 * one — on the page where the user is, by definition, scrolling continuously. This writes
 * `scaleX` straight to the node from a rAF, so a scroll costs one composited transform and
 * no React work at all.
 *
 * `transform-origin: left` and a full-width bar, because scaling is the whole point: `width`
 * reflows the page, a transform does not.
 */
export function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const main = document.querySelector("main")
    const target: HTMLElement | Window = main ?? window
    let frame = 0

    const paint = () => {
      frame = 0
      const el = main ?? document.documentElement
      const total = el.scrollHeight - el.clientHeight
      const ratio = total > 0 ? el.scrollTop / total : 0
      if (bar.current) bar.current.style.transform = `scaleX(${Math.min(Math.max(ratio, 0), 1)})`
    }

    // Coalesce: several scroll events inside one frame paint once.
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(paint)
    }

    paint()
    target.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame)
      target.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  return (
    <div
      ref={bar}
      className="fixed top-0 left-0 z-[60] h-[2px] w-full origin-left"
      style={{ background: "var(--fg-brand)", transform: "scaleX(0)" }}
      aria-hidden="true"
    />
  )
}
