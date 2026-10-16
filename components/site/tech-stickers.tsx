"use client"

import { motion, useReducedMotion, type Variants } from "motion/react"
import type { CSSProperties } from "react"
import { revealViewport } from "@/lib/motion"
import { BrandMark, type Tech } from "./brand-mark"
import "./tech-stickers.css"

/** A tilt between -6 and 6 degrees that depends on the name, so it is stable between renders. */
function angle(name: string): number {
  let sum = 0
  for (const char of name) sum += char.charCodeAt(0)
  return (sum % 13) - 6
}

/** Technologies as stickers, each with its name under it. They are stuck on one by one as they enter the screen. */
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
      className="st-techs"
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
        <motion.li key={tech.name} variants={stick} className="st-tech">
          <span
            className="st-tech-sticker"
            style={{ "--tilt": `${angle(tech.name)}deg` } as CSSProperties}
          >
            <BrandMark tech={tech} />
          </span>
          <span className="st-tech-name text-mono-xs font-mono">{tech.name}</span>
        </motion.li>
      ))}
    </motion.ul>
  )
}
