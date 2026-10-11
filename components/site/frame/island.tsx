"use client"

import {
  BugBeetleIcon,
  MoonIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
  SunIcon,
} from "@phosphor-icons/react"
import dynamic from "next/dynamic"
import { useState } from "react"
import { Button } from "@/app/components/entrepta/button"
import { SegmentedControl } from "@/app/components/entrepta/segmented-control"
import { Tip } from "@/components/ui/tip"
import { setMuted, useMuted } from "@/lib/sound-muted"
import { useMode } from "@/hooks/use-mode"

// The report brings zod and the form with it, and most visits never open it: it loads on the
// first click, not with every page.
const BugReport = dynamic(
  () => import("@/components/site/bug/bug-report").then((module) => module.BugReport),
  { ssr: false },
)

/**
 * The mode change, as a curtain. The switch itself is entrepta's `toggleMode`, which wraps it in
 * a view transition; marking `<html>` for the length of it makes the new mode come down from
 * the top instead of crossfading (the keyframes are in site-frame.css). Reduced motion, and a
 * browser without view transitions, get entrepta's instant switch.
 */
function dropCurtain(toggle: () => void) {
  const root = document.documentElement
  root.dataset.stSwitch = "curtain"
  toggle()
  window.setTimeout(() => delete root.dataset.stSwitch, 1100)
}

export type Part = "front" | "back" | "ia"

export const PARTS: { value: Part; label: string }[] = [
  { value: "front", label: "Front" },
  { value: "back", label: "Back" },
  { value: "ia", label: "IA" },
]

/**
 * The header of the site: one pill floating over the page, with the three sides and three
 * actions, each an icon with its name in a tooltip. Report a bug opens the form, mute silences
 * the site, and the mode comes down like a curtain.
 *
 * `sides={false}` is for a page that is not part of the visit (an invite, the admin): the
 * actions stay, the switcher does not.
 */
export function Island({
  part,
  onSwap,
  sides = true,
}: {
  part: Part
  onSwap: (to: Part) => void
  sides?: boolean
}) {
  const [bugOpen, setBugOpen] = useState(false)
  // once opened it stays mounted, so closing can animate and what was typed is kept
  const [bugLoaded, setBugLoaded] = useState(false)
  const silenced = useMuted()
  const { mode, toggleMode } = useMode()
  const modeLabel = mode === "dark" ? "Light mode" : "Dark mode"

  return (
    <>
      <header className="st-island">
        {sides ? (
          <>
            <nav aria-label="Side of the site">
              <SegmentedControl
                aria-label="Side of the site"
                size="sm"
                options={PARTS}
                value={part}
                onValueChange={(value) => onSwap(value as Part)}
              />
            </nav>
            <i aria-hidden />
          </>
        ) : null}

        <div className="st-island-actions">
          <Tip label="Report a bug" side="bottom">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Report a bug"
              onClick={() => {
                setBugLoaded(true)
                setBugOpen(true)
              }}
            >
              <BugBeetleIcon aria-hidden size={16} />
            </Button>
          </Tip>
          <Tip label={silenced ? "Sound on" : "Mute"} side="bottom">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Mute the site"
              aria-pressed={silenced}
              onClick={() => setMuted(!silenced)}
            >
              {silenced ? (
                <SpeakerSlashIcon aria-hidden size={16} />
              ) : (
                <SpeakerHighIcon aria-hidden size={16} />
              )}
            </Button>
          </Tip>
          <Tip label={modeLabel} side="bottom">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={modeLabel}
              onClick={() => dropCurtain(toggleMode)}
            >
              {mode === "dark" ? (
                <SunIcon aria-hidden size={16} />
              ) : (
                <MoonIcon aria-hidden size={16} />
              )}
            </Button>
          </Tip>
        </div>
      </header>

      {bugLoaded ? <BugReport open={bugOpen} onOpenChange={setBugOpen} /> : null}
    </>
  )
}
