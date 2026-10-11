"use client"

import { ArrowRightIcon, SignpostIcon } from "@phosphor-icons/react"
import { useTranslations } from "next-intl"
import { useEffect, useRef } from "react"
import { Button } from "@/app/components/entrepta/button"
import { Tile } from "@/components/site/tile"
import { DESTINATIONS } from "@/components/site/icons"
import type { PageId } from "@/components/site/pages"
import { DoorGame } from "./door-game"
import "./footer.css"

export function Footer({
  page,
  onGo,
  onVisible,
}: {
  page: PageId
  onGo: (id: PageId) => void

  onVisible: (visible: boolean) => void
}) {
  const t = useTranslations("footer")
  const pages = useTranslations("pages")
  const root = useRef<HTMLElement>(null)
  // the signs, named in the page's language
  const destinations = DESTINATIONS.map((destination) => ({
    ...destination,
    label: pages(`${destination.id}.label`),
    tagline: pages(`${destination.id}.tagline`),
  }))
  const index = destinations.findIndex((destination) => destination.id === page)
  const next = destinations[(index + 1) % destinations.length]

  useEffect(() => {
    const el = root.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => onVisible(entry.isIntersecting && entry.intersectionRatio > 0.2),
      { threshold: [0, 0.2, 0.5] },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      onVisible(false)
    }
  }, [onVisible])

  return (
    <footer ref={root} className="st-footer">
      <Tile label={t("label")} icon={<SignpostIcon />} note={t("note")} size="md">
        <DoorGame key={page} destinations={destinations} current={page} onGo={onGo} />

        <div className="st-ft-nav">
          <Button onClick={() => onGo(next.id)}>
            <span className="font-normal opacity-80">{t("next")}</span> {next.label}
            <ArrowRightIcon aria-hidden size={14} weight="bold" />
          </Button>
        </div>
      </Tile>
    </footer>
  )
}
