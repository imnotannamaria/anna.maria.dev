"use client"

import { motion, useReducedMotion, type Variants } from "motion/react"
import type { CSSProperties } from "react"
import { revealViewport } from "@/lib/motion"
import type { Tech } from "./stack-data"
import { BrandMark } from "./brand-mark"

function angle(name: string): number {
  let sum = 0
  for (const char of name) sum += char.charCodeAt(0)
  return (sum % 13) - 6
}

export function TechStickers({
  techs,
  center = false,
  label,
}: {
  techs: Tech[]

  center?: boolean

  label?: string
}) {
  const reduce = useReducedMotion() ?? false

  const stick: Variants = reduce
    ? { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: 0 } } }
    : {
        hidden: { opacity: 0, scale: 1.25 },
        shown: {
          opacity: 1,
          scale: 1,
          transition: { type: "spring", stiffness: 420, damping: 26 },
        },
      }

  return (
    <motion.ul
      className="st-sk-grid"
      data-center={center || undefined}
      aria-label={label}
      initial="hidden"
      whileInView="shown"
      viewport={revealViewport}
      variants={{
        hidden: {},

        shown: { transition: reduce ? {} : { staggerChildren: 0.045 } },
      }}
    >
      {techs.map((tech) => (
        <motion.li key={tech.name} variants={stick} className="st-sk-item">
          <span
            className="st-sk-sticker"
            style={{ "--tilt": `${angle(tech.name)}deg` } as CSSProperties}
          >
            <BrandMark tech={tech} />
          </span>
          <span className="st-sk-name text-mono-xs font-mono">{tech.name}</span>
        </motion.li>
      ))}
    </motion.ul>
  )
}
