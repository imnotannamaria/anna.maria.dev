"use client"

import { motion, useReducedMotion } from "motion/react"

/**
 * A number that rolls into place like an odometer.
 *
 * Each decimal place is a vertical strip of 0–9 printed twice. The repeat is the
 * whole trick: the resting position for digit `d` exists in two places on the
 * strip (`d` and `d + 10`), so you can travel between them and land on the same
 * number having turned a full revolution. That's what lets `cycle` roll up and
 * back down without ever cutting.
 */
function Digit({
  digit,
  cycle,
  delay,
  height,
}: {
  digit: number
  cycle: number
  delay: number
  height: number
}) {
  const reduce = useReducedMotion() ?? false

  return (
    <span aria-hidden style={{ display: "block", height, overflow: "hidden", width: "0.62em" }}>
      <motion.span
        style={{ display: "block" }}
        initial={{ y: 0 }}
        animate={{ y: -(digit + cycle * 10) * height }}
        transition={
          reduce
            ? { duration: 0 }
            : { type: "spring", stiffness: 90, damping: 16, mass: 0.9, delay }
        }
      >
        {Array.from({ length: 20 }, (_, i) => (
          <span
            key={i}
            style={{ display: "block", height, lineHeight: `${height}px`, textAlign: "center" }}
          >
            {i % 10}
          </span>
        ))}
      </motion.span>
    </span>
  )
}

export function RollingNumber({
  value,
  cycle = 0,
  delay = 0,
  height = 34,
  className,
  style,
}: {
  value: number
  /** Flip this to send the strip round another full turn. */
  cycle?: number
  /** Only meant for the entrance. Leave it at 0 once the user has interacted,
   *  or an interrupted spring will sit out the delay before moving again. */
  delay?: number
  /** Line box for one digit. Should match the font size it's rendered at. */
  height?: number
  className?: string
  style?: React.CSSProperties
}) {
  const digits = String(value).split("").map(Number)

  return (
    <span className={className} style={{ display: "flex", ...style }}>
      {/* The strips are aria-hidden, so the real number lives here. */}
      <span className="sr-only">{value}</span>
      {digits.map((d, i) => (
        <Digit key={i} digit={d} cycle={cycle} delay={delay + i * 0.06} height={height} />
      ))}
    </span>
  )
}
