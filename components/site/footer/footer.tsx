"use client"

import {
  EnvelopeSimpleIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  SignpostIcon,
  XLogoIcon,
} from "@phosphor-icons/react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { ArrowLink } from "@/app/components/entrepta/arrow-link"
import icon from "@/app/icon.png"
import type { PageId } from "@/components/site/pages"
import { ScreenLink } from "@/components/site/screen-link"
import { Tile } from "@/components/site/tile"
import { siteConfig } from "@/lib/site-config"
import { MemoryGame } from "./memory-game"
import { usePlaces } from "./parts"
import { Signoff } from "./signoff"
import "./footer.css"

const ELSEWHERE = [
  { label: "GitHub", href: siteConfig.socials.github, Icon: GithubLogoIcon },
  { label: "LinkedIn", href: siteConfig.socials.linkedin, Icon: LinkedinLogoIcon },
  { label: "X", href: siteConfig.socials.x, Icon: XLogoIcon },
  { label: "Email", href: `mailto:${siteConfig.email}`, Icon: EnvelopeSimpleIcon },
] as const

/**
 * The end of every page of the Front. It is a footer, not more page: a band as wide as the
 * screen, on its own tinted ground under a brand line, with who made the site, the pages and
 * the places elsewhere in columns, the memory game whose pairs are the pages, and the site's
 * signature at the foot.
 */
export function Footer({ page }: { page: PageId }) {
  const t = useTranslations("footer")
  const places = usePlaces()
  return (
    <footer className="st-footer">
      <div className="st-ft-inner">
        <div className="st-ft-grid">
          <div className="st-ft-who">
            <div className="flex items-center gap-3">
              <Image
                src={icon}
                alt=""
                width={40}
                height={40}
                className="st-ft-icon"
                loading="lazy"
              />
              <p className="text-heading-lg m-0 font-serif text-[var(--fg-primary)]">
                {siteConfig.name}
              </p>
            </div>
            <p className="text-mono-sm m-0 font-mono text-[var(--fg-primary)]">{t("who")}</p>
            <p className="text-mono-sm m-0 font-mono text-[var(--fg-secondary)]">{t("about")}</p>
            <p className="text-mono-sm m-0 font-mono text-[var(--fg-muted)]">{t("built")}</p>
          </div>

          <nav aria-label={t("pages")} className="st-ft-col">
            <h2 className="st-ft-h text-mono-xs font-mono">{t("pages")}</h2>
            <ul>
              {places.map((place) => (
                <li key={place.id}>
                  <ArrowLink asChild className="text-[var(--fg-secondary)]">
                    <ScreenLink
                      to={place.id}
                      data-sound="click"
                      aria-current={place.id === page ? "page" : undefined}
                    >
                      {place.label}
                    </ScreenLink>
                  </ArrowLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t("elsewhere")} className="st-ft-col">
            <h2 className="st-ft-h text-mono-xs font-mono">{t("elsewhere")}</h2>
            <ul>
              {ELSEWHERE.map(({ label, href, Icon }) => (
                <li key={label}>
                  <ArrowLink
                    href={href}
                    external={href.startsWith("http")}
                    data-sound="click"
                    className="text-[var(--fg-secondary)]"
                  >
                    <Icon aria-hidden size={14} className="mr-1 text-[var(--fg-brand)]" />
                    {label}
                  </ArrowLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Tile label={t("label")} icon={<SignpostIcon />} note={t("note")} size="md">
          <MemoryGame page={page} />
        </Tile>

        <Signoff />
      </div>
    </footer>
  )
}
