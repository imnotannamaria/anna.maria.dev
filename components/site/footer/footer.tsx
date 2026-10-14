"use client"

import { PawPrintIcon, SignpostIcon } from "@phosphor-icons/react"
import { motion, useReducedMotion } from "motion/react"
import { useTranslations } from "next-intl"
import { Tile } from "@/components/site/tile"
import type { PageId } from "@/components/site/pages"
import { MemoryGame } from "./memory-game"
import { Signoff } from "./signoff"
import "./footer.css"

/**
 * The end of every page of the Front: a line that says the page is over, then where to go next,
 * as a memory game whose pairs are the pages, a plain row of them for anyone who would rather not
 * play, and the site's signature.
 */
export function Footer({ page }: { page: PageId }) {
  const t = useTranslations("footer")
  return (
    <footer className="st-footer">
      <EndOfPage label={t("end")} />
      <Tile label={t("label")} icon={<SignpostIcon />} note={t("note")} size="md">
        <MemoryGame page={page} />
      </Tile>
      <Signoff />
    </footer>
  )
}

/**
 * Where the page stops and the footer starts: a dashed rule, and Abimaela's paw prints walking
 * across it toward the words, one after another when it comes into view.
 */
const PAWS = 4

function EndOfPage({ label }: { label: string }) {
  const reduce = useReducedMotion()
  const step = (index: number) => ({
    hidden: { opacity: reduce ? 0.7 : 0, scale: reduce ? 1 : 0.6 },
    shown: {
      opacity: 0.7,
      scale: 1,
      transition: { duration: reduce ? 0 : 0.25, delay: reduce ? 0 : index * 0.12 },
    },
  })
  const paws = (side: "left" | "right") => (
    <span className="st-ft-paws" data-side={side} aria-hidden>
      {Array.from({ length: PAWS }, (_, index) => (
        <motion.span
          key={index}
          className="st-ft-paw"
          // the left trail walks in toward the words, the right one walks out of them
          variants={step(side === "left" ? index : PAWS + 1 + index)}
        >
          <PawPrintIcon size={14} weight="fill" />
        </motion.span>
      ))}
    </span>
  )
  return (
    <motion.div
      className="st-ft-end"
      role="separator"
      aria-label={label}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.8 }}
    >
      <span className="st-ft-rule" aria-hidden />
      {paws("left")}
      <span className="st-ft-end-label text-mono-xs font-mono" aria-hidden>
        {label}
      </span>
      {paws("right")}
      <span className="st-ft-rule" aria-hidden />
    </motion.div>
  )
}
