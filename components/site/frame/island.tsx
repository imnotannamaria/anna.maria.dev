"use client"

import { pet } from "@/components/site/abimaela/abimaela"
import {
  BugBeetleIcon,
  MoonIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
  SunIcon,
} from "@phosphor-icons/react"
import { useLocale, useTranslations } from "next-intl"
import dynamic from "next/dynamic"
import { useState } from "react"
import { Button } from "@/app/components/entrepta/button"
import { SegmentedControl } from "@/app/components/entrepta/segmented-control"
import { Tip } from "@/components/ui/tip"
import { setMuted, useMuted } from "@/lib/sound-muted"
import { useSitePath } from "@/components/site/i18n"
import { Flag } from "@/components/wall/flag"
import { useMode } from "@/hooks/use-mode"
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_NAME,
  localePath,
  nextLocale,
  type Locale,
} from "@/lib/i18n/locales"

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

/**
 * The language, changed by hand: the choice goes in a cookie, so the next plain address opens
 * in it too, and the browser goes to the same page in the other language. A full load and not a
 * client navigation: the whole document changes language, `<html lang>` included.
 */
function switchLocale(to: Locale, path: string) {
  document.cookie = `${LOCALE_COOKIE}=${to}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`
  window.location.assign(localePath(to, path) + window.location.search + window.location.hash)
}

const FLAG = { en: "en", pt: "pt-BR" } as const

export type Part = "front" | "back" | "ia"

export const PARTS: { value: Part; label: string }[] = [
  { value: "front", label: "Front" },
  { value: "back", label: "Back" },
  { value: "ia", label: "IA" },
]

/**
 * The header of the site: one pill floating over the page, with the three sides and four
 * actions, each an icon with its name in a tooltip. Report a bug opens the form, mute silences
 * the site, the flag changes the language, and the mode comes down like a curtain.
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
  const t = useTranslations("island")
  const locale = useLocale()
  const other = nextLocale(locale)
  const path = useSitePath()
  const modeLabel = mode === "dark" ? t("light") : t("dark")

  return (
    <>
      <header className="st-island">
        {sides ? (
          <>
            <nav aria-label={t("sides")}>
              <SegmentedControl
                aria-label={t("sides")}
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
          <Tip label={t("bug")} side="bottom">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("bug")}
              onClick={() => {
                setBugLoaded(true)
                setBugOpen(true)
              }}
            >
              <BugBeetleIcon aria-hidden size={16} />
            </Button>
          </Tip>
          <Tip label={silenced ? t("soundOn") : t("mute")} side="bottom">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("muteLabel")}
              aria-pressed={silenced}
              onClick={() => {
                setMuted(!silenced)
                pet.notify(silenced ? "unmute" : "mute")
              }}
            >
              {silenced ? (
                <SpeakerSlashIcon aria-hidden size={16} />
              ) : (
                <SpeakerHighIcon aria-hidden size={16} />
              )}
            </Button>
          </Tip>
          {/* the flag is the language the page is in; a click goes to the next one */}
          <Tip label={LOCALE_NAME[locale]} side="bottom">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("language", { current: LOCALE_NAME[locale], next: LOCALE_NAME[other] })}
              onClick={() => switchLocale(other, path)}
            >
              <Flag lang={FLAG[locale]} size={17} decorative />
            </Button>
          </Tip>
          <Tip label={modeLabel} side="bottom">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={modeLabel}
              onClick={() => {
                dropCurtain(toggleMode)
                pet.notify(mode === "dark" ? "light" : "dark")
              }}
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
