"use client"

import { SignpostIcon } from "@phosphor-icons/react"
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
 * Where the page stops and the footer starts: a dashed rule with a strip of tape across it, the
 * words written on the tape. The same tape that holds things to the page elsewhere on the site.
 */
function EndOfPage({ label }: { label: string }) {
  return (
    <div className="st-ft-end" role="separator" aria-label={label}>
      <span className="st-ft-rule" aria-hidden />
      <span className="st-ft-tape text-mono-sm font-mono" aria-hidden>
        {label}
      </span>
      <span className="st-ft-rule" aria-hidden />
    </div>
  )
}
