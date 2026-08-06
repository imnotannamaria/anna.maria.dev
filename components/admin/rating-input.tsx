"use client"

import { useRef } from "react"
import { starLabel } from "@/lib/log/stars"

const STARS = [1, 2, 3, 4, 5]

/**
 * Five stars, half values on the left half of each. Clicking the value it already has
 * clears it, since "not rated" has to be reachable.
 *
 * Keyboard: arrows step by 0.5, Home/End jump to the ends, Backspace clears. The group is
 * a radiogroup with a live label, so a screen reader hears "4.5 out of 5" rather than
 * having to count glyphs.
 */
export function RatingInput({
  value,
  onChange,
  id,
}: {
  value: number | null
  onChange: (v: number | null) => void
  id?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  function set(next: number | null) {
    onChange(next === value ? null : next)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const current = value ?? 0
    let next: number | null = null

    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(5, current + 0.5)
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(0.5, current - 0.5)
    else if (e.key === "Home") next = 0.5
    else if (e.key === "End") next = 5
    else if (e.key === "Backspace" || e.key === "Delete") next = null
    else return

    e.preventDefault()
    onChange(next)
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <div
        ref={ref}
        id={id}
        role="radiogroup"
        aria-label="Rating"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="inline-flex items-center rounded outline-none focus-visible:shadow-[0_0_0_3px_var(--bg-surface-brand)]"
      >
        {STARS.map((star) => {
          const filled = (value ?? 0) >= star
          const half = !filled && (value ?? 0) >= star - 0.5

          return (
            <span key={star} className="relative inline-block h-8 w-8">
              {/* Two hit areas per star: left half sets x.5, right half sets x.0 */}
              <button
                type="button"
                aria-label={`${star - 0.5} stars`}
                aria-checked={value === star - 0.5}
                role="radio"
                tabIndex={-1}
                onClick={() => set(star - 0.5)}
                className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-pointer"
              />
              <button
                type="button"
                aria-label={`${star} stars`}
                aria-checked={value === star}
                role="radio"
                tabIndex={-1}
                onClick={() => set(star)}
                className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-pointer"
              />
              {/* An empty star underneath, with a brand one clipped over it. A dedicated
                  half-star glyph exists but does not render in every font. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 grid place-items-center text-[26px] leading-none"
                style={{ color: "var(--border-strong)" }}
              >
                ★
              </span>
              {(filled || half) && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden"
                  style={{ width: half ? "50%" : "100%" }}
                >
                  <span
                    className="grid h-8 w-8 place-items-center text-[26px] leading-none"
                    style={{ color: "var(--fg-brand)" }}
                  >
                    ★
                  </span>
                </span>
              )}
            </span>
          )
        })}
      </div>

      <span className="font-mono text-[11px]" style={{ color: "var(--fg-muted)" }}>
        {starLabel(value)}
      </span>

      {value != null && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="cursor-pointer font-mono text-[11px] underline underline-offset-2"
          style={{ color: "var(--fg-muted)" }}
        >
          clear
        </button>
      )}
    </div>
  )
}
