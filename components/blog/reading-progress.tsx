"use client"

import { useEffect, useState } from "react"

/**
 * Thin brand progress bar pinned to the top of the viewport. The scrolling
 * element in this app is <main> (the layout grid gives it overflow-y: auto),
 * not the document — so we listen on that container, falling back to the window.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const main = document.querySelector("main")
    const target: HTMLElement | Window = main ?? window

    const update = () => {
      const el = main ?? document.documentElement
      const total = el.scrollHeight - el.clientHeight
      setProgress(total > 0 ? (el.scrollTop / total) * 100 : 0)
    }

    update()
    target.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      target.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  return (
    <div
      className="fixed top-0 left-0 z-[60] h-[2px] transition-[width] duration-75"
      style={{ width: `${progress}%`, background: "var(--fg-brand)" }}
      aria-hidden="true"
    />
  )
}
