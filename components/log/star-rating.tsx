import { starLabel } from "@/lib/log/stars"

/**
 * Draws the rating with real glyphs instead of the "½" character.
 *
 * A half star is a full star clipped to 50% width over a dimmed one. The dedicated
 * half-star codepoint renders inconsistently across fonts, and "★★★★½" reads as text
 * rather than as a rating.
 *
 * Only `ceil(rating)` stars are drawn, so 3.5 is four glyphs and 4 is four glyphs —
 * matching the design, which never shows empty stars.
 */
export function StarRating({ rating, size = 18 }: { rating: number | null; size?: number }) {
  if (rating == null) return null

  const count = Math.ceil(rating)
  const box = { width: size, height: size, fontSize: size, lineHeight: 1 }

  return (
    <span
      role="img"
      aria-label={starLabel(rating)}
      className="inline-flex items-center"
      style={{ gap: size * 0.06 }}
    >
      {Array.from({ length: count }, (_, i) => {
        const half = i + 1 > rating

        return (
          <span key={i} aria-hidden className="relative inline-block" style={box}>
            <span
              className="absolute inset-0 grid place-items-center"
              style={{ ...box, color: "var(--border-strong)" }}
            >
              ★
            </span>
            <span
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: half ? "50%" : "100%" }}
            >
              <span
                className="grid place-items-center"
                style={{ ...box, color: "var(--fg-brand)" }}
              >
                ★
              </span>
            </span>
          </span>
        )
      })}
    </span>
  )
}
