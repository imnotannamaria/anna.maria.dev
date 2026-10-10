"use client"

import { ArrowRightIcon, SignpostIcon } from "@phosphor-icons/react"
import { useEffect, useRef } from "react"
import { Button } from "@/app/components/entrepta/button"
import { Tile } from "../tile"
import { DESTINATIONS } from "../icons"
import type { PageId } from "../pages"
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
  const root = useRef<HTMLElement>(null)
  const index = DESTINATIONS.findIndex((destination) => destination.id === page)
  const next = DESTINATIONS[(index + 1) % DESTINATIONS.length]

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
      <Tile label="where to next" icon={<SignpostIcon />} note="point, she walks" size="md">
        <DoorGame key={page} destinations={DESTINATIONS} current={page} onGo={onGo} />

        <div className="st-ft-nav">
          <Button onClick={() => onGo(next.id)}>
            <span className="font-normal opacity-80">next:</span> {next.label}
            <ArrowRightIcon aria-hidden size={14} weight="bold" />
          </Button>
        </div>
      </Tile>
    </footer>
  )
}
