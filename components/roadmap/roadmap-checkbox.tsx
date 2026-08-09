"use client"

/**
 * PROTÓTIPO / DISCOVERY — o checkbox do roadmap.
 *
 * Um `role="checkbox"` de verdade, não um glifo. Três coisas acontecem ao marcar:
 * a caixa enche de brand, o check é *desenhado* (pathLength 0→1, não um opacity),
 * e um anel sai de dentro dela. `useReducedMotion` porque nada disso é CSS — o
 * reset global de prefers-reduced-motion não alcança o que a Motion anima.
 */

import { motion, useReducedMotion, AnimatePresence } from "motion/react"
import { EASE_OUT } from "@/components/ui/reveal"

export function RoadmapCheckbox({
  checked,
  indeterminate = false,
  onChange,
  label,
  size = 20,
}: {
  checked: boolean
  /** "in progress" — traço no meio em vez de check. */
  indeterminate?: boolean
  onChange: () => void
  label: string
  size?: number
}) {
  const reduce = useReducedMotion() ?? false

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate && !checked ? "mixed" : checked}
      onClick={(e) => {
        e.stopPropagation()
        onChange()
      }}
      className="rm-checkbox"
      style={{ width: size, height: size }}
    >
      <span className="sr-only">{label}</span>

      {/* O anel que sai da caixa no instante em que ela é marcada. */}
      <AnimatePresence>
        {checked && !reduce && (
          <motion.span
            key="burst"
            aria-hidden
            className="rm-checkbox-burst"
            initial={{ opacity: 0.55, scale: 0.7 }}
            animate={{ opacity: 0, scale: 2.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          />
        )}
      </AnimatePresence>

      {/* O preenchimento. Cresce do centro, não aparece. */}
      <motion.span
        aria-hidden
        className="rm-checkbox-fill"
        initial={false}
        animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
        transition={
          reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 26, mass: 0.7 }
        }
      />

      <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden className="rm-checkbox-svg">
        {indeterminate && !checked ? (
          <motion.line
            x1="6"
            y1="10"
            x2="14"
            y2="10"
            stroke="var(--fg-brand)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={false}
            animate={{ pathLength: 1, opacity: [0.45, 1, 0.45] }}
            transition={
              reduce
                ? { duration: 0 }
                : { opacity: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } }
            }
          />
        ) : (
          <motion.path
            d="M5.5 10.5 L8.6 13.6 L14.6 6.6"
            fill="none"
            stroke="var(--rm-check-ink)"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
            transition={
              reduce
                ? { duration: 0 }
                : { pathLength: { duration: 0.32, ease: EASE_OUT, delay: checked ? 0.06 : 0 } }
            }
          />
        )}
      </svg>
    </button>
  )
}
