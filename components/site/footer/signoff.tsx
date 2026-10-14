"use client"

import { ArrowUpRightIcon, GitForkIcon } from "@phosphor-icons/react"
import { motion, useReducedMotion } from "motion/react"
import { useTranslations } from "next-intl"
import { siteConfig } from "@/lib/site-config"
import "./signoff.css"

/**
 * The last line of the site: "all rights reserved", with "reserved" taken out for "forked", as a
 * diff of the license. The site is an open source template anyone can fork, and the line ends in
 * the real link to do it. The two changed lines come in one after the other when it is seen.
 */
const REPO = `https://github.com/${siteConfig.githubUser}/anna.maria.dev`

export function Signoff() {
  const t = useTranslations("footer.signoff")
  const reduce = useReducedMotion()
  const line = (delay: number) => ({
    initial: { opacity: reduce ? 1 : 0, x: reduce ? 0 : -8 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, amount: 0.6 },
    transition: { duration: reduce ? 0 : 0.35, delay: reduce ? 0 : delay },
  })
  // the year is the visitor's; a page rendered on Dec 31 and read on Jan 1 is allowed to differ
  const by = `anna maria, ${new Date().getFullYear()}`

  return (
    <div className="st-so">
      <div className="st-so-head text-mono-sm font-mono">
        <span className="flex items-center gap-2">
          <GitForkIcon aria-hidden size={14} />
          LICENSE
        </span>
        <span>
          <span className="sr-only">{t("changes")}</span>
          <span aria-hidden>
            <span className="text-[var(--status-success-fg)]">+1</span>{" "}
            <span className="text-[var(--status-error-fg)]">−1</span>
          </span>
        </span>
      </div>
      <div className="st-so-body text-mono-md font-mono">
        <motion.p className="st-so-line" {...line(0)}>
          <span className="st-so-n">1</span>
          <span className="st-so-sign"> </span>
          <span suppressHydrationWarning>© {by}</span>
        </motion.p>
        <motion.p className="st-so-line" data-kind="out" {...line(0.25)}>
          <span className="st-so-n">2</span>
          <span className="st-so-sign" aria-hidden>
            −
          </span>
          <span>
            {t("all")} <del>{t("out")}</del>
          </span>
        </motion.p>
        <motion.p className="st-so-line" data-kind="in" {...line(0.6)}>
          <span className="st-so-n">2</span>
          <span className="st-so-sign" aria-hidden>
            +
          </span>
          <span>
            {t("all")} <ins>{t("in")}</ins>
          </span>
        </motion.p>
      </div>
      <div className="st-so-foot">
        <a
          href={`${REPO}/fork`}
          target="_blank"
          rel="noreferrer noopener"
          data-sound="click"
          className="st-so-fork focus-ring text-mono-sm font-mono"
        >
          <GitForkIcon aria-hidden size={16} weight="bold" />
          {t("fork")}
          <ArrowUpRightIcon aria-hidden size={12} weight="bold" />
        </a>
      </div>
    </div>
  )
}
