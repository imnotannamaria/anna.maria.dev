"use client"

import { motion, useInView, useReducedMotion } from "motion/react"
import * as React from "react"
import { revealViewport } from "@/lib/motion"

/**
 * Pointer handlers for a counter that rolls a full turn on hover.
 *
 * The entrance delay is spent once. Left on the transition, every hover would
 * wait it out again, so an interrupted spring sits parked between two digits
 * and reads as frozen. Spread `handlers` on the hit area and pass `cycle` and
 * `delay` to RollingNumber.
 */
function useRollOnHover(entranceDelay = 0) {
  const [cycle, setCycle] = React.useState(0)
  const [touched, setTouched] = React.useState(false)

  return {
    cycle,
    delay: touched ? 0 : entranceDelay,
    handlers: {
      onMouseEnter: () => {
        setTouched(true)
        setCycle(1)
      },
      onMouseLeave: () => setCycle(0),
    },
  }
}

/**
 * One decimal place: a strip of 0 to 9 printed twice. Digit `d` rests at both
 * `d` and `d + 10`, so the strip can travel a full turn and land on the same
 * number without a cut.
 */
function Digit({
  digit,
  cycle,
  delay,
  height,
  shown,
}: {
  digit: number
  cycle: number
  delay: number
  height: number
  shown: boolean
}) {
  const reduce = useReducedMotion() ?? false

  return (
    <span aria-hidden style={{ display: "block", height, overflow: "hidden", width: "0.62em" }}>
      <motion.span
        style={{ display: "block" }}
        initial={{ y: 0 }}
        // rests on 0 until the number is on screen, so the roll is seen, not spent offscreen
        animate={{ y: shown ? -(digit + cycle * 10) * height : 0 }}
        transition={
          reduce
            ? { duration: 0 }
            : { type: "spring", stiffness: 90, damping: 16, mass: 0.9, delay }
        }
      >
        {Array.from({ length: 20 }, (_, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: a fixed strip that never reorders
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

interface RollingNumberProps {
  /** A whole number. Any character that is not a digit, such as a comma, stays still. */
  value: number | string
  /** Change it to send every strip round another full turn. */
  cycle?: number
  /** Seconds before the entrance. Set it to 0 once the user has interacted. */
  delay?: number
  /** Height of one digit in px. Match it to the font size. */
  height?: number
  className?: string
  style?: React.CSSProperties
}

/**
 * A number that rolls into place like an odometer, once, when it comes on
 * screen. The real value is in an sr-only copy.
 */
function RollingNumber({
  value,
  cycle = 0,
  delay = 0,
  height = 34,
  className,
  style,
}: RollingNumberProps) {
  const chars = Array.from(String(value))
  const ref = React.useRef<HTMLSpanElement>(null)
  const shown = useInView(ref, revealViewport)
  let digitIndex = 0

  return (
    <span
      ref={ref}
      data-in-view={shown || undefined}
      className={className}
      style={{ display: "flex", ...style }}
    >
      <span className="sr-only">{value}</span>
      {chars.map((char, i) => {
        if (!/[0-9]/.test(char)) {
          return (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: characters of a formatted number
              key={i}
              aria-hidden
              style={{ display: "block", height, lineHeight: `${height}px` }}
            >
              {char}
            </span>
          )
        }
        const order = digitIndex++
        return (
          <Digit
            // biome-ignore lint/suspicious/noArrayIndexKey: characters of a formatted number
            key={i}
            digit={Number(char)}
            cycle={cycle}
            delay={delay + order * 0.06}
            height={height}
            shown={shown}
          />
        )
      })}
    </span>
  )
}

export { RollingNumber, useRollOnHover }
export type { RollingNumberProps }
