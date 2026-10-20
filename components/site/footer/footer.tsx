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
import { useId, type ReactNode } from "react"
import { ArrowLink } from "@/app/components/entrepta/arrow-link"
import icon from "@/app/icon.png"
import { SITE_CHANNELS, channelLinks, type ChannelId } from "@/components/site/channels"
import type { PageId } from "@/components/site/pages"
import { ScreenLink } from "@/components/site/screen-link"
import { Tile } from "@/components/site/tile"
import { calcYearsOfExp } from "@/lib/experience"
import { siteConfig } from "@/lib/site-config"
import { MemoryGame } from "./memory-game"
import { usePlaces } from "./parts"
import { Signoff } from "./signoff"
import "./footer.css"

const ICONS: Record<ChannelId, ReactNode> = {
  email: <EnvelopeSimpleIcon aria-hidden size={14} />,
  linkedin: <LinkedinLogoIcon aria-hidden size={14} />,
  github: <GithubLogoIcon aria-hidden size={14} />,
  x: <XLogoIcon aria-hidden size={14} />,
}

/**
 * The end of every page of the Front. It is a footer, not more page: a band as wide as the
 * screen, on its own tinted ground under a brand line, with who made the site, the pages and
 * the places elsewhere in columns, the memory game whose pairs are the pages, and the site's
 * signature at the foot.
 */
export function Footer({ page }: { page: PageId }) {
  const t = useTranslations("footer")
  const places = usePlaces()
  const pagesHeading = useId()
  const elsewhereHeading = useId()
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
            <p
              suppressHydrationWarning
              className="text-mono-sm m-0 font-mono text-[var(--fg-secondary)]"
            >
              {t("craft", { years: calcYearsOfExp() })}
            </p>
            <p className="text-mono-sm m-0 font-mono text-[var(--fg-secondary)]">{t("open")}</p>
            <p className="text-mono-sm m-0 font-mono text-[var(--fg-secondary)]">{t("sides")}</p>
            <p className="text-mono-sm m-0 font-mono text-[var(--fg-secondary)]">{t("cat")}</p>
            <p className="text-mono-sm m-0 font-mono text-[var(--fg-muted)]">{t("built")}</p>
          </div>

          <nav aria-labelledby={pagesHeading} className="st-ft-col">
            <h2 id={pagesHeading} className="st-ft-h text-mono-xs font-mono">
              {t("pages")}
            </h2>
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

          <nav aria-labelledby={elsewhereHeading} className="st-ft-col">
            <h2 id={elsewhereHeading} className="st-ft-h text-mono-xs font-mono">
              {t("elsewhere")}
            </h2>
            <ul>
              {channelLinks(SITE_CHANNELS).map(({ id, name, href }) => (
                <li key={id}>
                  <ArrowLink
                    href={href}
                    external={id !== "email"}
                    data-sound="click"
                    className="text-[var(--fg-secondary)]"
                  >
                    <span className="mr-1 text-[var(--fg-brand)]">{ICONS[id]}</span>
                    {name}
                  </ArrowLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Tile label={t("label")} icon={<SignpostIcon />} note={t("note")} size="md">
          <MemoryGame />
        </Tile>

        <Signoff />
      </div>
    </footer>
  )
}
