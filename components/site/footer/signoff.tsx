"use client"

import { useTranslations } from "next-intl"
import { ArrowLink } from "@/app/components/entrepta/arrow-link"
import { siteConfig } from "@/lib/site-config"

/**
 * The last line of the site: "all rights reserved", with "reserved" struck for "forkable", as
 * the license line would read changed. The site is an open source template anyone can fork, and
 * the line ends in the real link to do it.
 */
const REPO = `https://github.com/${siteConfig.githubUser}/anna.maria.dev`

export function Signoff() {
  const t = useTranslations("footer.signoff")
  // the year is the visitor's; a page rendered on Dec 31 and read on Jan 1 is allowed to differ
  const by = `anna maria, ${new Date().getFullYear()}`

  return (
    <p className="st-ft-license text-mono-sm m-0 font-mono">
      <span suppressHydrationWarning>© {by}</span>
      <span aria-hidden> · </span>
      <span className="sr-only">{t("changes")}: </span>
      <span>
        {t("all")} <del>{t("out")}</del> <ins>{t("in")}</ins>
      </span>
      <span aria-hidden> · </span>
      <ArrowLink
        href={`${REPO}/fork`}
        external
        data-sound="click"
        className="text-[var(--fg-brand-text)]"
      >
        {t("fork")}
      </ArrowLink>
    </p>
  )
}
